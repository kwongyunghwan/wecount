"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCouple } from "@/lib/session";

export async function setBudget(formData: FormData) {
  const couple = await requireCouple();

  const category_id = String(formData.get("category_id") ?? "");
  const year = parseInt(String(formData.get("year") ?? "0"), 10);
  const month = parseInt(String(formData.get("month") ?? "0"), 10);
  const rawAmount = String(formData.get("amount") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/stats");

  if (!category_id || !year || !month) redirect(returnTo + "?error=invalid");

  // 빈 값이면 예산 삭제
  if (rawAmount === "" || rawAmount === "0") {
    await supabaseAdmin
      .from("budgets")
      .delete()
      .eq("couple_id", couple.id)
      .eq("category_id", category_id)
      .eq("year", year)
      .eq("month", month);
    redirect(returnTo);
  }

  const amount = parseInt(rawAmount, 10);
  if (Number.isNaN(amount) || amount < 0) redirect(returnTo + "?error=invalid");

  // upsert (couple_id, category_id, year, month) unique
  await supabaseAdmin
    .from("budgets")
    .upsert(
      {
        couple_id: couple.id,
        category_id,
        year,
        month,
        amount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "couple_id,category_id,year,month" },
    );

  redirect(returnTo);
}
