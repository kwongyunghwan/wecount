"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCouple } from "@/lib/session";

export async function createGoal(formData: FormData) {
  const couple = await requireCouple();
  const name = String(formData.get("name") ?? "").trim();
  const target_amount = parseInt(
    String(formData.get("target_amount") ?? "0"),
    10,
  );
  const rawDeadline = String(formData.get("deadline") ?? "").trim();
  const deadline = rawDeadline || null;
  const color = String(formData.get("color") ?? "#f43f5e");

  if (!name || !target_amount || target_amount <= 0) {
    redirect("/goals/new?error=invalid");
  }

  await supabaseAdmin.from("savings_goals").insert({
    couple_id: couple.id,
    name,
    target_amount,
    deadline,
    color,
  });

  redirect("/goals");
}

export async function updateGoal(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const target_amount = parseInt(
    String(formData.get("target_amount") ?? "0"),
    10,
  );
  const rawDeadline = String(formData.get("deadline") ?? "").trim();
  const deadline = rawDeadline || null;
  const color = String(formData.get("color") ?? "#f43f5e");

  if (!id || !name || !target_amount || target_amount <= 0) {
    redirect(`/goals/${id}/edit?error=invalid`);
  }

  await supabaseAdmin
    .from("savings_goals")
    .update({ name, target_amount, deadline, color })
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect(`/goals/${id}`);
}

export async function deleteGoal(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");

  await supabaseAdmin
    .from("savings_goals")
    .delete()
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect("/goals");
}

export async function completeGoal(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");

  await supabaseAdmin
    .from("savings_goals")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect(`/goals/${id}`);
}

export async function reopenGoal(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");

  await supabaseAdmin
    .from("savings_goals")
    .update({ completed_at: null })
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect(`/goals/${id}`);
}

export async function addDeposit(formData: FormData) {
  await requireCouple();
  const goal_id = String(formData.get("goal_id") ?? "");
  const amount = parseInt(String(formData.get("amount") ?? "0"), 10);
  const memo = String(formData.get("memo") ?? "").trim() || null;
  const deposited_at = String(
    formData.get("deposited_at") ?? new Date().toISOString().slice(0, 10),
  );

  if (!goal_id || !amount || amount <= 0) {
    redirect(`/goals/${goal_id}?error=invalid`);
  }

  await supabaseAdmin.from("savings_deposits").insert({
    goal_id,
    amount,
    memo,
    deposited_at,
  });

  redirect(`/goals/${goal_id}`);
}

export async function deleteDeposit(formData: FormData) {
  await requireCouple();
  const id = String(formData.get("id") ?? "");
  const goal_id = String(formData.get("goal_id") ?? "");

  await supabaseAdmin.from("savings_deposits").delete().eq("id", id);

  redirect(`/goals/${goal_id}`);
}
