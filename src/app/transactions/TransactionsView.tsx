"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { ConfirmButton } from "@/components/ConfirmButton";
import { PartnerChip } from "@/components/PartnerChip";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatDate } from "@/lib/utils";
import {
  deleteTransactions,
  deleteAllInMonth,
} from "@/app/actions/transaction";
import type { Couple } from "@/lib/session";
import type { Transaction, MonthlySummary } from "@/lib/db/transactions";

type Props = {
  couple: Couple;
  transactions: Transaction[];
  summary: MonthlySummary;
  year: number;
  month: number;
  prevMonth: { year: number; month: number };
  nextMonth: { year: number; month: number };
  isCurrentMonth: boolean;
};

export function TransactionsView({
  couple,
  transactions,
  summary,
  year,
  month,
  prevMonth,
  nextMonth,
  isCurrentMonth,
}: Props) {
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const returnTo = `/transactions?year=${year}&month=${month}`;
  const allSelected =
    transactions.length > 0 && selected.size === transactions.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(transactions.map((t) => t.id)));
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  return (
    <div className="mx-auto flex w-full max-w-md min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="shrink-0 text-neutral-500 hover:text-neutral-700"
          >
            <ChevronLeft size={22} />
          </Link>
          <p className="flex-1 font-semibold">거래 내역</p>

          {selectMode ? (
            <button
              type="button"
              onClick={exitSelectMode}
              aria-label="취소"
              className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
            >
              <X size={13} /> 취소
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectMode(true)}
                disabled={transactions.length === 0}
                className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={13} /> 삭제
              </button>
              <Link
                href="/transactions/new"
                className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
              >
                <Plus size={13} strokeWidth={2.5} /> 추가
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-4">
        {/* 월 이동 */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/transactions?year=${prevMonth.year}&month=${prevMonth.month}`}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronLeft size={20} />
          </Link>
          <p className="text-sm font-semibold">
            {year}년 {month}월
          </p>
          <Link
            href={
              isCurrentMonth
                ? "#"
                : `/transactions?year=${nextMonth.year}&month=${nextMonth.month}`
            }
            className={`rounded-lg p-1.5 ${
              isCurrentMonth
                ? "pointer-events-none text-neutral-300"
                : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            <ChevronRight size={20} />
          </Link>
        </div>

        {/* 합계 */}
        <div className="mb-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
            <p className="text-xs text-neutral-500">수입</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-emerald-600">
              +{summary.income.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
            <p className="text-xs text-neutral-500">지출</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-rose-600">
              -{summary.expense.toLocaleString("ko-KR")}원
            </p>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
            <p className="text-xs text-neutral-500">순수익</p>
            <p
              className={`mt-0.5 text-sm font-bold tabular-nums ${
                summary.net >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {summary.net >= 0 ? "+" : ""}
              {summary.net.toLocaleString("ko-KR")}원
            </p>
          </div>
        </div>

        {/* 선택 모드 액션 바 */}
        {selectMode && transactions.length > 0 ? (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-rose-100 bg-rose-50/60 p-2">
            <label className="flex cursor-pointer items-center gap-2 px-2 text-xs font-medium text-neutral-700">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-neutral-300 text-rose-500 focus:ring-rose-400"
              />
              전체 선택 ({selected.size}/{transactions.length})
            </label>
            <div className="flex items-center gap-1.5">
              <form action={deleteTransactions}>
                {Array.from(selected).map((id) => (
                  <input key={id} type="hidden" name="ids" value={id} />
                ))}
                <input type="hidden" name="returnTo" value={returnTo} />
                <ConfirmButton
                  type="submit"
                  disabled={selected.size === 0}
                  message={`선택한 ${selected.size}개 거래를 삭제할까요?`}
                  className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  선택 삭제
                </ConfirmButton>
              </form>
              <form action={deleteAllInMonth}>
                <input type="hidden" name="year" value={year} />
                <input type="hidden" name="month" value={month} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <ConfirmButton
                  type="submit"
                  message={`${year}년 ${month}월 전체 거래(${transactions.length}건)를 삭제할까요? 되돌릴 수 없어요.`}
                  className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  전체 삭제
                </ConfirmButton>
              </form>
            </div>
          </div>
        ) : null}

        {/* 거래 목록 */}
        {transactions.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-neutral-500">이번 달 거래가 없어요.</p>
            <Link
              href="/transactions/new"
              className="mt-4 inline-block rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
            >
              거래 추가하기
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => {
              const checked = selected.has(tx.id);
              const inner = (
                <>
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIcon
                      name={tx.categories?.name}
                      color={tx.categories?.color}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium">
                          {tx.categories?.name ?? "카테고리 없음"}
                        </p>
                        {tx.is_shared ? (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
                            <Users size={9} /> 공동
                          </span>
                        ) : (
                          <PartnerChip
                            partner={tx.paid_by}
                            name={
                              tx.paid_by === "a"
                                ? couple.partner_a_name
                                : couple.partner_b_name
                            }
                          />
                        )}
                      </div>
                      <p className="truncate text-xs text-neutral-500">
                        {formatDate(tx.occurred_at)}
                        {tx.memo ? ` · ${tx.memo}` : ""}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`ml-2 shrink-0 text-sm font-semibold tabular-nums ${
                      tx.type === "income"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {tx.amount.toLocaleString("ko-KR")}원
                  </p>
                </>
              );

              return (
                <li key={tx.id}>
                  <div
                    className={`flex items-center gap-2 rounded-xl border p-3 transition ${
                      selectMode && checked
                        ? "border-rose-200 bg-rose-50/40"
                        : "border-neutral-100 bg-white hover:bg-neutral-50"
                    }`}
                  >
                    {selectMode ? (
                      <>
                        <label className="flex shrink-0 cursor-pointer items-center justify-center p-1 -m-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOne(tx.id)}
                            className="h-4 w-4 rounded border-neutral-300 text-rose-500 focus:ring-rose-400 cursor-pointer"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleOne(tx.id)}
                          className="flex flex-1 items-center justify-between min-w-0 text-left"
                        >
                          {inner}
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`/transactions/${tx.id}/edit`}
                        className="flex flex-1 items-center justify-between min-w-0"
                      >
                        {inner}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <NavBar />
    </div>
  );
}
