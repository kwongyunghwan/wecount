import Link from "next/link";
import { Plus, Wallet, ChevronRight } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { listAccountsWithStats } from "@/lib/db/accounts";
import { AppLayout } from "@/components/AppLayout";

export default async function AccountsPage() {
  const couple = await requireCouple();
  const stats = await listAccountsWithStats(couple.id);

  return (
    <AppLayout
      couple={couple}
      title="계좌"
      headerRight={
        <Link
          href="/accounts/new"
          className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
        >
          <Plus size={13} strokeWidth={2.5} /> 추가
        </Link>
      }
    >
      <p className="mb-4 text-xs text-neutral-500">
        공동 계좌별로 입금/지출과 잔액을 관리해요.
      </p>

      {stats.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-neutral-500">
            등록된 계좌가 없어요.
            <br />생활비, 공과금, 커플통장 등을 추가해보세요.
          </p>
          <Link
            href="/accounts/new"
            className="mt-4 inline-block rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            계좌 추가
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {stats.map(({ account, total, used, remaining }) => (
            <li key={account.id}>
              <Link
                href={`/accounts/${account.id}`}
                className="block rounded-xl border border-neutral-100 bg-white p-4 transition hover:bg-neutral-50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: (account.color ?? "#f43f5e") + "22",
                        color: account.color ?? "#f43f5e",
                      }}
                    >
                      <Wallet size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{account.name}</p>
                      {account.monthly_amount > 0 ? (
                        <p className="text-[10px] text-neutral-400">
                          매달 {account.day_of_month}일 ·{" "}
                          {account.monthly_amount.toLocaleString("ko-KR")}원
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-neutral-300" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-neutral-500">총금액</p>
                    <p className="mt-0.5 text-xs font-semibold tabular-nums text-neutral-700">
                      {total.toLocaleString("ko-KR")}원
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500">사용</p>
                    <p className="mt-0.5 text-xs font-semibold tabular-nums text-rose-600">
                      {used.toLocaleString("ko-KR")}원
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500">잔액</p>
                    <p
                      className={`mt-0.5 text-xs font-bold tabular-nums ${
                        remaining >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {remaining.toLocaleString("ko-KR")}원
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
