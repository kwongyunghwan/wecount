"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import type { Category } from "@/lib/db/categories";
import { numberToKorean } from "@/lib/utils";
import { CategorySelect } from "@/components/CategorySelect";

type Selection = "a" | "b" | "shared";

type Props = {
  categories: Category[];
  partnerAName: string;
  partnerBName: string;
  defaultType?: "income" | "expense";
  defaultValues?: {
    type: "income" | "expense";
    category_id: string | null;
    amount: number;
    memo: string | null;
    occurred_at: string;
    paid_by: "a" | "b";
    is_shared: boolean;
  };
  idField?: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  errorMessage?: string | null;
};

const QUICK_AMOUNTS = [
  { label: "+1만원", value: 10_000 },
  { label: "+10만원", value: 100_000 },
  { label: "+100만원", value: 1_000_000 },
];

function initialSelection(
  defaultValues: Props["defaultValues"],
): Selection {
  if (!defaultValues) return "a";
  if (defaultValues.is_shared) return "shared";
  return defaultValues.paid_by;
}

export function TransactionForm({
  categories,
  partnerAName,
  partnerBName,
  defaultType = "expense",
  defaultValues,
  idField,
  action,
  submitLabel,
  errorMessage,
}: Props) {
  const [type, setTypeState] = useState<"income" | "expense">(
    defaultValues?.type ?? defaultType,
  );
  const [selection, setSelection] = useState<Selection>(
    initialSelection(defaultValues),
  );

  function setType(t: "income" | "expense") {
    setTypeState(t);
    // 수입에는 "공동"이 없으므로 'shared' 상태였다면 'a'로 정리
    if (t === "income" && selection === "shared") {
      setSelection("a");
    }
  }
  const [amount, setAmount] = useState<number>(defaultValues?.amount ?? 0);
  const filtered = categories.filter((c) => c.type === type);

  const today = new Date().toISOString().slice(0, 10);

  // 지출: A/B/공동, 수입: A/B (공동 없음)
  const paidByValue = selection === "shared" ? "a" : selection;
  const isSharedValue = selection === "shared" ? "true" : "false";

  const koreanAmount = amount > 0 ? numberToKorean(amount) : "";

  return (
    <form action={action} className="space-y-5">
      {idField ? <input type="hidden" name="id" value={idField} /> : null}

      {/* 수입/지출 토글 */}
      <div className="flex rounded-xl border border-neutral-200 bg-white p-1">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              type === t
                ? t === "expense"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-emerald-500 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t === "expense" ? "지출" : "수입"}
          </button>
        ))}
      </div>
      <input type="hidden" name="type" value={type} />

      {/* 지출: A/B/공동, 수입: A/B */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          {type === "expense" ? "결제" : "받은 사람"}
        </label>
        <div
          className={`grid gap-2 ${
            type === "expense" ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setSelection("a")}
            className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
              selection === "a"
                ? "border-sky-400 bg-sky-50 text-sky-700"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            {partnerAName}
          </button>
          <button
            type="button"
            onClick={() => setSelection("b")}
            className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
              selection === "b"
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            {partnerBName}
          </button>
          {type === "expense" ? (
            <button
              type="button"
              onClick={() => setSelection("shared")}
              className={`flex items-center justify-center gap-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                selection === "shared"
                  ? "border-rose-400 bg-rose-50 text-rose-700"
                  : "border-neutral-200 bg-white text-neutral-500"
              }`}
            >
              <Users size={13} /> 공동
            </button>
          ) : null}
        </div>
      </div>
      <input type="hidden" name="paid_by" value={paidByValue} />
      <input type="hidden" name="is_shared" value={isSharedValue} />

      {/* 날짜 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">날짜</label>
        <input
          name="occurred_at"
          type="date"
          defaultValue={defaultValues?.occurred_at ?? today}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          required
        />
      </div>

      {/* 카테고리 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">카테고리</label>
        <CategorySelect
          key={type}
          name="category_id"
          categories={filtered}
          defaultValue={defaultValues?.category_id ?? null}
        />
      </div>

      {/* 금액 */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <label className="text-sm font-medium">금액 (원)</label>
          {koreanAmount ? (
            <span className="text-xs text-neutral-500">
              ({koreanAmount}원)
            </span>
          ) : null}
        </div>
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          min={1}
          value={amount > 0 ? amount : ""}
          onChange={(e) =>
            setAmount(Math.max(0, parseInt(e.target.value) || 0))
          }
          placeholder="30000"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          required
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

      {/* 메모 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          메모{" "}
          <span className="font-normal text-neutral-400">(선택)</span>
        </label>
        <input
          name="memo"
          type="text"
          defaultValue={defaultValues?.memo ?? ""}
          placeholder="간단한 메모"
          maxLength={100}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-rose-600">{errorMessage}</p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:bg-rose-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
