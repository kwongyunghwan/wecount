import { notFound } from "next/navigation";
import { requireCouple } from "@/lib/session";
import { getAccount } from "@/lib/db/accounts";
import { AppLayout } from "@/components/AppLayout";
import { AccountForm } from "@/components/AccountForm";
import { updateAccount, deleteAccount } from "@/app/actions/account";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const couple = await requireCouple();
  const { id } = await params;
  const account = await getAccount(couple.id, id);
  if (!account) notFound();

  return (
    <AppLayout couple={couple} title="계좌 수정" backHref={`/accounts/${id}`}>
      <div className="space-y-4">
        <AccountForm
          idField={id}
          action={updateAccount}
          submitLabel="수정하기"
          defaultValues={{
            name: account.name,
            color: account.color,
            monthly_amount: account.monthly_amount,
            day_of_month: account.day_of_month,
          }}
        />

        <form action={deleteAccount}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="w-full rounded-xl border border-rose-200 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            계좌 삭제
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
