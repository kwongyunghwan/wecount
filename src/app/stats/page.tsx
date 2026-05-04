import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { requireCouple, type Couple } from "@/lib/session";
import {
  getMonthlySummary,
  getPersonSummary,
  getCategoryBreakdown,
  getCategoryAmountsByMonth,
  type PersonSummary,
  type CategoryBreakdownRow,
} from "@/lib/db/transactions";
import { getCategories, type Category } from "@/lib/db/categories";
import { AppLayout } from "@/components/AppLayout";
import { StatsTabs } from "@/components/StatsTabs";
import { CategoryIcon } from "@/components/CategoryIcon";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const couple = await requireCouple();
  const { year: qYear, month: qMonth } = await searchParams;

  const now = new Date();
  const year = qYear ? parseInt(qYear) : now.getFullYear();
  const month = qMonth ? parseInt(qMonth) : now.getMonth() + 1;

  const prevMonth =
    month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const nextMonth =
    month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  const [
    summary,
    personSummary,
    expBreakdown,
    prevExpenseByCategory,
    allExpenseCategories,
  ] = await Promise.all([
    getMonthlySummary(couple.id, year, month),
    getPersonSummary(couple.id, year, month),
    getCategoryBreakdown(couple.id, year, month, "expense"),
    getCategoryAmountsByMonth(
      couple.id,
      prevMonth.year,
      prevMonth.month,
      "expense",
    ),
    getCategories(couple.id, "expense"),
  ]);

  const breakdownByCategoryId = new Map<string, CategoryBreakdownRow>();
  for (const row of expBreakdown) {
    if (row.categoryId) breakdownByCategoryId.set(row.categoryId, row);
  }

  return (
    <AppLayout couple={couple} title="통계">
      <StatsTabs active="month" year={year} month={month} />

      {/* 월 이동 */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href={`/stats?year=${prevMonth.year}&month=${prevMonth.month}`}
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
              : `/stats?year=${nextMonth.year}&month=${nextMonth.month}`
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

      <div className="space-y-6">
        {/* 합계 */}
        <section>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-neutral-100 bg-white p-3">
              <p className="text-xs text-neutral-500">수입</p>
              <p className="mt-1 text-sm font-bold tabular-nums text-emerald-600">
                +{summary.income.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white p-3">
              <p className="text-xs text-neutral-500">지출</p>
              <p className="mt-1 text-sm font-bold tabular-nums text-rose-600">
                -{summary.expense.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div className="rounded-xl border border-neutral-100 bg-white p-3">
              <p className="text-xs text-neutral-500">순수익</p>
              <p
                className={`mt-1 text-sm font-bold tabular-nums ${
                  summary.net >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {summary.net >= 0 ? "+" : ""}
                {summary.net.toLocaleString("ko-KR")}원
              </p>
            </div>
          </div>
        </section>

        {/* 사람별 비교 */}
        <PersonCompare
          personSummary={personSummary}
          couple={couple}
          type="expense"
          year={year}
          month={month}
        />
        <PersonCompare
          personSummary={personSummary}
          couple={couple}
          type="income"
          year={year}
          month={month}
        />

        {/* 카테고리별 지출 */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">카테고리별 지출</h2>
          {allExpenseCategories.length === 0 ? (
            <p className="text-sm text-neutral-400">카테고리가 없어요.</p>
          ) : (
            <ul className="space-y-3">
              {allExpenseCategories.map((cat) => {
                const row = breakdownByCategoryId.get(cat.id);
                const spent = row?.amount ?? 0;
                const prevSpent = prevExpenseByCategory.get(cat.id) ?? 0;
                if (spent === 0) return null;
                return (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    spent={spent}
                    prevSpent={prevSpent}
                  />
                );
              })}
              {/* 카테고리 없는 거래 */}
              {breakdownByCategoryId.has("__none__") || expBreakdown.find((r) => r.categoryId === null) ? (
                (() => {
                  const noneRow = expBreakdown.find((r) => r.categoryId === null);
                  if (!noneRow) return null;
                  return (
                    <li className="rounded-xl border border-neutral-100 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-500">
                          카테고리 없음
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-rose-600">
                          {noneRow.amount.toLocaleString("ko-KR")}원
                        </span>
                      </div>
                    </li>
                  );
                })()
              ) : null}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function PersonCompare({
  personSummary,
  couple,
  type,
  year,
  month,
}: {
  personSummary: PersonSummary;
  couple: Couple;
  type: "income" | "expense";
  year: number;
  month: number;
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
    return `/stats/list?year=${year}&month=${month}&payer=${payer}&type=${type}`;
  }

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      <div className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
        <PersonBar
          name={couple.partner_a_name}
          amount={personSummary.a[type]}
          max={max}
          barClass="bg-sky-400"
          detailHref={detailHref("a")}
        />
        <PersonBar
          name={couple.partner_b_name}
          amount={personSummary.b[type]}
          max={max}
          barClass="bg-violet-400"
          detailHref={detailHref("b")}
        />
        {showShared ? (
          <PersonBar
            name="공동"
            amount={personSummary.shared[type]}
            max={max}
            barClass="bg-rose-400"
            detailHref={detailHref("shared")}
          />
        ) : null}
      </div>
      <p className="mt-1.5 text-[10px] text-neutral-400">
        사람별 = 결제자 기준 합계. 공동은 함께 부담하기로 한 거래 합계 (사람별과
        일부 겹침).
      </p>
    </section>
  );
}

function PersonBar({
  name,
  amount,
  max,
  barClass,
  detailHref,
}: {
  name: string;
  amount: number;
  max: number;
  barClass: string;
  detailHref: string;
}) {
  const pct = max === 0 ? 0 : (amount / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium">{name}</span>
        <div className="flex items-center gap-1.5">
          <span className="tabular-nums text-neutral-700">
            {amount.toLocaleString("ko-KR")}원
          </span>
          <Link
            href={detailHref}
            aria-label={`${name} 자세히 보기`}
            className="text-neutral-300 transition hover:text-rose-500"
          >
            <ArrowRight size={14} />
          </Link>
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
  category,
  spent,
  prevSpent,
}: {
  category: Category;
  spent: number;
  prevSpent: number;
}) {
  let trend: { label: string; positive: boolean } | null = null;
  if (prevSpent > 0) {
    const changePct = ((spent - prevSpent) / prevSpent) * 100;
    if (Math.abs(changePct) >= 5) {
      trend = {
        label: `${changePct > 0 ? "+" : ""}${Math.round(changePct)}%`,
        positive: changePct < 0,
      };
    }
  }

  return (
    <li className="rounded-xl border border-neutral-100 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CategoryIcon name={category.name} color={category.color} />
          <span className="truncate text-sm font-medium">{category.name}</span>
          {trend ? (
            <span
              className={`flex shrink-0 items-center gap-0.5 text-[10px] font-semibold ${
                trend.positive ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {trend.positive ? (
                <TrendingDown size={10} />
              ) : (
                <TrendingUp size={10} />
              )}
              {trend.label}
            </span>
          ) : null}
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums">
          {spent.toLocaleString("ko-KR")}
          <span className="ml-0.5 text-xs text-neutral-400">원</span>
        </p>
      </div>
    </li>
  );
}
