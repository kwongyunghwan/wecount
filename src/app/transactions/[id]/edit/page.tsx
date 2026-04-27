import { notFound } from "next/navigation";
import { requireCouple } from "@/lib/session";
import { getTransaction } from "@/lib/db/transactions";
import { getCategories } from "@/lib/db/categories";
import { AppLayout } from "@/components/AppLayout";
import { TransactionForm } from "@/components/TransactionForm";
import { updateTransaction, deleteTransaction } from "@/app/actions/transaction";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const couple = await requireCouple();
  const { id } = await params;

  const [tx, categories] = await Promise.all([
    getTransaction(couple.id, id),
    getCategories(couple.id),
  ]);

  if (!tx) notFound();

  return (
    <AppLayout couple={couple} title="거래 수정" backHref="/transactions">
      <div className="space-y-4">
        <TransactionForm
          categories={categories}
          partnerAName={couple.partner_a_name}
          partnerBName={couple.partner_b_name}
          defaultValues={{
            type: tx.type,
            category_id: tx.category_id,
            amount: tx.amount,
            memo: tx.memo,
            occurred_at: tx.occurred_at,
            paid_by: tx.paid_by,
            is_shared: tx.is_shared,
          }}
          idField={id}
          action={updateTransaction}
          submitLabel="수정하기"
        />

        <form action={deleteTransaction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="returnTo" value="/transactions" />
          <button
            type="submit"
            className="w-full rounded-xl border border-rose-200 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            이 거래 삭제
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
