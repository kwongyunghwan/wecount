"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateCoupleCode } from "@/lib/code";
import { COUPLE_COOKIE, COUPLE_COOKIE_MAX_AGE } from "@/lib/session";

const DEFAULT_CATEGORIES: Array<{
  name: string;
  type: "income" | "expense";
  color: string;
  sort_order: number;
}> = [
  { name: "식비", type: "expense", color: "#ef4444", sort_order: 1 },
  { name: "카페/간식", type: "expense", color: "#f97316", sort_order: 2 },
  { name: "교통", type: "expense", color: "#eab308", sort_order: 3 },
  { name: "주거", type: "expense", color: "#84cc16", sort_order: 4 },
  { name: "통신", type: "expense", color: "#22c55e", sort_order: 5 },
  { name: "쇼핑", type: "expense", color: "#06b6d4", sort_order: 6 },
  { name: "의료", type: "expense", color: "#3b82f6", sort_order: 7 },
  { name: "문화/여가", type: "expense", color: "#a855f7", sort_order: 8 },
  { name: "기타지출", type: "expense", color: "#737373", sort_order: 9 },
  { name: "월급", type: "income", color: "#10b981", sort_order: 1 },
  { name: "용돈", type: "income", color: "#3b82f6", sort_order: 2 },
  { name: "부수입", type: "income", color: "#a855f7", sort_order: 3 },
  { name: "기타수입", type: "income", color: "#737373", sort_order: 4 },
];

async function setCoupleCookie(coupleId: string) {
  const jar = await cookies();
  jar.set(COUPLE_COOKIE, coupleId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COUPLE_COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function joinCouple(formData: FormData) {
  const raw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!raw) {
    redirect("/?error=empty");
  }

  const { data, error } = await supabaseAdmin
    .from("couples")
    .select("id")
    .eq("code", raw)
    .maybeSingle();

  if (error || !data) {
    redirect("/?error=notfound");
  }

  await setCoupleCookie(data.id);
  redirect("/dashboard");
}

export async function createCouple(formData: FormData) {
  const partnerA = String(formData.get("partner_a") ?? "").trim();
  const partnerB = String(formData.get("partner_b") ?? "").trim();

  if (!partnerA || !partnerB) {
    redirect("/new?error=empty");
  }

  let coupleId: string | null = null;
  let code: string | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCoupleCode();
    const { data, error } = await supabaseAdmin
      .from("couples")
      .insert({
        code: candidate,
        partner_a_name: partnerA,
        partner_b_name: partnerB,
      })
      .select("id, code")
      .single();
    if (!error && data) {
      coupleId = data.id;
      code = data.code;
      break;
    }
  }

  if (!coupleId || !code) {
    redirect("/new?error=create");
  }

  const { error: catError } = await supabaseAdmin.from("categories").insert(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, couple_id: coupleId })),
  );
  if (catError) {
    console.error("default categories insert failed", catError);
  }

  await setCoupleCookie(coupleId);
  redirect(`/welcome?code=${code}`);
}

export async function leaveCouple() {
  const jar = await cookies();
  jar.delete(COUPLE_COOKIE);
  redirect("/");
}
