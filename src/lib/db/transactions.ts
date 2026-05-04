import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type PaidBy = "a" | "b";

export type TransactionType = "income" | "expense" | "savings";

export type Transaction = {
  id: string;
  couple_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  memo: string | null;
  occurred_at: string;
  created_at: string;
  paid_by: PaidBy;
  is_shared: boolean;
  categories: { id: string; name: string; color: string | null } | null;
};

export type MonthlySummary = {
  income: number;
  expense: number;
  savings: number;
  /** 잔액 = income - expense - savings */
  net: number;
};

export type PersonAmounts = {
  income: number;
  expense: number;
  savings: number;
};

export type PersonSummary = {
  a: PersonAmounts;
  b: PersonAmounts;
  shared: PersonAmounts;
};

export type CategoryBreakdownRow = {
  categoryId: string | null;
  name: string;
  color: string | null;
  amount: number;
  percentage: number;
};

const SELECT_COLS =
  "id, couple_id, category_id, type, amount, memo, occurred_at, created_at, paid_by, is_shared, categories(id, name, color)";

function monthRange(year: number, month: number): [string, string] {
  const m = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  return [`${year}-${m}-01`, `${year}-${m}-${String(lastDay).padStart(2, "0")}`];
}

export type TxFilter = {
  year: number;
  /** 없으면 1년 전체 */
  month?: number;
  /** 'a'|'b' = 그 사람 개인, 'shared' = 공동 */
  payer?: "a" | "b" | "shared";
  type?: "income" | "expense" | "savings";
};

export async function getTransactionsByFilter(
  coupleId: string,
  f: TxFilter,
): Promise<Transaction[]> {
  let q = supabaseAdmin
    .from("transactions")
    .select(SELECT_COLS)
    .eq("couple_id", coupleId);

  if (f.month) {
    const [from, to] = monthRange(f.year, f.month);
    q = q.gte("occurred_at", from).lte("occurred_at", to);
  } else {
    q = q.gte("occurred_at", `${f.year}-01-01`).lte("occurred_at", `${f.year}-12-31`);
  }

  if (f.type) q = q.eq("type", f.type);

  if (f.payer === "shared") {
    q = q.eq("is_shared", true);
  } else if (f.payer === "a" || f.payer === "b") {
    q = q.eq("paid_by", f.payer).eq("is_shared", false);
  }

  q = q
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Transaction[];
}

export async function getMonthlyTransactions(
  coupleId: string,
  year: number,
  month: number,
): Promise<Transaction[]> {
  const [from, to] = monthRange(year, month);
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select(SELECT_COLS)
    .eq("couple_id", coupleId)
    .gte("occurred_at", from)
    .lte("occurred_at", to)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as Transaction[];
}

export async function getRecentTransactions(
  coupleId: string,
  limit = 5,
): Promise<Transaction[]> {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select(SELECT_COLS)
    .eq("couple_id", coupleId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as Transaction[];
}

export async function getTransaction(
  coupleId: string,
  id: string,
): Promise<Transaction | null> {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select(SELECT_COLS)
    .eq("couple_id", coupleId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Transaction | null;
}

export async function getMonthlySummary(
  coupleId: string,
  year: number,
  month: number,
): Promise<MonthlySummary> {
  const [from, to] = monthRange(year, month);
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("type, amount")
    .eq("couple_id", coupleId)
    .gte("occurred_at", from)
    .lte("occurred_at", to);

  if (error) throw error;
  let income = 0;
  let expense = 0;
  let savings = 0;
  for (const tx of data ?? []) {
    if (tx.type === "income") income += tx.amount;
    else if (tx.type === "expense") expense += tx.amount;
    else if (tx.type === "savings") savings += tx.amount;
  }
  return { income, expense, savings, net: income - expense - savings };
}

export async function getPersonSummary(
  coupleId: string,
  year: number,
  month: number,
): Promise<PersonSummary> {
  const [from, to] = monthRange(year, month);
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("type, amount, paid_by, is_shared")
    .eq("couple_id", coupleId)
    .gte("occurred_at", from)
    .lte("occurred_at", to);

  if (error) throw error;

  const result: PersonSummary = {
    a: { income: 0, expense: 0, savings: 0 },
    b: { income: 0, expense: 0, savings: 0 },
    shared: { income: 0, expense: 0, savings: 0 },
  };
  for (const tx of (data ?? []) as Array<{
    type: TransactionType;
    amount: number;
    paid_by: PaidBy;
    is_shared: boolean;
  }>) {
    // A방식: 결제자(paid_by)는 항상 자기 버킷에 누적, is_shared=true면 shared에도 추가 (의도적 겹침).
    result[tx.paid_by][tx.type] += tx.amount;
    if (tx.is_shared) {
      result.shared[tx.type] += tx.amount;
    }
  }
  return result;
}

export async function getCategoryBreakdown(
  coupleId: string,
  year: number,
  month: number,
  type: "income" | "expense" | "savings",
): Promise<CategoryBreakdownRow[]> {
  const [from, to] = monthRange(year, month);
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("amount, category_id, categories(id, name, color)")
    .eq("couple_id", coupleId)
    .eq("type", type)
    .gte("occurred_at", from)
    .lte("occurred_at", to);

  if (error) throw error;

  const buckets = new Map<
    string,
    { categoryId: string | null; name: string; color: string | null; amount: number }
  >();
  let total = 0;
  for (const tx of (data ?? []) as unknown as Array<{
    amount: number;
    category_id: string | null;
    categories: { id: string; name: string; color: string | null } | null;
  }>) {
    const key = tx.category_id ?? "__none__";
    const existing = buckets.get(key);
    if (existing) {
      existing.amount += tx.amount;
    } else {
      buckets.set(key, {
        categoryId: tx.category_id,
        name: tx.categories?.name ?? "카테고리 없음",
        color: tx.categories?.color ?? null,
        amount: tx.amount,
      });
    }
    total += tx.amount;
  }

  const rows: CategoryBreakdownRow[] = Array.from(buckets.values()).map((b) => ({
    ...b,
    percentage: total === 0 ? 0 : (b.amount / total) * 100,
  }));
  rows.sort((x, y) => y.amount - x.amount);
  return rows;
}

export type MonthBreakdown = {
  month: number;
  income: number;
  expense: number;
  savings: number;
};

export async function getYearlyMonthBreakdown(
  coupleId: string,
  year: number,
): Promise<MonthBreakdown[]> {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("type, amount, occurred_at")
    .eq("couple_id", coupleId)
    .gte("occurred_at", from)
    .lte("occurred_at", to);

  if (error) throw error;

  const result: MonthBreakdown[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
    savings: 0,
  }));

  for (const tx of (data ?? []) as Array<{
    type: TransactionType;
    amount: number;
    occurred_at: string;
  }>) {
    const m = parseInt(tx.occurred_at.slice(5, 7), 10);
    if (m < 1 || m > 12) continue;
    if (tx.type === "income") result[m - 1].income += tx.amount;
    else if (tx.type === "expense") result[m - 1].expense += tx.amount;
    else if (tx.type === "savings") result[m - 1].savings += tx.amount;
  }
  return result;
}

export async function getYearlyPersonSummary(
  coupleId: string,
  year: number,
): Promise<PersonSummary> {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("type, amount, paid_by, is_shared")
    .eq("couple_id", coupleId)
    .gte("occurred_at", from)
    .lte("occurred_at", to);

  if (error) throw error;

  const result: PersonSummary = {
    a: { income: 0, expense: 0, savings: 0 },
    b: { income: 0, expense: 0, savings: 0 },
    shared: { income: 0, expense: 0, savings: 0 },
  };
  for (const tx of (data ?? []) as Array<{
    type: TransactionType;
    amount: number;
    paid_by: PaidBy;
    is_shared: boolean;
  }>) {
    // A방식: 결제자(paid_by)는 항상 자기 버킷에 누적, is_shared=true면 shared에도 추가 (의도적 겹침).
    result[tx.paid_by][tx.type] += tx.amount;
    if (tx.is_shared) {
      result.shared[tx.type] += tx.amount;
    }
  }
  return result;
}

export async function getYearlyCategoryBreakdown(
  coupleId: string,
  year: number,
  type: "income" | "expense" | "savings",
): Promise<CategoryBreakdownRow[]> {
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("amount, category_id, categories(id, name, color)")
    .eq("couple_id", coupleId)
    .eq("type", type)
    .gte("occurred_at", from)
    .lte("occurred_at", to);

  if (error) throw error;

  const buckets = new Map<
    string,
    { categoryId: string | null; name: string; color: string | null; amount: number }
  >();
  let total = 0;
  for (const tx of (data ?? []) as unknown as Array<{
    amount: number;
    category_id: string | null;
    categories: { id: string; name: string; color: string | null } | null;
  }>) {
    const key = tx.category_id ?? "__none__";
    const existing = buckets.get(key);
    if (existing) existing.amount += tx.amount;
    else
      buckets.set(key, {
        categoryId: tx.category_id,
        name: tx.categories?.name ?? "카테고리 없음",
        color: tx.categories?.color ?? null,
        amount: tx.amount,
      });
    total += tx.amount;
  }

  const rows: CategoryBreakdownRow[] = Array.from(buckets.values()).map((b) => ({
    ...b,
    percentage: total === 0 ? 0 : (b.amount / total) * 100,
  }));
  rows.sort((x, y) => y.amount - x.amount);
  return rows;
}

export async function getCategoryAmountsByMonth(
  coupleId: string,
  year: number,
  month: number,
  type: "income" | "expense" | "savings",
): Promise<Map<string | null, number>> {
  const [from, to] = monthRange(year, month);
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("amount, category_id")
    .eq("couple_id", coupleId)
    .eq("type", type)
    .gte("occurred_at", from)
    .lte("occurred_at", to);

  if (error) throw error;

  const map = new Map<string | null, number>();
  for (const tx of (data ?? []) as Array<{
    amount: number;
    category_id: string | null;
  }>) {
    map.set(tx.category_id, (map.get(tx.category_id) ?? 0) + tx.amount);
  }
  return map;
}
