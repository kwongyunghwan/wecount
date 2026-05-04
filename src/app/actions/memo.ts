"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireCouple } from "@/lib/session";

const MAX_PINNED = 2;

function parseAuthor(value: FormDataEntryValue | null): "a" | "b" {
  return value === "b" ? "b" : "a";
}

/**
 * 방금 핀이 된 newPinId를 제외한 나머지 핀이 (MAX_PINNED - 1)개를 넘으면
 * 가장 오래된 것부터 해제한다.
 */
async function ensurePinCapacity(coupleId: string, newPinId: string) {
  const { data } = await supabaseAdmin
    .from("memos")
    .select("id")
    .eq("couple_id", coupleId)
    .eq("is_pinned", true)
    .neq("id", newPinId)
    .order("created_at", { ascending: true });

  const others = (data ?? []) as Array<{ id: string }>;
  const overflow = others.length - (MAX_PINNED - 1);
  if (overflow <= 0) return;

  const ids = others.slice(0, overflow).map((p) => p.id);
  await supabaseAdmin.from("memos").update({ is_pinned: false }).in("id", ids);
}

export async function createMemo(formData: FormData) {
  const couple = await requireCouple();
  const content = String(formData.get("content") ?? "").trim();
  const author = parseAuthor(formData.get("author"));
  const pin = formData.get("pin") === "on";
  const redirectTo = String(formData.get("redirect_to") ?? "/memos");

  if (!content) {
    redirect(`${redirectTo}?error=empty`);
  }

  const { data: inserted } = await supabaseAdmin
    .from("memos")
    .insert({
      couple_id: couple.id,
      content,
      author,
      is_pinned: pin,
    })
    .select("id")
    .single();

  if (pin && inserted) {
    await ensurePinCapacity(couple.id, (inserted as { id: string }).id);
  }

  redirect(redirectTo);
}

export async function updateMemo(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const author = parseAuthor(formData.get("author"));
  const redirectTo = String(formData.get("redirect_to") ?? "/memos");

  if (!id || !content) {
    redirect(`${redirectTo}?error=invalid`);
  }

  await supabaseAdmin
    .from("memos")
    .update({ content, author, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect(redirectTo);
}

export async function deleteMemo(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/memos");

  await supabaseAdmin
    .from("memos")
    .delete()
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect(redirectTo);
}

export async function pinMemo(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/memos");

  if (!id) redirect(redirectTo);

  await supabaseAdmin
    .from("memos")
    .update({ is_pinned: true })
    .eq("id", id)
    .eq("couple_id", couple.id);

  await ensurePinCapacity(couple.id, id);

  redirect(redirectTo);
}

export async function unpinMemo(formData: FormData) {
  const couple = await requireCouple();
  const id = String(formData.get("id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/memos");

  await supabaseAdmin
    .from("memos")
    .update({ is_pinned: false })
    .eq("id", id)
    .eq("couple_id", couple.id);

  redirect(redirectTo);
}
