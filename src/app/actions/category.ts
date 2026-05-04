"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCouple } from "@/lib/session";

export async function createCategory(formData: FormData) {
  const couple = await requireCouple();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as
    | "income"
    | "expense"
    | "savings";
  const color = String(formData.get("color") ?? "#737373");

  if (!name || !type) redirect("/settings?error=empty");

  const { data: existing } = await supabaseAdmin
    .from("categories")
    .select("sort_order")
    .eq("couple_id", couple.id)
    .eq("type", type)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = ((existing?.sort_order as number | null) ?? 0) + 1;

  await supabaseAdmin.from("categories").insert({
    couple_id: couple.id,
    name,
    type,
    color,
    sort_order,
  });

  redirect("/settings");
}

export async function deleteCategory(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");

  await supabaseAdmin
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect("/settings");
}
