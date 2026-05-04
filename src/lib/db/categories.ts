import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type Category = {
  id: string;
  couple_id: string;
  name: string;
  type: "income" | "expense" | "savings";
  color: string | null;
  sort_order: number;
};

export async function getCategories(
  coupleId: string,
  type?: "income" | "expense",
): Promise<Category[]> {
  let query = supabaseAdmin
    .from("categories")
    .select("*")
    .eq("couple_id", coupleId)
    .order("type")
    .order("sort_order");

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}
