import { requireCouple } from "@/lib/session";
import { AppLayout } from "@/components/AppLayout";
import { AmountInput } from "@/components/AmountInput";
import { createGoal } from "@/app/actions/savings";

const COLOR_PRESETS = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
];

export default async function NewGoalPage() {
  const couple = await requireCouple();

  return (
    <AppLayout couple={couple} title="새 저축 목표" backHref="/goals">
      <form action={createGoal} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">목표 이름</label>
          <input
            name="name"
            type="text"
            placeholder="예: 제주도 여행, 결혼식, 비상금"
            maxLength={40}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            required
          />
        </div>

        <AmountInput
          name="target_amount"
          label="목표 금액 (원)"
          placeholder="2000000"
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
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium">색상</label>
          <div className="grid grid-cols-7 gap-2">
            {COLOR_PRESETS.map((c, i) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={i === 0}
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
          목표 만들기
        </button>
      </form>
    </AppLayout>
  );
}
