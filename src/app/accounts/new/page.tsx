import { requireCouple } from "@/lib/session";
import { AppLayout } from "@/components/AppLayout";
import { AccountForm } from "@/components/AccountForm";
import { createAccount } from "@/app/actions/account";

export default async function NewAccountPage() {
  const couple = await requireCouple();

  return (
    <AppLayout couple={couple} title="계좌 추가" backHref="/accounts">
      <AccountForm action={createAccount} submitLabel="저장하기" />
    </AppLayout>
  );
}
