"use client";

import { useState } from "react";
import { Users, User } from "lucide-react";
import type { Category } from "@/lib/db/categories";

type Props = {
  categories: Category[];
  partnerAName: string;
  partnerBName: string;
  defaultValues?: {
    name: string;
    type: "income" | "expense";
    category_id: string | null;
    amount: number;
    paid_by: "a" | "b";
    is_shared: boolean;
    day_of_month: number;
    memo: string | null;
  };
  idField?: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function RecurringForm({
  categories,
  partnerAName,
  partnerBName,
  defaultValues,
  idField,
  action,
  submitLabel,
}: Props) {
  const [type, setType] = useState<"income" | "expense">(
    defaultValues?.type ?? "expense",
  );
  const [paidBy, setPaidBy] = useState<"a" | "b">(
    defaultValues?.paid_by ?? "a",
  );
  const [isShared, setIsShared] = useState<boolean>(
    defaultValues?.is_shared ?? true,
  );
  const filtered = categories.filter((c) => c.type === type);

  return (
    <form action={action} className="space-y-5">
      {idField ? <input type="hidden" name="id" value={idField} /> : null}

      {/* 이름 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">이름</label>
        <input
          name="name"
          type="text"
          defaultValue={defaultValues?.name ?? ""}
          placeholder="예: 월세, 넷플릭스, 관리비"
          maxLength={50}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          required
        />
      </div>

      {/* 수입/지출 */}
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
                : "text-neutral-500"
            }`}
          >
            {t === "expense" ? "지출" : "수입"}
          </button>
        ))}
      </div>
      <input type="hidden" name="type" value={type} />

      {/* 누가 결제 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">결제하는 사람</label>
        <div className="grid grid-cols-2 gap-2">
          {(["a", "b"] as const).map((p) => {
            const name = p === "a" ? partnerAName : partnerBName;
            const active = paidBy === p;
            const activeStyle =
              p === "a"
                ? "border-sky-400 bg-sky-50 text-sky-700"
                : "border-violet-400 bg-violet-50 text-violet-700";
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPaidBy(p)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                  active
                    ? activeStyle
                    : "border-neutral-200 bg-white text-neutral-500"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="paid_by" value={paidBy} />
      </div>

      {/* 공동/개인 */}
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
        <input
          type="hidden"
          name="is_shared"
          value={isShared ? "true" : "false"}
        />
      </div>

      {/* 매달 며칠 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">매달 며칠</label>
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
          31일을 선택해도 해당 월에 31일이 없으면 마지막 일에 등록돼요.
        </p>
      </div>

      {/* 카테고리 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">카테고리</label>
        <select
          name="category_id"
          defaultValue={defaultValues?.category_id ?? ""}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        >
          <option value="">카테고리 없음</option>
          {filtered.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 금액 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">금액 (원)</label>
        <input
          name="amount"
          type="number"
          min={1}
          defaultValue={defaultValues?.amount || ""}
          placeholder="700000"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          required
        />
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
          maxLength={100}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
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
