import { notFound } from "next/navigation";
import { requireCouple } from "@/lib/session";
import { getGoal } from "@/lib/db/savings";
import { AppLayout } from "@/components/AppLayout";
import { AmountInput } from "@/components/AmountInput";
import { updateGoal } from "@/app/actions/savings";

const COLOR_PRESETS = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const couple = await requireCouple();
  const { id } = await params;

  const goal = await getGoal(couple.id, id);
  if (!goal) notFound();

  return (
    <AppLayout couple={couple} title="목표 수정" backHref={`/goals/${id}`}>
      <form action={updateGoal} className="space-y-5">
        <input type="hidden" name="id" value={id} />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">목표 이름</label>
          <input
            name="name"
            type="text"
            defaultValue={goal.name}
            maxLength={40}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            required
          />
        </div>

        <AmountInput
          name="target_amount"
          label="목표 금액 (원)"
          defaultValue={goal.target_amount}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">
            마감일{" "}
            <span className="font-normal text-neutral-400">(선택)</span>
          </label>
          <input
            name="deadline"
            type="date"
            defaultValue={goal.deadline ?? ""}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">색상</label>
          <div className="grid grid-cols-7 gap-2">
            {COLOR_PRESETS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={goal.color === c}
                  className="peer sr-only"
                />
                <div
                  className="h-9 w-9 rounded-full transition peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-neutral-400"
                  style={{ backgroundColor: c }}
                />
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          저장하기
        </button>
      </form>
    </AppLayout>
  );
}
