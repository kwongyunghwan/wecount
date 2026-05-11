"use client";

import { useState } from "react";
import type { Category } from "@/lib/db/categories";
import { CategorySelect } from "@/components/CategorySelect";
import { AmountInput } from "@/components/AmountInput";

type Props = {
  accountId: string;
  categories: Category[];
  partnerAName: string;
  partnerBName: string;
  action: (formData: FormData) => Promise<void>;
};

export function AccountSpendForm({
  accountId,
  categories,
  partnerAName,
  partnerBName,
  action,
}: Props) {
  const [paidBy, setPaidBy] = useState<"a" | "b">("a");
  const today = new Date().toISOString().slice(0, 10);
  const filtered = categories.filter((c) => c.type === "expense");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="account_id" value={accountId} />

      {/* 결제자 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">결제</label>
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
        <input type="hidden" name="paid_by" value={paidBy} />
      </div>

      {/* 날짜 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">날짜</label>
        <input
          name="occurred_at"
          type="date"
          defaultValue={today}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          required
        />
      </div>

      {/* 카테고리 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">카테고리</label>
        <CategorySelect
          name="category_id"
          categories={filtered}
          defaultValue={null}
        />
      </div>

      <AmountInput
        name="amount"
        label="지출 금액 (원)"
        defaultValue={0}
        placeholder="30000"
        required
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium">
          메모 <span className="font-normal text-neutral-400">(선택)</span>
        </label>
        <input
          name="memo"
          type="text"
          maxLength={100}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
        계좌 잔액에서만 차감되고, 개인 지출에는 잡히지 않아요.
      </p>

      <button
        type="submit"
        className="w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
      >
        지출하기
      </button>
    </form>
  );
}
