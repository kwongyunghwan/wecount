"use client";

import { useState } from "react";
import { AmountInput } from "@/components/AmountInput";

type Props = {
  defaultValues?: {
    name: string;
    color: string | null;
    monthly_amount: number;
    day_of_month: number;
  };
  idField?: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

const COLOR_OPTIONS = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#737373",
];

export function AccountForm({
  defaultValues,
  idField,
  action,
  submitLabel,
}: Props) {
  const [color, setColor] = useState<string>(
    defaultValues?.color ?? COLOR_OPTIONS[0],
  );

  return (
    <form action={action} className="space-y-5">
      {idField ? <input type="hidden" name="id" value={idField} /> : null}

      {/* 이름 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">계좌 이름</label>
        <input
          name="name"
          type="text"
          defaultValue={defaultValues?.name ?? ""}
          placeholder="예: 생활비, 공과금, 커플통장"
          maxLength={30}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          required
        />
      </div>

      {/* 색상 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">색상</label>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className={`h-8 w-8 rounded-full border-2 transition ${
                color === c ? "border-neutral-800 scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <input type="hidden" name="color" value={color} />
      </div>

      {/* 매달 입금 금액 (선택) */}
      <AmountInput
        name="monthly_amount"
        label="매달 입금 금액 (선택)"
        defaultValue={defaultValues?.monthly_amount ?? 0}
        placeholder="0 (수동 입금만 사용)"
      />

      {/* 매달 며칠 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">매달 며칠 입금</label>
        <input
          name="day_of_month"
          type="number"
          min={1}
          max={31}
          defaultValue={defaultValues?.day_of_month ?? 1}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          required
        />
        <p className="text-xs text-neutral-400">
          입금 금액이 설정된 경우 매달 자동으로 입금돼요.
        </p>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:bg-rose-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
