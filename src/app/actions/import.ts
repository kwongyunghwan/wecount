"use server";

import * as XLSX from "xlsx";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCouple } from "@/lib/session";

type RawRow = Record<string, unknown>;

export type SkippedRow = {
  row: number;
  reason: string;
  preview: string;
};

export type ImportResult =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; ok: number; skipped: SkippedRow[]; total: number };

function pickCol(row: RawRow, ...keys: string[]): unknown {
  for (const k of keys) {
    if (k in row && row[k] !== null && row[k] !== "") return row[k];
  }
  return null;
}

function normalize(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

/** 결제자 셀 값이 파트너 이름과 비슷한지 (부분 문자열 매칭) */
function matchesPartnerName(payer: string, partnerName: string): boolean {
  if (!payer || !partnerName) return false;
  const p = normalize(payer);
  const t = normalize(partnerName);
  return p.includes(t) || t.includes(p);
}

function parseAmountSigned(v: unknown): number | null {
  if (typeof v === "number") {
    if (v === 0 || isNaN(v)) return null;
    return v;
  }
  const str = String(v ?? "")
    .replace(/[^0-9.\-]/g, "")
    .trim();
  if (!str) return null;
  const n = parseFloat(str);
  if (isNaN(n) || n === 0) return null;
  return n;
}

function parseDate(v: unknown): string | null {
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return null;
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return null;
  }
  if (typeof v === "number") {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = epoch.getTime() + v * 24 * 60 * 60 * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return null;
}

function rowPreview(row: RawRow): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(row)) {
    if (v === null || v === "") continue;
    let str = v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
    if (str.length > 20) str = str.slice(0, 20) + "…";
    parts.push(`${k}: ${str}`);
    if (parts.length >= 3) break;
  }
  if (parts.length === 0) return "(빈 행)";
  return parts.join(", ");
}

export async function importTransactions(
  _prev: ImportResult,
  formData: FormData,
): Promise<ImportResult> {
  const couple = await requireCouple();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return { kind: "error", message: "파일을 선택해주세요." };
  }

  let rows: RawRow[];
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { kind: "error", message: "엑셀에 시트가 없어요." };
    }
    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: null });
  } catch {
    return {
      kind: "error",
      message: "파일을 읽지 못했어요. 엑셀 파일(.xlsx)인지 확인해주세요.",
    };
  }

  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("id, name, type")
    .eq("couple_id", couple.id);

  const catByName = new Map<
    string,
    { id: string; type: "income" | "expense" }
  >();
  for (const c of (categories ?? []) as Array<{
    id: string;
    name: string;
    type: "income" | "expense";
  }>) {
    catByName.set(`${c.type}::${c.name}`, { id: c.id, type: c.type });
  }

  type Insert = {
    couple_id: string;
    type: "income" | "expense";
    amount: number;
    occurred_at: string;
    category_id: string | null;
    memo: string | null;
    paid_by: "a" | "b";
    is_shared: boolean;
  };

  const inserts: Insert[] = [];
  const skipped: SkippedRow[] = [];

  rows.forEach((row, i) => {
    // 엑셀 행 번호: 1행은 헤더, 데이터는 2행부터
    const rowNum = i + 2;
    const preview = rowPreview(row);

    const signed = parseAmountSigned(
      pickCol(row, "거래금액", "금액", "amount"),
    );
    if (signed === null) {
      skipped.push({
        row: rowNum,
        reason: "거래금액이 비어 있거나 0",
        preview,
      });
      return;
    }

    const type: "income" | "expense" = signed > 0 ? "income" : "expense";
    const amount = Math.round(Math.abs(signed));
    if (amount <= 0) {
      skipped.push({ row: rowNum, reason: "금액이 0 이하", preview });
      return;
    }

    // 결제자 사전 체크: 결제자가 "저축금고"이면 양수(입금)만 등록
    const payerRaw = String(
      pickCol(row, "결제자", "결제", "사용자", "payer") ?? "",
    ).trim();
    if (normalize(payerRaw).includes("저축금고") && type === "expense") {
      skipped.push({
        row: rowNum,
        reason: "저축금고 출금 — 제외",
        preview,
      });
      return;
    }

    const occurred_at = parseDate(
      pickCol(row, "거래일시", "날짜", "거래일", "일자", "date"),
    );
    if (!occurred_at) {
      skipped.push({
        row: rowNum,
        reason: "거래일시가 비어 있거나 인식 불가 형식",
        preview,
      });
      return;
    }

    const catNameRaw = pickCol(row, "카테고리", "category");
    const catName = catNameRaw ? String(catNameRaw).trim() : "";
    const cat = catName ? catByName.get(`${type}::${catName}`) : undefined;

    const memoRaw = pickCol(row, "메모", "이름", "내역", "적요", "memo");
    const memo = memoRaw ? String(memoRaw).trim().slice(0, 100) : null;

    const payerStr = String(
      pickCol(row, "결제자", "결제", "사용자", "payer") ?? "",
    ).trim();
    const sharedStr = String(
      pickCol(row, "공동/개인", "구분2", "shared") ?? "",
    ).trim();

    const isShortA = payerStr.toLowerCase() === "a";
    const isShortB = payerStr.toLowerCase() === "b";
    const matchesA =
      payerStr !== "" &&
      (isShortA || matchesPartnerName(payerStr, couple.partner_a_name));
    const matchesB =
      payerStr !== "" &&
      (isShortB || matchesPartnerName(payerStr, couple.partner_b_name));

    let paid_by: "a" | "b" = "a";
    let is_shared: boolean;

    if (sharedStr) {
      // 공동/개인 컬럼이 명시된 경우 그 값 우선 + 결제자에서 사람 매칭
      is_shared = sharedStr !== "개인";
      if (matchesB && !matchesA) paid_by = "b";
      else if (matchesA) paid_by = "a";
    } else if (matchesA && !matchesB) {
      // 결제자가 A 이름과만 비슷 → A의 개인 거래
      paid_by = "a";
      is_shared = false;
    } else if (matchesB && !matchesA) {
      // 결제자가 B 이름과만 비슷 → B의 개인 거래
      paid_by = "b";
      is_shared = false;
    } else {
      // 결제자가 비어 있거나, 양쪽 다 매칭/미매칭 → 공동
      is_shared = true;
    }

    inserts.push({
      couple_id: couple.id,
      type,
      amount,
      occurred_at,
      category_id: cat?.id ?? null,
      memo,
      paid_by,
      is_shared,
    });
  });

  if (inserts.length > 0) {
    const CHUNK = 500;
    for (let i = 0; i < inserts.length; i += CHUNK) {
      await supabaseAdmin
        .from("transactions")
        .insert(inserts.slice(i, i + CHUNK));
    }
  }

  return {
    kind: "success",
    ok: inserts.length,
    skipped,
    total: rows.length,
  };
}
