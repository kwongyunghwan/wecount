import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type Account = {
  id: string;
  couple_id: string;
  name: string;
  color: string | null;
  monthly_amount: number;
  day_of_month: number;
  sort_order: number;
  created_at: string;
};

export type AccountStats = {
  account: Account;
  total: number;
  used: number;
  remaining: number;
};

export async function getAccounts(coupleId: string): Promise<Account[]> {
  const { data, error } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("couple_id", coupleId)
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Account[];
}

export async function getAccount(
  coupleId: string,
  id: string,
): Promise<Account | null> {
  const { data, error } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Account | null;
}

/** 계좌별 총입금 / 사용 / 잔액 계산 */
export async function getAccountStats(
  accountId: string,
): Promise<{ total: number; used: number; remaining: number }> {
  const [{ data: deposits }, { data: expenses }] = await Promise.all([
    supabaseAdmin
      .from("account_deposits")
      .select("amount")
      .eq("account_id", accountId),
    supabaseAdmin
      .from("transactions")
      .select("amount")
      .eq("account_id", accountId)
      .eq("type", "expense"),
  ]);

  const total = (deposits ?? []).reduce(
    (s, d: { amount: number }) => s + d.amount,
    0,
  );
  const used = (expenses ?? []).reduce(
    (s, t: { amount: number }) => s + t.amount,
    0,
  );
  return { total, used, remaining: total - used };
}

export async function listAccountsWithStats(
  coupleId: string,
): Promise<AccountStats[]> {
  const accounts = await getAccounts(coupleId);
  const stats = await Promise.all(
    accounts.map(async (a) => ({ account: a, ...(await getAccountStats(a.id)) })),
  );
  return stats;
}

export type AccountDeposit = {
  id: string;
  account_id: string;
  amount: number;
  occurred_at: string;
  memo: string | null;
  is_auto: boolean;
  created_at: string;
};

export async function getAccountDeposits(
  accountId: string,
): Promise<AccountDeposit[]> {
  const { data, error } = await supabaseAdmin
    .from("account_deposits")
    .select("*")
    .eq("account_id", accountId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AccountDeposit[];
}

/**
 * 매달 자동 입금: monthly_amount > 0인 계좌에 대해
 * 이번 달 day_of_month가 지났고 아직 자동 입금이 안 된 경우 자동 입금 처리
 */
export async function processAccountAutoDeposits(
  coupleId: string,
  partnerAName: string,
  partnerBName: string,
): Promise<number> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDayOfMonth).padStart(2, "0")}`;

  const { data: accounts } = await supabaseAdmin
    .from("accounts")
    .select("id, name, monthly_amount, day_of_month")
    .eq("couple_id", coupleId)
    .gt("monthly_amount", 0);

  if (!accounts) return 0;

  let processed = 0;
  for (const a of accounts as Array<{
    id: string;
    name: string;
    monthly_amount: number;
    day_of_month: number;
  }>) {
    const targetDay = Math.min(a.day_of_month, lastDayOfMonth);
    if (day < targetDay) continue;

    // 이번 달에 이미 자동 입금됐는지 확인
    const { data: existing } = await supabaseAdmin
      .from("account_deposits")
      .select("id")
      .eq("account_id", a.id)
      .eq("is_auto", true)
      .gte("occurred_at", monthStart)
      .lte("occurred_at", monthEnd)
      .limit(1);

    if (existing && existing.length > 0) continue;

    const occurred_at = `${year}-${String(month).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;
    const halfA = Math.floor(a.monthly_amount / 2);
    const halfB = a.monthly_amount - halfA;

    // 1) account_deposits
    await supabaseAdmin.from("account_deposits").insert({
      account_id: a.id,
      amount: a.monthly_amount,
      occurred_at,
      memo: null,
      is_auto: true,
    });

    // 2) A/B 절반씩 지출 거래
    await supabaseAdmin.from("transactions").insert([
      {
        couple_id: coupleId,
        type: "expense",
        amount: halfA,
        occurred_at,
        paid_by: "a",
        is_shared: false,
        memo: `${a.name} 입금 (자동)`,
        category_id: null,
        account_id: null,
      },
      {
        couple_id: coupleId,
        type: "expense",
        amount: halfB,
        occurred_at,
        paid_by: "b",
        is_shared: false,
        memo: `${a.name} 입금 (자동)`,
        category_id: null,
        account_id: null,
      },
    ]);

    processed++;
  }
  // partnerAName/partnerBName 매개변수는 향후 메모 커스터마이즈 용도. 현재는 미사용.
  void partnerAName;
  void partnerBName;
  return processed;
}

export async function getAccountExpenseTransactions(accountId: string) {
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select(
      "id, type, amount, memo, occurred_at, paid_by, category_id, categories(id, name, color)",
    )
    .eq("account_id", accountId)
    .eq("type", "expense")
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
