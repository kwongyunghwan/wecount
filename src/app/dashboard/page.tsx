import type React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ChevronRight,
  Users,
} from "lucide-react";
import {
  PartnerChip,
  PARTNER_TEXT_COLOR,
} from "@/components/PartnerChip";
import { CategoryIcon } from "@/components/CategoryIcon";
import { requireCouple } from "@/lib/session";
import {
  getMonthlySummary,
  getRecentTransactions,
  getPersonSummary,
} from "@/lib/db/transactions";
import { processRecurringForCouple } from "@/lib/db/recurring";
import { getActiveGoals } from "@/lib/db/savings";
import { GoalProgress } from "@/components/GoalProgress";
import { Target } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { formatDate, currentYearMonth } from "@/lib/utils";

export default async function DashboardPage() {
  const couple = await requireCouple();

  // 페이지 진입 시 오늘 기준 처리되지 않은 고정비를 자동 등록
  await processRecurringForCouple(couple.id);

  const { year, month } = currentYearMonth();

  const [summary, recent, personSummary, activeGoals] = await Promise.all([
    getMonthlySummary(couple.id, year, month),
    getRecentTransactions(couple.id, 5),
    getPersonSummary(couple.id, year, month),
    getActiveGoals(couple.id, 3),
  ]);

  return (
    <AppLayout couple={couple}>
      <div className="space-y-6">
        {/* 이번 달 요약 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">
              {year}년 {month}월
            </p>
            <Link
              href="/transactions/new"
              className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
            >
              <Plus size={13} strokeWidth={2.5} /> 추가
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard
              label="수입"
              amount={summary.income}
              colorClass="text-emerald-600"
              prefix="+"
              icon={TrendingUp}
            />
            <SummaryCard
              label="지출"
              amount={summary.expense}
              colorClass="text-rose-600"
              prefix="-"
              icon={TrendingDown}
            />
            <SummaryCard
              label="순수익"
              amount={Math.abs(summary.net)}
              colorClass={summary.net >= 0 ? "text-emerald-600" : "text-rose-600"}
              prefix={summary.net >= 0 ? "+" : "-"}
              icon={Minus}
            />
          </div>
        </section>

        {/* 사람별 지출 */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">이번 달 지출</p>
            <Link
              href="/stats"
              className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
            >
              자세히 <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
              <p className={`text-xs font-medium ${PARTNER_TEXT_COLOR.a}`}>
                {couple.partner_a_name}
              </p>
              <p className="mt-1 text-sm font-bold tabular-nums text-neutral-800">
                {personSummary.a.expense.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3">
              <p className={`text-xs font-medium ${PARTNER_TEXT_COLOR.b}`}>
                {couple.partner_b_name}
              </p>
              <p className="mt-1 text-sm font-bold tabular-nums text-neutral-800">
                {personSummary.b.expense.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
              <p className="flex items-center gap-1 text-xs font-medium text-rose-600">
                <Users size={11} /> 공동
              </p>
              <p className="mt-1 text-sm font-bold tabular-nums text-neutral-800">
                {personSummary.shared.expense.toLocaleString("ko-KR")}원
              </p>
            </div>
          </div>
        </section>

        {/* 저축 목표 */}
        {activeGoals.length > 0 ? (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Target size={14} className="text-rose-500" /> 저축 목표
              </p>
              <Link
                href="/goals"
                className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
              >
                전체보기 <ChevronRight size={12} />
              </Link>
            </div>
            <ul className="space-y-2">
              {activeGoals.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/goals/${g.id}`}
                    className="block rounded-xl border border-neutral-100 bg-white p-3 transition hover:bg-neutral-50"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: g.color ?? "#f43f5e" }}
                      />
                      <p className="truncate text-sm font-semibold">{g.name}</p>
                      {g.deadline ? (
                        <p className="ml-auto shrink-0 text-xs text-neutral-400">
                          ~ {g.deadline}
                        </p>
                      ) : null}
                    </div>
                    <GoalProgress
                      current={g.current_amount}
                      target={g.target_amount}
                      percent={g.percent}
                      color={g.color}
                      size="sm"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* 최근 거래 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">최근 거래</p>
            <Link
              href="/transactions"
              className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
            >
              전체보기 <ChevronRight size={12} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 py-10 text-center">
              <p className="text-sm text-neutral-400">
                아직 거래가 없어요.
                <br />첫 거래를 기록해보세요!
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((tx) => (
                <li key={tx.id}>
                  <Link
                    href={`/transactions/${tx.id}/edit`}
                    className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3 hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function SummaryCard({
  label,
  amount,
  colorClass,
  prefix,
  icon: Icon,
}: {
  label: string;
  amount: number;
  colorClass: string;
  prefix: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-3 text-center">
      <div className={`flex justify-center mb-1 ${colorClass}`}>
        <Icon size={14} />
      </div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-0.5 text-sm font-bold tabular-nums ${colorClass}`}>
        {prefix}
        {amount.toLocaleString("ko-KR")}원
      </p>
    </div>
  );
}
