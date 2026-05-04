import type React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  ChevronRight,
  Users,
  Receipt,
  PiggyBank,
} from "lucide-react";
import { PartnerChip } from "@/components/PartnerChip";
import { CategoryIcon } from "@/components/CategoryIcon";
import { requireCouple } from "@/lib/session";
import {
  getMonthlySummary,
  getRecentTransactions,
  getPersonSummary,
} from "@/lib/db/transactions";
import { processRecurringForCouple } from "@/lib/db/recurring";
import { getActiveGoals } from "@/lib/db/savings";
import { getPinnedMemos } from "@/lib/db/memos";
import { GoalProgress } from "@/components/GoalProgress";
import { PinnedMemoCard } from "@/components/PinnedMemoCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Target } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { formatDate, currentYearMonth, txDisplay } from "@/lib/utils";

export default async function DashboardPage() {
  const couple = await requireCouple();

  // 페이지 진입 시 오늘 기준 처리되지 않은 고정비를 자동 등록
  await processRecurringForCouple(couple.id);

  const { year, month } = currentYearMonth();

  const [summary, recent, personSummary, activeGoals, pinnedMemos] =
    await Promise.all([
      getMonthlySummary(couple.id, year, month),
      getRecentTransactions(couple.id, 5),
      getPersonSummary(couple.id, year, month),
      getActiveGoals(couple.id, 3),
      getPinnedMemos(couple.id),
    ]);

  return (
    <AppLayout couple={couple}>
      <div className="space-y-6">
        {/* 이번 달 요약 */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-bold tracking-tight text-neutral-900">
                {year}년{" "}
                <span className="text-rose-500">{month}월</span>
              </p>
              <span className="text-xs text-neutral-400">요약</span>
            </div>
            <Link
              href="/transactions/new"
              className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
            >
              <Plus size={13} strokeWidth={2.5} /> 추가
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
              label="저금"
              amount={summary.savings}
              colorClass="text-blue-600"
              prefix="-"
              icon={PiggyBank}
            />
            <SummaryCard
              label="잔액"
              amount={Math.abs(summary.net)}
              colorClass={summary.net >= 0 ? "text-emerald-600" : "text-rose-600"}
              prefix={summary.net >= 0 ? "+" : "-"}
              icon={Minus}
            />
          </div>
        </section>

        {/* 이번 달 잔액 */}
        <section>
          <SectionHeader
            icon={Users}
            iconColor="text-rose-500"
            accentColor="bg-rose-400"
            title="이번 달 잔액"
            right={
              <Link
                href="/stats"
                className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
              >
                자세히 <ChevronRight size={12} />
              </Link>
            }
          />
          <div className="grid grid-cols-3 gap-2">
            <PartnerNetCard
              name={couple.partner_a_name}
              income={personSummary.a.income}
              expense={personSummary.a.expense}
              savings={personSummary.a.savings}
              tone="a"
            />
            <PartnerNetCard
              name={couple.partner_b_name}
              income={personSummary.b.income}
              expense={personSummary.b.expense}
              savings={personSummary.b.savings}
              tone="b"
            />
            <SharedExpenseCard
              income={personSummary.shared.income}
              expense={personSummary.shared.expense}
              savings={personSummary.shared.savings}
            />
          </div>
        </section>

        {/* 저축 목표 */}
        {activeGoals.length > 0 ? (
          <section>
            <SectionHeader
              icon={Target}
              iconColor="text-amber-500"
              accentColor="bg-amber-400"
              title="저축 목표"
              right={
                <Link
                  href="/goals"
                  className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
                >
                  전체보기 <ChevronRight size={12} />
                </Link>
              }
            />
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

        {/* 고정 메모 */}
        <PinnedMemoCard memos={pinnedMemos} couple={couple} />

        {/* 최근 거래 */}
        <section>
          <SectionHeader
            icon={Receipt}
            iconColor="text-indigo-500"
            accentColor="bg-indigo-400"
            title="최근 거래"
            right={
              <Link
                href="/transactions"
                className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
              >
                전체보기 <ChevronRight size={12} />
              </Link>
            }
          />

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
                        txDisplay(tx.type).textClass
                      }`}
                    >
                      {txDisplay(tx.type).sign}
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

function PartnerNetCard({
  name,
  income,
  expense,
  savings,
  tone,
}: {
  name: string;
  income: number;
  expense: number;
  savings: number;
  tone: "a" | "b";
}) {
  const balance = income - expense - savings;
  const containerClass = "border-neutral-100 bg-white";
  const nameClass = tone === "a" ? "text-sky-600" : "text-violet-600";
  const balanceClass = balance >= 0 ? "text-blue-600" : "text-rose-600";

  return (
    <div className={`rounded-xl border p-2.5 ${containerClass}`}>
      <p className={`truncate text-xs font-medium ${nameClass}`}>{name}</p>
      <div className="mt-1.5 space-y-0.5">
        <p className="text-[11px] tabular-nums text-emerald-600">
          +{income.toLocaleString("ko-KR")}
        </p>
        <p className="text-[11px] tabular-nums text-rose-600">
          -{expense.toLocaleString("ko-KR")}
        </p>
        <p className="text-[11px] tabular-nums text-blue-600">
          -{savings.toLocaleString("ko-KR")}{" "}
          <span className="text-neutral-400">저금</span>
        </p>
        <p
          className={`border-t border-neutral-200/60 pt-1 text-sm font-bold tabular-nums ${balanceClass}`}
        >
          {balance >= 0 ? "+" : ""}
          {balance.toLocaleString("ko-KR")}원
        </p>
      </div>
    </div>
  );
}

function SharedExpenseCard({
  income,
  expense,
  savings,
}: {
  income: number;
  expense: number;
  savings: number;
}) {
  // 공동도 사람 카드와 같은 식: balance = income - expense - savings
  const balance = income - expense - savings;
  const balanceClass = balance >= 0 ? "text-blue-600" : "text-rose-600";

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-2.5">
      <p className="flex items-center gap-1 truncate text-xs font-medium text-rose-600">
        <Users size={11} /> 공동
      </p>
      <div className="mt-1.5 space-y-0.5">
        <p className="text-[11px] tabular-nums text-emerald-600">
          +{income.toLocaleString("ko-KR")}
        </p>
        <p className="text-[11px] tabular-nums text-rose-600">
          -{expense.toLocaleString("ko-KR")}
        </p>
        <p className="text-[11px] tabular-nums text-blue-600">
          -{savings.toLocaleString("ko-KR")}{" "}
          <span className="text-neutral-400">저금</span>
        </p>
        <p
          className={`border-t border-neutral-200/60 pt-1 text-sm font-bold tabular-nums ${balanceClass}`}
        >
          {balance >= 0 ? "+" : ""}
          {balance.toLocaleString("ko-KR")}원
        </p>
      </div>
    </div>
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
