import { notFound } from "next/navigation";
import { requireCouple } from "@/lib/session";
import { getRecurring } from "@/lib/db/recurring";
import { getCategories } from "@/lib/db/categories";
import { getAccounts } from "@/lib/db/accounts";
import { AppLayout } from "@/components/AppLayout";
import { RecurringForm } from "@/components/RecurringForm";
import {
  updateRecurring,
  deleteRecurring,
} from "@/app/actions/recurring";

export default async function EditRecurringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const couple = await requireCouple();
  const { id } = await params;

  const [item, categories, accounts] = await Promise.all([
    getRecurring(couple.id, id),
    getCategories(couple.id),
    getAccounts(couple.id),
  ]);

  if (!item) notFound();

  return (
    <AppLayout couple={couple} title="고정비 수정" backHref="/recurring">
      <div className="space-y-4">
        <RecurringForm
          categories={categories}
          accounts={accounts}
          partnerAName={couple.partner_a_name}
          partnerBName={couple.partner_b_name}
          defaultValues={{
            name: item.name,
            type: item.type === "income" ? "income" : "expense",
            category_id: item.category_id,
            account_id: item.account_id,
            amount: item.amount,
            paid_by: item.paid_by,
            is_shared: item.is_shared,
            day_of_month: item.day_of_month,
            memo: item.memo,
          }}
          idField={id}
          action={updateRecurring}
          submitLabel="수정하기"
        />

        <form action={deleteRecurring}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="w-full rounded-xl border border-rose-200 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            이 고정비 삭제
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
