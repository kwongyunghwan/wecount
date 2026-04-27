import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type Budget = {
  id: string;
  couple_id: string;
  category_id: string;
  year: number;
  month: number;
  amount: number;
};

export async function getBudgets(
  coupleId: string,
  year: number,
  month: number,
): Promise<Budget[]> {
  const { data, error } = await supabaseAdmin
    .from("budgets")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("year", year)
    .eq("month", month);

  if (error) throw error;
  return (data ?? []) as Budget[];
}

/** 카테고리별 예산을 Map으로 반환 */
export async function getBudgetMap(
  coupleId: string,
  year: number,
  month: number,
): Promise<Map<string, number>> {
  const rows = await getBudgets(coupleId, year, month);
  const map = new Map<string, number>();
  for (const b of rows) map.set(b.category_id, b.amount);
  return map;
}
