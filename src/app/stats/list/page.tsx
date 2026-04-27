import Link from "next/link";
import { Users } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { getTransactionsByFilter } from "@/lib/db/transactions";
import { AppLayout } from "@/components/AppLayout";
import { PartnerChip } from "@/components/PartnerChip";
import { CategoryIcon } from "@/components/CategoryIcon";
import { formatDate } from "@/lib/utils";

type Payer = "a" | "b" | "shared";
type Type = "income" | "expense";

function isPayer(v: string | undefined): v is Payer {
  return v === "a" || v === "b" || v === "shared";
}
function isType(v: string | undefined): v is Type {
  return v === "income" || v === "expense";
}

export default async function StatsListPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    month?: string;
    payer?: string;
    type?: string;
  }>;
}) {
  const couple = await requireCouple();
  const sp = await searchParams;

  const now = new Date();
  const year = sp.year ? parseInt(sp.year) : now.getFullYear();
  const month = sp.month ? parseInt(sp.month) : undefined;
  const payer = isPayer(sp.payer) ? sp.payer : undefined;
  const type = isType(sp.type) ? sp.type : undefined;

  const transactions = await getTransactionsByFilter(couple.id, {
    year,
    month,
    payer,
    type,
  });

  const total = transactions.reduce((s, t) => s + t.amount, 0);

  const personLabel =
    payer === "a"
      ? couple.partner_a_name
      : payer === "b"
        ? couple.partner_b_name
        : payer === "shared"
          ? "공동"
          : "전체";
  const periodLabel = month ? `${year}년 ${month}월` : `${year}년`;
  const typeLabel =
    type === "expense" ? "지출" : type === "income" ? "수입" : "거래";

  const title = `${personLabel} ${periodLabel} ${typeLabel}`;
  const backHref = month
    ? `/stats?year=${year}&month=${month}`
    : `/stats/year?year=${year}`;

  return (
    <AppLayout couple={couple} title={title} backHref={backHref}>
      {/* 합계 */}
      <div className="mb-4 rounded-xl border border-neutral-100 bg-white p-4 text-center">
        <p className="text-xs text-neutral-500">
          총 {transactions.length}건
        </p>
        <p
          className={`mt-1 text-lg font-bold tabular-nums ${
            type === "income" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {type === "income" ? "+" : "-"}
          {total.toLocaleString("ko-KR")}원
        </p>
      </div>

      {/* 거래 목록 */}
      {transactions.length === 0 ? (
        <p className="py-14 text-center text-sm text-neutral-500">
          이 조건에 해당하는 거래가 없어요.
        </p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => (
            <li key={tx.id}>
              <Link
                href={`/transactions/${tx.id}/edit`}
                className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3 hover:bg-neutral-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CategoryIcon
                    name={tx.categories?.name}
                    color={tx.categories?.color}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">
                        {tx.categories?.name ?? "카테고리 없음"}
                      </p>
                      {tx.is_shared ? (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
                          <Users size={9} /> 공동
                        </span>
                      ) : (
                        <PartnerChip
                          partner={tx.paid_by}
                          name={
                            tx.paid_by === "a"
                              ? couple.partner_a_name
                              : couple.partner_b_name
                          }
                        />
                      )}
                    </div>
                    <p className="truncate text-xs text-neutral-500">
                      {formatDate(tx.occurred_at)}
                      {tx.memo ? ` · ${tx.memo}` : ""}
                    </p>
                  </div>
                </div>
                <p
                  className={`ml-2 shrink-0 text-sm font-semibold tabular-nums ${
                    tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {tx.amount.toLocaleString("ko-KR")}원
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
