import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { getCategories } from "@/lib/db/categories";
import { AppLayout } from "@/components/AppLayout";
import { TransactionForm } from "@/components/TransactionForm";
import { createTransaction } from "@/app/actions/transaction";

export default async function NewTransactionPage() {
  const couple = await requireCouple();
  const categories = await getCategories(couple.id);

  return (
    <AppLayout couple={couple} title="거래 추가" backHref="/transactions">
      <div className="space-y-5">
        <Link
          href="/transactions/import"
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <FileSpreadsheet size={15} className="text-rose-400" />
          엑셀로 불러오기
        </Link>

        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-200" />
          또는 직접 입력
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <TransactionForm
          categories={categories}
          partnerAName={couple.partner_a_name}
          partnerBName={couple.partner_b_name}
          action={createTransaction}
          submitLabel="저장하기"
        />
      </div>
    </AppLayout>
  );
}
