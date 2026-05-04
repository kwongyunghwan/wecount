import { notFound } from "next/navigation";
import { Pin, PinOff } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { getMemo } from "@/lib/db/memos";
import { AppLayout } from "@/components/AppLayout";
import { MemoEditor } from "@/components/MemoEditor";
import {
  updateMemo,
  deleteMemo,
  pinMemo,
  unpinMemo,
} from "@/app/actions/memo";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function EditMemoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const couple = await requireCouple();
  const { id } = await params;
  const memo = await getMemo(couple.id, id);
  if (!memo) notFound();

  return (
    <AppLayout couple={couple} title="메모 편집" backHref="/memos">
      <form action={updateMemo} className="space-y-5">
        <input type="hidden" name="id" value={memo.id} />
        <input type="hidden" name="redirect_to" value="/memos" />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">내용</label>
          <MemoEditor defaultValue={memo.content} />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">작성자</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="author"
                value="a"
                defaultChecked={memo.author === "a"}
                className="peer sr-only"
              />
              <div className="rounded-xl border border-neutral-200 bg-white py-3 text-center text-sm font-medium text-neutral-600 transition peer-checked:border-sky-400 peer-checked:bg-sky-50 peer-checked:text-sky-700">
                {couple.partner_a_name}
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="author"
                value="b"
                defaultChecked={memo.author === "b"}
                className="peer sr-only"
              />
              <div className="rounded-xl border border-neutral-200 bg-white py-3 text-center text-sm font-medium text-neutral-600 transition peer-checked:border-violet-400 peer-checked:bg-violet-50 peer-checked:text-violet-700">
                {couple.partner_b_name}
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          저장
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {memo.is_pinned ? (
          <form action={unpinMemo}>
            <input type="hidden" name="id" value={memo.id} />
            <input type="hidden" name="redirect_to" value="/memos" />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              <PinOff size={14} /> 홈 고정 해제
            </button>
          </form>
        ) : (
          <form action={pinMemo}>
            <input type="hidden" name="id" value={memo.id} />
            <input type="hidden" name="redirect_to" value="/memos" />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50/60 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-50"
            >
              <Pin size={14} /> 홈에 고정 (최대 2개, 초과 시 가장 오래된 핀 해제)
            </button>
          </form>
        )}

        <form action={deleteMemo}>
          <input type="hidden" name="id" value={memo.id} />
          <input type="hidden" name="redirect_to" value="/memos" />
          <ConfirmButton
            type="submit"
            message="이 메모를 삭제할까요?"
            className="w-full rounded-xl border border-rose-100 bg-white py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            삭제
          </ConfirmButton>
        </form>
      </div>
    </AppLayout>
  );
}
