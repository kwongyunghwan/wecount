import { requireCouple } from "@/lib/session";
import { getCategories } from "@/lib/db/categories";
import { getAccounts } from "@/lib/db/accounts";
import { AppLayout } from "@/components/AppLayout";
import { RecurringForm } from "@/components/RecurringForm";
import { createRecurring } from "@/app/actions/recurring";

export default async function NewRecurringPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const couple = await requireCouple();
  const { account } = await searchParams;
  const [categories, accounts] = await Promise.all([
    getCategories(couple.id),
    getAccounts(couple.id),
  ]);

  return (
    <AppLayout
      couple={couple}
      title="고정비 추가"
      backHref={account ? `/accounts/${account}` : "/recurring"}
    >
      <RecurringForm
        categories={categories}
        accounts={accounts}
        lockedAccountId={account}
        partnerAName={couple.partner_a_name}
        partnerBName={couple.partner_b_name}
        action={createRecurring}
        submitLabel="저장하기"
      />
    </AppLayout>
  );
}
