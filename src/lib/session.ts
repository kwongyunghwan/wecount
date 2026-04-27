import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "./supabase/server";

export const COUPLE_COOKIE = "wecount_couple_id";
export const COUPLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type Couple = {
  id: string;
  code: string;
  partner_a_name: string;
  partner_b_name: string;
};

export async function getCurrentCouple(): Promise<Couple | null> {
  const jar = await cookies();
  const coupleId = jar.get(COUPLE_COOKIE)?.value;
  if (!coupleId) return null;

  const { data } = await supabaseAdmin
    .from("couples")
    .select("id, code, partner_a_name, partner_b_name")
    .eq("id", coupleId)
    .maybeSingle();

  return (data as Couple | null) ?? null;
}

export async function requireCouple(): Promise<Couple> {
  const couple = await getCurrentCouple();
  if (!couple) redirect("/");
  return couple;
}
