import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type Memo = {
  id: string;
  couple_id: string;
  content: string;
  author: "a" | "b";
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export async function getMemos(coupleId: string): Promise<Memo[]> {
  const { data, error } = await supabaseAdmin
    .from("memos")
    .select("*")
    .eq("couple_id", coupleId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Memo[];
}

export async function getPinnedMemos(coupleId: string): Promise<Memo[]> {
  const { data, error } = await supabaseAdmin
    .from("memos")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("is_pinned", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Memo[];
}

export async function getMemo(
  coupleId: string,
  id: string,
): Promise<Memo | null> {
  const { data } = await supabaseAdmin
    .from("memos")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("id", id)
    .maybeSingle();

  return (data as Memo | null) ?? null;
}
