import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Pencil,
  Wallet,
  Calendar,
  Plus,
  RotateCw,
} from "lucide-react";
import { requireCouple } from "@/lib/session";
import {
  getAccount,
  getAccountStats,
  getAccountDeposits,
  getAccountExpenseTransactions,
} from "@/lib/db/accounts";
import { getRecurringByAccount } from "@/lib/db/recurring";
import { getCategories } from "@/lib/db/categories";
import { AppLayout } from "@/components/AppLayout";
import { CategoryIcon } from "@/components/CategoryIcon";
import { PartnerChip } from "@/components/PartnerChip";
import { AccountActionTabs } from "@/components/AccountActionTabs";
import {
  depositToAccount,
  spendFromAccount,
  deleteAccountDeposit,
} from "@/app/actions/account";
import { formatDate } from "@/lib/utils";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const couple = await requireCouple();
  const { id } = await params;
  const account = await getAccount(couple.id, id);
  if (!account) notFound();

  const [stats, deposits, expenses, categories, recurringList] =
    await Promise.all([
      getAccountStats(id),
      getAccountDeposits(id),
      getAccountExpenseTransactions(id),
      getCategories(couple.id),
      getRecurringByAccount(couple.id, id),
    ]);

  const color = account.color ?? "#f43f5e";

  return (
    <AppLayout
      couple={couple}
      title={account.name}
      backHref="/accounts"
      headerRight={
        <Link
          href={`/accounts/${id}/edit`}
          aria-label="수정"
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
        >
          <Pencil size={16} />
        </Link>
      }
    >
      {/* 잔액 카드 */}
      <section className="mb-6">
        <div
          className="rounded-2xl border p-5"
          style={{
            backgroundColor: color + "11",
            borderColor: color + "33",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: color + "22", color }}
            >
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-xs text-neutral-500">잔액</p>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  stats.remaining >= 0 ? "text-neutral-800" : "text-rose-600"
                }`}
              >
                {stats.remaining.toLocaleString("ko-KR")}원
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-white/60 pt-3 text-center">
            <div>
              <p className="text-[10px] text-neutral-500">총 입금</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-600">
                +{stats.total.toLocaleString("ko-KR")}원
              </p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-500">총 사용</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-rose-600">
                -{stats.used.toLocaleString("ko-KR")}원
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 매달 고정지출 */}
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <RotateCw size={14} className="text-rose-500" /> 매달 고정지출
          </h2>
          <Link
            href={`/recurring/new?account=${id}`}
            className="flex items-center gap-1 rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-600"
          >
            <Plus size={11} strokeWidth={2.5} /> 추가
          </Link>
        </div>
        {recurringList.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 py-6 text-center text-xs text-neutral-400">
            등록된 매달 고정지출이 없어요.
          </p>
        ) : (
          <ul className="space-y-2">
            {recurringList.map((r) => (
              <li
                key={r.id}
                className={`rounded-xl border bg-white p-3 ${
                  r.is_active
                    ? "border-neutral-100"
                    : "border-neutral-100 opacity-60"
                }`}
              >
                <Link href={`/recurring/${r.id}/edit`} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                        <Calendar size={11} /> 매달 {r.day_of_month}일
                        {r.categories?.name ? ` · ${r.categories.name}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-rose-600">
                      -{r.amount.toLocaleString("ko-KR")}원
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 입금/지출 탭 폼 */}
      <section className="mb-6">
        <AccountActionTabs
          accountId={id}
          categories={categories}
          partnerAName={couple.partner_a_name}
          partnerBName={couple.partner_b_name}
          depositAction={depositToAccount}
          spendAction={spendFromAccount}
        />
      </section>

      {/* 입금 내역 */}
      {deposits.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold">입금 내역</h2>
          <ul className="space-y-2">
            {deposits.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="text-xs text-neutral-500">
                    {formatDate(d.occurred_at)}
                    {d.is_auto ? " · 자동" : ""}
                  </p>
                  {d.memo ? (
                    <p className="truncate text-sm">{d.memo}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-600">
                    +{d.amount.toLocaleString("ko-KR")}원
                  </p>
                  <form action={deleteAccountDeposit}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="account_id" value={id} />
                    <button
                      type="submit"
                      aria-label="삭제"
                      className="text-xs text-neutral-300 hover:text-rose-500"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 지출 내역 */}
      {expenses.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold">지출 내역</h2>
          <ul className="space-y-2">
            {expenses.map((tx) => {
              const cat = (
                tx as unknown as {
                  categories?: { name: string; color: string | null } | null;
                }
              ).categories;
              return (
                <li
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIcon
                      name={cat?.name}
                      color={account.color}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {cat?.name ? (
                          <p className="truncate text-sm font-medium">
                            {cat.name}
                          </p>
                        ) : null}
                        <PartnerChip
                          partner={tx.paid_by}
                          name={
                            tx.paid_by === "a"
                              ? couple.partner_a_name
                              : couple.partner_b_name
                          }
                        />
                      </div>
                      <p className="truncate text-xs text-neutral-500">
                        {formatDate(tx.occurred_at)}
                        {tx.memo ? ` · ${tx.memo}` : ""}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-rose-600">
                    -{tx.amount.toLocaleString("ko-KR")}원
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </AppLayout>
  );
}
