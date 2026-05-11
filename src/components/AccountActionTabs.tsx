"use client";

import { useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { Category } from "@/lib/db/categories";
import { DepositForm } from "@/components/DepositForm";
import { AccountSpendForm } from "@/components/AccountSpendForm";

type Tab = "deposit" | "spend";

type Props = {
  accountId: string;
  categories: Category[];
  partnerAName: string;
  partnerBName: string;
  depositAction: (formData: FormData) => Promise<void>;
  spendAction: (formData: FormData) => Promise<void>;
};

export function AccountActionTabs({
  accountId,
  categories,
  partnerAName,
  partnerBName,
  depositAction,
  spendAction,
}: Props) {
  const [tab, setTab] = useState<Tab>("spend");

  return (
    <div>
      <div className="mb-3 flex rounded-xl border border-neutral-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("spend")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition ${
            tab === "spend"
              ? "bg-rose-500 text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <ArrowUpCircle size={14} /> 지출
        </button>
        <button
          type="button"
          onClick={() => setTab("deposit")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition ${
            tab === "deposit"
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <ArrowDownCircle size={14} /> 입금
        </button>
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-4">
        {tab === "deposit" ? (
          <DepositForm
            accountId={accountId}
            partnerAName={partnerAName}
            partnerBName={partnerBName}
            action={depositAction}
          />
        ) : (
          <AccountSpendForm
            accountId={accountId}
            categories={categories}
            partnerAName={partnerAName}
            partnerBName={partnerBName}
            action={spendAction}
          />
        )}
      </div>
    </div>
  );
}
