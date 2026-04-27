import { requireCouple } from "@/lib/session";
import {
  getMonthlyTransactions,
  getMonthlySummary,
} from "@/lib/db/transactions";
import { TransactionsView } from "./TransactionsView";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const couple = await requireCouple();
  const { year: qYear, month: qMonth } = await searchParams;

  const now = new Date();
  const year = qYear ? parseInt(qYear) : now.getFullYear();
  const month = qMonth ? parseInt(qMonth) : now.getMonth() + 1;

  const [transactions, summary] = await Promise.all([
    getMonthlyTransactions(couple.id, year, month),
    getMonthlySummary(couple.id, year, month),
  ]);

  const prevMonth =
    month === 1
      ? { year: year - 1, month: 12 }
      : { year, month: month - 1 };
  const nextMonth =
    month === 12
      ? { year: year + 1, month: 1 }
      : { year, month: month + 1 };
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <TransactionsView
      couple={couple}
      transactions={transactions}
      summary={summary}
      year={year}
      month={month}
      prevMonth={prevMonth}
      nextMonth={nextMonth}
      isCurrentMonth={isCurrentMonth}
    />
  );
}
