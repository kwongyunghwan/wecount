"use client";

import { useState } from "react";
import { AmountInput } from "@/components/AmountInput";

type Props = {
  accountId: string;
  partnerAName: string;
  partnerBName: string;
  action: (formData: FormData) => Promise<void>;
};

export function DepositForm({
  accountId,
  partnerAName,
  partnerBName,
  action,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [splitHalf, setSplitHalf] = useState<boolean>(true);
  const [paidBy, setPaidBy] = useState<"a" | "b">("a");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="account_id" value={accountId} />
      <input
        type="hidden"
        name="split_half"
        value={splitHalf ? "true" : "false"}
      />
      <input type="hidden" name="paid_by" value={paidBy} />

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

      <AmountInput
        name="amount"
        label="입금 금액 (원)"
        defaultValue={0}
        placeholder="100000"
        required
      />

      {/* 반반 분담 토글 */}
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={splitHalf}
            onChange={(e) => setSplitHalf(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-rose-500 focus:ring-rose-300"
          />
          <span className="text-sm font-medium">반반 분담</span>
          <span className="text-xs text-neutral-400">
            (체크 시 A/B 절반씩, 해제 시 한 명 결제)
          </span>
        </label>

        {!splitHalf ? (
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
        ) : null}
      </div>

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

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
      >
        입금하기
      </button>
    </form>
  );
}
