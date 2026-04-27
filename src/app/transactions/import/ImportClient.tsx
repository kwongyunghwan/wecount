"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { FileInput } from "@/components/FileInput";
import {
  importTransactions,
  type ImportResult,
} from "@/app/actions/import";

const INITIAL: ImportResult = { kind: "idle" };

export function ImportClient() {
  const [state, formAction, pending] = useActionState(
    importTransactions,
    INITIAL,
  );

  return (
    <div className="space-y-3">
      {state.kind === "success" ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-start gap-2">
            <CheckCircle2
              size={18}
              className="shrink-0 text-emerald-500 mt-0.5"
            />
            <div className="flex-1 text-sm">
              <p className="font-medium text-emerald-700">
                {state.ok}개 거래가 추가됐어요.
              </p>
              {state.skipped.length > 0 ? (
                <p className="mt-1 text-xs text-emerald-600">
                  총 {state.total}개 행 중 {state.skipped.length}개를 건너뛰었어요.
                </p>
              ) : null}
              <Link
                href="/transactions"
                className="mt-2 inline-block text-xs font-semibold text-emerald-700 underline"
              >
                거래 목록 보기 →
              </Link>
            </div>
          </div>

          {/* 건너뛴 행 디버깅 정보 */}
          {state.skipped.length > 0 ? (
            <details className="mt-3 border-t border-emerald-200 pt-3">
              <summary className="flex cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-emerald-700">
                <span className="flex items-center gap-1">
                  <ChevronDown size={12} />
                  건너뛴 {state.skipped.length}개 행 자세히 보기
                </span>
              </summary>
              <ul className="mt-2 space-y-1.5 text-xs">
                {state.skipped.map((s) => (
                  <li
                    key={s.row}
                    className="rounded-lg border border-emerald-200 bg-white p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-rose-600">
                        {s.row}행
                      </span>
                      <span className="text-rose-600">{s.reason}</span>
                    </div>
                    <p className="mt-0.5 truncate text-neutral-500">
                      {s.preview}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-neutral-500">
                * 행 번호는 엑셀에서의 실제 행 번호 (헤더가 1행, 데이터는 2행부터)
              </p>
            </details>
          ) : null}
        </div>
      ) : null}

      {state.kind === "error" ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-4">
          <AlertCircle
            size={18}
            className="shrink-0 text-rose-500 mt-0.5"
          />
          <p className="text-sm text-rose-700">{state.message}</p>
        </div>
      ) : null}

      <form action={formAction} className="space-y-3">
        <FileInput
          name="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> 불러오는 중...
            </>
          ) : (
            "불러오기"
          )}
        </button>
      </form>
    </div>
  );
}
