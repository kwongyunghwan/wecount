"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCouple } from "@/lib/session";

function parseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "expense") as
    | "income"
    | "expense"
    | "savings";
  const rawCategoryId = formData.get("category_id");
  const category_id =
    rawCategoryId && String(rawCategoryId).trim() !== ""
      ? String(rawCategoryId)
      : null;
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const paid_by = String(formData.get("paid_by") ?? "a") as "a" | "b";
  const is_shared = formData.get("is_shared") === "true";
  const day_of_month = parseInt(
    String(formData.get("day_of_month") ?? "1"),
    10,
  );
  const memo = String(formData.get("memo") ?? "").trim() || null;
  return {
    name,
    type,
    category_id,
    amount,
    paid_by,
    is_shared,
    day_of_month,
    memo,
  };
}

export async function createRecurring(formData: FormData) {
  const couple = await requireCouple();
  const fields = parseFields(formData);

  if (
    !fields.name ||
    !fields.amount ||
    fields.amount <= 0 ||
    !fields.day_of_month ||
    fields.day_of_month < 1 ||
    fields.day_of_month > 31
  ) {
    redirect("/recurring/new?error=invalid");
  }

  await supabaseAdmin.from("recurring_transactions").insert({
    couple_id: couple.id,
    ...fields,
  });

  redirect("/recurring");
}

export async function updateRecurring(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const fields = parseFields(formData);

  if (
    !id ||
    !fields.name ||
    !fields.amount ||
    fields.amount <= 0 ||
    !fields.day_of_month
  ) {
    redirect(`/recurring/${id}/edit?error=invalid`);
  }

  await supabaseAdmin
    .from("recurring_transactions")
    .update(fields)
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect("/recurring");
}

export async function deleteRecurring(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");

  await supabaseAdmin
    .from("recurring_transactions")
    .delete()
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect("/recurring");
}

export async function toggleRecurring(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("is_active") === "true";

  await supabaseAdmin
    .from("recurring_transactions")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect("/recurring");
}
