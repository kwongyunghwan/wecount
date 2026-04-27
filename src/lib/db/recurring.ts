import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type RecurringTransaction = {
  id: string;
  couple_id: string;
  category_id: string | null;
  name: string;
  type: "income" | "expense";
  amount: number;
  paid_by: "a" | "b";
  is_shared: boolean;
  day_of_month: number;
  memo: string | null;
  is_active: boolean;
  last_run_year: number | null;
  last_run_month: number | null;
  created_at: string;
  categories?: { id: string; name: string; color: string | null } | null;
};

export async function getRecurringTransactions(
  coupleId: string,
): Promise<RecurringTransaction[]> {
  const { data, error } = await supabaseAdmin
    .from("recurring_transactions")
    .select(
      "id, couple_id, category_id, name, type, amount, paid_by, is_shared, day_of_month, memo, is_active, last_run_year, last_run_month, created_at, categories(id, name, color)",
    )
    .eq("couple_id", coupleId)
    .order("day_of_month");

  if (error) throw error;
  return (data ?? []) as unknown as RecurringTransaction[];
}

export async function getRecurring(
  coupleId: string,
  id: string,
): Promise<RecurringTransaction | null> {
  const { data, error } = await supabaseAdmin
    .from("recurring_transactions")
    .select(
      "id, couple_id, category_id, name, type, amount, paid_by, is_shared, day_of_month, memo, is_active, last_run_year, last_run_month, created_at, categories(id, name, color)",
    )
    .eq("couple_id", coupleId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as RecurringTransaction | null;
}

/**
 * 오늘 기준으로 처리되지 않은 이번 달 고정비를 transactions에 자동 등록.
 * 페이지 진입 시(예: 대시보드) 호출하면 됨.
 */
export async function processRecurringForCouple(
  coupleId: string,
): Promise<number> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const lastDayOfMonth = new Date(year, month, 0).getDate();

  const { data: candidates, error } = await supabaseAdmin
    .from("recurring_transactions")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("is_active", true);

  if (error || !candidates) return 0;

  let processed = 0;
  for (const r of candidates as RecurringTransaction[]) {
    if (r.last_run_year === year && r.last_run_month === month) continue;

    const targetDay = Math.min(r.day_of_month, lastDayOfMonth);
    if (day < targetDay) continue;

    const occurred_at = `${year}-${String(month).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`;

    const { error: insertError } = await supabaseAdmin
      .from("transactions")
      .insert({
        couple_id: coupleId,
        category_id: r.category_id,
        type: r.type,
        amount: r.amount,
        memo: r.memo ? `${r.name} · ${r.memo}` : `${r.name} (자동)`,
        paid_by: r.paid_by,
        is_shared: r.is_shared,
        occurred_at,
      });

    if (insertError) continue;

    await supabaseAdmin
      .from("recurring_transactions")
      .update({ last_run_year: year, last_run_month: month })
      .eq("id", r.id);

    processed++;
  }
  return processed;
}
