import Link from "next/link";
import { ChevronLeft, ChevronRight, Users, ArrowRight } from "lucide-react";
import { requireCouple, type Couple } from "@/lib/session";
import {
  getYearlyMonthBreakdown,
  getYearlyPersonSummary,
  getYearlyCategoryBreakdown,
  type MonthBreakdown,
  type PersonSummary,
  type CategoryBreakdownRow,
} from "@/lib/db/transactions";
import { AppLayout } from "@/components/AppLayout";
import { StatsTabs } from "@/components/StatsTabs";
import { PARTNER_TEXT_COLOR } from "@/components/PartnerChip";
import { CategoryIcon } from "@/components/CategoryIcon";

export default async function YearlyStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const couple = await requireCouple();
  const { year: qYear } = await searchParams;

  const now = new Date();
  const year = qYear ? parseInt(qYear) : now.getFullYear();
  const isCurrentYear = year === now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [months, personSummary, expBreakdown, incomeBreakdown] =
    await Promise.all([
      getYearlyMonthBreakdown(couple.id, year),
      getYearlyPersonSummary(couple.id, year),
      getYearlyCategoryBreakdown(couple.id, year, "expense"),
      getYearlyCategoryBreakdown(couple.id, year, "income"),
    ]);

  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpense = months.reduce((s, m) => s + m.expense, 0);
  const net = totalIncome - totalExpense;

  // 월평균 (1월부터 현재 월까지 평균, 과거 년도는 12월까지)
  const elapsedMonths = isCurrentYear ? currentMonth : 12;
  const avgExpense = Math.round(totalExpense / Math.max(1, elapsedMonths));

  return (
    <AppLayout couple={couple} title="통계">
      <StatsTabs active="year" year={year} month={now.getMonth() + 1} />

      {/* 년도 이동 */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href={`/stats/year?year=${year - 1}`}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
        >
          <ChevronLeft size={20} />
        </Link>
        <p className="text-sm font-semibold">{year}년</p>
        <Link
          href={isCurrentYear ? "#" : `/stats/year?year=${year + 1}`}
          className={`rounded-lg p-1.5 ${
            isCurrentYear
              ? "pointer-events-none text-neutral-300"
              : "text-neutral-500 hover:bg-neutral-100"
          }`}
        >
          <ChevronRight size={20} />
        </Link>
      </div>

      <div className="space-y-6">
        {/* 1년 합계 */}
        <section>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-neutral-100 bg-white p-3">
              <p className="text-xs text-neutral-500">수입</p>
              <p className="mt-1 text-sm font-bold tabular-nums text-emerald-600">
                +{totalIncome.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white p-3">
              <p className="text-xs text-neutral-500">지출</p>
              <p className="mt-1 text-sm font-bold tabular-nums text-rose-600">
                -{totalExpense.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white p-3">
              <p className="text-xs text-neutral-500">순수익</p>
              <p
                className={`mt-1 text-sm font-bold tabular-nums ${
                  net >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {net >= 0 ? "+" : ""}
                {net.toLocaleString("ko-KR")}원
              </p>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-neutral-500">
            월평균 지출 약{" "}
            <span className="font-semibold text-rose-600">
              {avgExpense.toLocaleString("ko-KR")}원
            </span>
          </p>
        </section>

        {/* 월별 추이 */}
        <MonthlyTrend months={months} year={year} />

        {/* 사람별 1년 지출/수입 */}
        <PersonYearlyCompare
          personSummary={personSummary}
          couple={couple}
          type="expense"
          year={year}
        />
        <PersonYearlyCompare
          personSummary={personSummary}
          couple={couple}
          type="income"
          year={year}
        />

        {/* 카테고리별 1년 지출 */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">카테고리별 지출</h2>
          {expBreakdown.length === 0 ? (
            <p className="text-sm text-neutral-400">지출 거래가 없어요.</p>
          ) : (
            <ul className="space-y-2">
              {expBreakdown.map((row) => (
                <CategoryRow
                  key={row.categoryId ?? "__none__"}
                  row={row}
                  total={totalExpense}
                />
              ))}
            </ul>
          )}
        </section>

        {/* 카테고리별 1년 수입 */}
        {incomeBreakdown.length > 0 ? (
          <section>
            <h2 className="mb-3 text-sm font-semibold">카테고리별 수입</h2>
            <ul className="space-y-2">
              {incomeBreakdown.map((row) => (
                <CategoryRow
                  key={row.categoryId ?? "__none__"}
                  row={row}
                  total={totalIncome}
                  income
                />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}

function MonthlyTrend({
  months,
  year,
}: {
  months: MonthBreakdown[];
  year: number;
}) {
  const max = Math.max(
    ...months.map((m) => Math.max(m.income, m.expense)),
    1,
  );
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">월별 추이</h2>
      <div className="rounded-xl border border-neutral-100 bg-white p-4">
        <div className="grid grid-cols-12 gap-1.5">
          {months.map((m) => {
            const expensePct = max === 0 ? 0 : (m.expense / max) * 100;
            const incomePct = max === 0 ? 0 : (m.income / max) * 100;
            return (
              <Link
                key={m.month}
                href={`/stats?year=${year}&month=${m.month}`}
                className="group flex flex-col items-center gap-1"
              >
                <div className="flex h-28 w-full items-end gap-0.5">
                  <div className="flex h-full w-1/2 flex-col justify-end">
                    <div
                      className="rounded-t bg-emerald-300 transition group-hover:bg-emerald-400"
                      style={{ height: `${incomePct}%` }}
                    />
                  </div>
                  <div className="flex h-full w-1/2 flex-col justify-end">
                    <div
                      className="rounded-t bg-rose-300 transition group-hover:bg-rose-400"
                      style={{ height: `${expensePct}%` }}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500">{m.month}</p>
              </Link>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="h-2 w-2 rounded-sm bg-emerald-300" /> 수입
          </span>
          <span className="flex items-center gap-1 text-rose-600">
            <span className="h-2 w-2 rounded-sm bg-rose-300" /> 지출
          </span>
        </div>
      </div>
    </section>
  );
}

function PersonYearlyCompare({
  personSummary,
  couple,
  type,
  year,
}: {
  personSummary: PersonSummary;
  couple: Couple;
  type: "income" | "expense";
  year: number;
}) {
  const max = Math.max(
    personSummary.a[type],
    personSummary.b[type],
    personSummary.shared[type],
    1,
  );
  const title = type === "expense" ? "지출 분포" : "수입 분포";
  const showShared = personSummary.shared[type] > 0;

  function detailHref(payer: "a" | "b" | "shared") {
    return `/stats/list?year=${year}&payer=${payer}&type=${type}`;
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
        <Bar
          name={couple.partner_a_name}
          amount={personSummary.a[type]}
          max={max}
          barClass="bg-sky-400"
          textClass={PARTNER_TEXT_COLOR.a}
          detailHref={detailHref("a")}
        />
        <Bar
          name={couple.partner_b_name}
          amount={personSummary.b[type]}
          max={max}
          barClass="bg-violet-400"
          textClass={PARTNER_TEXT_COLOR.b}
          detailHref={detailHref("b")}
        />
        {showShared ? (
          <Bar
            name="공동"
            icon={<Users size={11} />}
            amount={personSummary.shared[type]}
            max={max}
            barClass="bg-rose-400"
            textClass="text-rose-600"
            detailHref={detailHref("shared")}
          />
        ) : null}
      </div>
    </section>
  );
}

function Bar({
  name,
  amount,
  max,
  barClass,
  textClass,
  icon,
  detailHref,
}: {
  name: string;
  amount: number;
  max: number;
  barClass: string;
  textClass: string;
  icon?: React.ReactNode;
  detailHref?: string;
}) {
  const pct = max === 0 ? 0 : (amount / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className={`flex items-center gap-1 font-medium ${textClass}`}>
          {icon}
          {name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="tabular-nums text-neutral-700">
            {amount.toLocaleString("ko-KR")}원
          </span>
          {detailHref ? (
            <Link
              href={detailHref}
              aria-label={`${name} 자세히 보기`}
              className="text-neutral-300 transition hover:text-rose-500"
            >
              <ArrowRight size={14} />
            </Link>
          ) : null}
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CategoryRow({
  row,
  total,
  income,
}: {
  row: CategoryBreakdownRow;
  total: number;
  income?: boolean;
}) {
  const pct = total === 0 ? 0 : (row.amount / total) * 100;
  const colorClass = income ? "text-emerald-600" : "text-rose-600";
  const barClass = income ? "bg-emerald-300" : "bg-rose-300";
  return (
    <li className="rounded-xl border border-neutral-100 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CategoryIcon name={row.name} color={row.color} />
          <span className="truncate text-sm font-medium">{row.name}</span>
          <span className="shrink-0 text-xs text-neutral-400">
            {Math.round(pct)}%
          </span>
        </div>
        <p className={`shrink-0 text-sm font-bold tabular-nums ${colorClass}`}>
          {income ? "+" : "-"}
          {row.amount.toLocaleString("ko-KR")}원
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}
