"use client";

import { useState } from "react";
import { numberToKorean } from "@/lib/utils";

const QUICK_AMOUNTS = [
  { label: "+1만원", value: 10_000 },
  { label: "+10만원", value: 100_000 },
  { label: "+100만원", value: 1_000_000 },
];

type Props = {
  name: string;
  label: string;
  defaultValue?: number;
  placeholder?: string;
  min?: number;
  required?: boolean;
};

export function AmountInput({
  name,
  label,
  defaultValue = 0,
  placeholder,
  min = 1,
  required,
}: Props) {
  const [amount, setAmount] = useState<number>(defaultValue);
  const koreanAmount = amount > 0 ? numberToKorean(amount) : "";

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium">{label}</label>
        {koreanAmount ? (
          <span className="text-xs text-neutral-500">({koreanAmount}원)</span>
        ) : null}
      </div>
      <input
        name={name}
        type="number"
        inputMode="numeric"
        min={min}
        value={amount > 0 ? amount : ""}
        onChange={(e) =>
          setAmount(Math.max(0, parseInt(e.target.value) || 0))
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        required={required}
      />
      <div className="flex gap-2">
        {QUICK_AMOUNTS.map((q) => (
          <button
            key={q.value}
            type="button"
            onClick={() => setAmount((a) => a + q.value)}
            className="flex-1 rounded-lg border border-neutral-200 bg-white py-1.5 text-xs font-semibold text-neutral-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          >
            {q.label}
          </button>
        ))}
        {amount > 0 ? (
          <button
            type="button"
            onClick={() => setAmount(0)}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-400 transition hover:border-neutral-300 hover:text-neutral-600"
          >
            초기화
          </button>
        ) : null}
      </div>
    </div>
  );
}
