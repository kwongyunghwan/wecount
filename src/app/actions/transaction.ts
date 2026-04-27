"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCouple } from "@/lib/session";

function parseFields(formData: FormData) {
  const type = String(formData.get("type") ?? "") as "income" | "expense";
  const rawCategoryId = formData.get("category_id");
  const category_id =
    rawCategoryId && String(rawCategoryId).trim() !== ""
      ? String(rawCategoryId)
      : null;
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const memo = String(formData.get("memo") ?? "").trim() || null;
  const occurred_at = String(formData.get("occurred_at") ?? "");
  const paid_by = String(formData.get("paid_by") ?? "a") as "a" | "b";
  const is_shared = formData.get("is_shared") === "true";

  return { type, category_id, amount, memo, occurred_at, paid_by, is_shared };
}

export async function createTransaction(formData: FormData) {
  const couple = await requireCouple();
  const fields = parseFields(formData);

  if (
    !fields.type ||
    !fields.occurred_at ||
    !fields.amount ||
    fields.amount <= 0
  ) {
    redirect("/transactions/new?error=invalid");
  }

  const { error } = await supabaseAdmin.from("transactions").insert({
    couple_id: couple.id,
    ...fields,
  });

  if (error) redirect("/transactions/new?error=create");
  redirect("/transactions");
}

export async function updateTransaction(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const fields = parseFields(formData);

  if (
    !id ||
    !fields.type ||
    !fields.occurred_at ||
    !fields.amount ||
    fields.amount <= 0
  ) {
    redirect(`/transactions/${id}/edit?error=invalid`);
  }

  const { error } = await supabaseAdmin
    .from("transactions")
    .update(fields)
    .eq("id", id)
    .eq("couple_id", couple.id);

  if (error) redirect(`/transactions/${id}/edit?error=update`);
  redirect("/transactions");
}

export async function deleteTransaction(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/transactions");

  await supabaseAdmin
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect(returnTo);
}

export async function deleteTransactions(formData: FormData) {
  const couple = await requireCouple();
  const ids = formData.getAll("ids").map((v) => String(v)).filter(Boolean);
  const returnTo = String(formData.get("returnTo") ?? "/transactions");

  if (ids.length === 0) redirect(returnTo);

  await supabaseAdmin
    .from("transactions")
    .delete()
    .in("id", ids)
    .eq("couple_id", couple.id);

  redirect(returnTo);
}

export async function deleteAllInMonth(formData: FormData) {
  const couple = await requireCouple();
  const year = parseInt(String(formData.get("year") ?? "0"), 10);
  const month = parseInt(String(formData.get("month") ?? "0"), 10);
  const returnTo = String(formData.get("returnTo") ?? "/transactions");

  if (!year || !month || month < 1 || month > 12) redirect(returnTo);

  const m = String(month).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();
  const from = `${year}-${m}-01`;
  const to = `${year}-${m}-${String(lastDay).padStart(2, "0")}`;

  await supabaseAdmin
    .from("transactions")
    .delete()
    .eq("couple_id", couple.id)
    .gte("occurred_at", from)
    .lte("occurred_at", to);

  redirect(returnTo);
}
