"use client";

import { useState } from "react";
import { Users, User } from "lucide-react";
import type { Category } from "@/lib/db/categories";
import { CategorySelect } from "@/components/CategorySelect";
import { AmountInput } from "@/components/AmountInput";

type TxType = "income" | "expense" | "savings";

type Props = {
  categories: Category[];
  partnerAName: string;
  partnerBName: string;
  defaultType?: TxType;
  defaultValues?: {
    type: TxType;
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

const TYPE_BTN_ACTIVE: Record<TxType, string> = {
  expense: "bg-rose-500 text-white shadow-sm",
  income: "bg-emerald-500 text-white shadow-sm",
  savings: "bg-blue-500 text-white shadow-sm",
};

const TYPE_LABEL: Record<TxType, string> = {
  expense: "지출",
  income: "수입",
  savings: "저금",
};

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
  const [type, setType] = useState<TxType>(
    defaultValues?.type ?? defaultType,
  );
  const [paidBy, setPaidBy] = useState<"a" | "b">(
    defaultValues?.paid_by ?? "a",
  );
  const [isShared, setIsShared] = useState<boolean>(
    defaultValues?.is_shared ?? false,
  );

  const filtered = categories.filter((c) => c.type === type);
  const today = new Date().toISOString().slice(0, 10);

  // 수입은 폼에서 공동 지원 안 함 (개인 처리). 지출/저금은 둘 다 가능.
  const supportsShared = type === "expense" || type === "savings";
  const isSharedValue = supportsShared && isShared ? "true" : "false";

  return (
    <form action={action} className="space-y-5">
      {idField ? <input type="hidden" name="id" value={idField} /> : null}

      {/* 수입/지출/저금 토글 */}
      <div className="flex rounded-xl border border-neutral-200 bg-white p-1">
        {(["expense", "income", "savings"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
              type === t
                ? TYPE_BTN_ACTIVE[t]
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <input type="hidden" name="type" value={type} />

      {/* 결제자 / 받은 사람 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          {type === "income" ? "받은 사람" : "결제"}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaidBy("a")}
            className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
              paidBy === "a"
                ? "border-sky-400 bg-sky-50 text-sky-700"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            {partnerAName}
          </button>
          <button
            type="button"
            onClick={() => setPaidBy("b")}
            className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
              paidBy === "b"
                ? "border-violet-400 bg-violet-50 text-violet-700"
                : "border-neutral-200 bg-white text-neutral-500"
            }`}
          >
            {partnerBName}
          </button>
        </div>
      </div>
      <input type="hidden" name="paid_by" value={paidBy} />

      {/* 공동/개인 (지출/저금) */}
      {supportsShared ? (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">공동/개인</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsShared(true)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition ${
                isShared
                  ? "border-rose-400 bg-rose-50 text-rose-600"
                  : "border-neutral-200 bg-white text-neutral-500"
              }`}
            >
              <Users size={14} /> 공동
            </button>
            <button
              type="button"
              onClick={() => setIsShared(false)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition ${
                !isShared
                  ? "border-neutral-400 bg-neutral-100 text-neutral-700"
                  : "border-neutral-200 bg-white text-neutral-500"
              }`}
            >
              <User size={14} /> 개인
            </button>
          </div>
        </div>
      ) : null}
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
      <AmountInput
        name="amount"
        label="금액 (원)"
        defaultValue={defaultValues?.amount ?? 0}
        placeholder="30000"
        required
      />

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
