import { requireCouple } from "@/lib/session";
import { AppLayout } from "@/components/AppLayout";
import { MemoEditor } from "@/components/MemoEditor";
import { createMemo } from "@/app/actions/memo";

export default async function NewMemoPage({
  searchParams,
}: {
  searchParams: Promise<{ pin?: string }>;
}) {
  const couple = await requireCouple();
  const { pin } = await searchParams;
  const defaultPinned = pin === "1";

  return (
    <AppLayout couple={couple} title="새 메모" backHref="/memos">
      <form action={createMemo} className="space-y-5">
        <input type="hidden" name="redirect_to" value="/memos" />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">내용</label>
          <MemoEditor placeholder="이번 달 공동 지출 정산, 함께 가고 싶은 가게…" />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">작성자</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="author"
                value="a"
                defaultChecked
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
                className="peer sr-only"
              />
              <div className="rounded-xl border border-neutral-200 bg-white py-3 text-center text-sm font-medium text-neutral-600 transition peer-checked:border-violet-400 peer-checked:bg-violet-50 peer-checked:text-violet-700">
                {couple.partner_b_name}
              </div>
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3">
          <input
            type="checkbox"
            name="pin"
            defaultChecked={defaultPinned}
            className="h-4 w-4 rounded border-neutral-300 text-rose-500 focus:ring-rose-300"
          />
          <span className="text-sm">
            홈에 고정 (최대 2개, 초과 시 가장 오래된 핀 자동 해제)
          </span>
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          저장
        </button>
      </form>
    </AppLayout>
  );
}
