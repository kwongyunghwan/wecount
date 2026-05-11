"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCouple } from "@/lib/session";
import { processAccountAutoDeposits } from "@/lib/db/accounts";

function parseAccountFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || null;
  const monthly_amount = parseInt(
    String(formData.get("monthly_amount") ?? "0"),
    10,
  ) || 0;
  const day_of_month = parseInt(
    String(formData.get("day_of_month") ?? "1"),
    10,
  );
  return { name, color, monthly_amount, day_of_month };
}

export async function createAccount(formData: FormData) {
  const couple = await requireCouple();
  const fields = parseAccountFields(formData);
  if (!fields.name) redirect("/accounts/new?error=invalid");

  await supabaseAdmin.from("accounts").insert({
    couple_id: couple.id,
    ...fields,
  });

  // monthly_amount 설정된 계좌면 즉시 자동 입금 트리거
  if (fields.monthly_amount > 0) {
    await processAccountAutoDeposits(
      couple.id,
      couple.partner_a_name,
      couple.partner_b_name,
    );
  }

  redirect("/accounts");
}

export async function updateAccount(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const fields = parseAccountFields(formData);
  if (!id || !fields.name) redirect(`/accounts/${id}/edit?error=invalid`);

  await supabaseAdmin
    .from("accounts")
    .update(fields)
    .eq("id", id)
    .eq("couple_id", couple.id);

  // 수정 시에도 입금 일자가 오늘이거나 지났으면 즉시 처리
  if (fields.monthly_amount > 0) {
    await processAccountAutoDeposits(
      couple.id,
      couple.partner_a_name,
      couple.partner_b_name,
    );
  }

  redirect("/accounts");
}

export async function deleteAccount(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/accounts");

  await supabaseAdmin
    .from("accounts")
    .delete()
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect("/accounts");
}

/**
 * 계좌 입금
 * - account_deposits 입금 기록 추가
 * - split_half=true: A/B 절반씩 지출 거래 자동 생성
 * - split_half=false: paid_by 한 명에게 전액 지출 거래 자동 생성
 * - 모두 account_id 없이 → 개인 지출에 집계됨
 */
export async function depositToAccount(formData: FormData) {
  const couple = await requireCouple();
  const accountId = String(formData.get("account_id") ?? "");
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const occurred_at = String(formData.get("occurred_at") ?? "");
  const memo = String(formData.get("memo") ?? "").trim() || null;
  const splitHalf = formData.get("split_half") === "true";
  const paidBy = String(formData.get("paid_by") ?? "a") as "a" | "b";

  if (!accountId || !amount || amount <= 0 || !occurred_at) {
    redirect(`/accounts/${accountId}?error=invalid`);
  }

  // 계좌 이름 가져와서 메모에 사용
  const { data: account } = await supabaseAdmin
    .from("accounts")
    .select("name")
    .eq("id", accountId)
    .eq("couple_id", couple.id)
    .maybeSingle();

  const accountName = account?.name ?? "계좌";
  const depositMemo = memo
    ? `${accountName} 입금 · ${memo}`
    : `${accountName} 입금`;

  // 1) account_deposits 기록
  await supabaseAdmin.from("account_deposits").insert({
    account_id: accountId,
    amount,
    occurred_at,
    memo,
    is_auto: false,
  });

  // 2) 분담 방식에 따라 지출 거래 생성
  if (splitHalf) {
    const halfA = Math.floor(amount / 2);
    const halfB = amount - halfA;
    await supabaseAdmin.from("transactions").insert([
      {
        couple_id: couple.id,
        type: "expense",
        amount: halfA,
        occurred_at,
        paid_by: "a",
        is_shared: false,
        memo: depositMemo,
        category_id: null,
        account_id: null,
      },
      {
        couple_id: couple.id,
        type: "expense",
        amount: halfB,
        occurred_at,
        paid_by: "b",
        is_shared: false,
        memo: depositMemo,
        category_id: null,
        account_id: null,
      },
    ]);
  } else {
    await supabaseAdmin.from("transactions").insert({
      couple_id: couple.id,
      type: "expense",
      amount,
      occurred_at,
      paid_by: paidBy,
      is_shared: false,
      memo: depositMemo,
      category_id: null,
      account_id: null,
    });
  }

  redirect(`/accounts/${accountId}`);
}

/**
 * 계좌에서 지출
 * - transactions에 account_id 연결해서 추가
 * - account_id가 있는 거래는 개인/월 지출 집계에서 제외됨 (이중집계 방지)
 */
export async function spendFromAccount(formData: FormData) {
  const couple = await requireCouple();
  const accountId = String(formData.get("account_id") ?? "");
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const occurred_at = String(formData.get("occurred_at") ?? "");
  const memo = String(formData.get("memo") ?? "").trim() || null;
  const paid_by = String(formData.get("paid_by") ?? "a") as "a" | "b";
  const rawCategoryId = formData.get("category_id");
  const category_id =
    rawCategoryId && String(rawCategoryId).trim() !== ""
      ? String(rawCategoryId)
      : null;

  if (!accountId || !amount || amount <= 0 || !occurred_at) {
    redirect(`/accounts/${accountId}?error=invalid`);
  }

  await supabaseAdmin.from("transactions").insert({
    couple_id: couple.id,
    type: "expense",
    amount,
    occurred_at,
    paid_by,
    is_shared: false,
    memo,
    category_id,
    account_id: accountId,
  });

  redirect(`/accounts/${accountId}`);
}

/** 계좌에서 발생한 거래/입금 삭제 */
export async function deleteAccountDeposit(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const accountId = String(formData.get("account_id") ?? "");

  // 해당 계좌가 이 커플 소유인지 확인
  const { data: acc } = await supabaseAdmin
    .from("accounts")
    .select("id")
    .eq("id", accountId)
    .eq("couple_id", couple.id)
    .maybeSingle();
  if (!acc) redirect("/accounts");

  await supabaseAdmin.from("account_deposits").delete().eq("id", id).eq("account_id", accountId);

  redirect(`/accounts/${accountId}`);
}
