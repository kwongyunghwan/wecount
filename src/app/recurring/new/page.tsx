import { requireCouple } from "@/lib/session";
import { getCategories } from "@/lib/db/categories";
import { AppLayout } from "@/components/AppLayout";
import { RecurringForm } from "@/components/RecurringForm";
import { createRecurring } from "@/app/actions/recurring";

export default async function NewRecurringPage() {
  const couple = await requireCouple();
  const categories = await getCategories(couple.id);

  return (
    <AppLayout couple={couple} title="고정비 추가" backHref="/recurring">
      <RecurringForm
        categories={categories}
        partnerAName={couple.partner_a_name}
        partnerBName={couple.partner_b_name}
        action={createRecurring}
        submitLabel="저장하기"
      />
    </AppLayout>
  );
}
