import Link from "next/link";
import { Plus, Calendar, Power } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { getRecurringTransactions } from "@/lib/db/recurring";
import { AppLayout } from "@/components/AppLayout";
import { PartnerChip } from "@/components/PartnerChip";
import { txDisplay } from "@/lib/utils";
import {
  deleteRecurring,
  toggleRecurring,
} from "@/app/actions/recurring";

export default async function RecurringPage() {
  const couple = await requireCouple();
  const items = await getRecurringTransactions(couple.id);

  return (
    <AppLayout
      couple={couple}
      title="고정비"
      backHref="/settings"
      headerRight={
        <Link
          href="/recurring/new"
          className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
        >
          <Plus size={13} strokeWidth={2.5} /> 추가
        </Link>
      }
    >
      <p className="mb-4 text-xs text-neutral-500">
        매달 같은 날에 자동으로 거래로 등록돼요. 페이지를 열 때 오늘 날짜를
        기준으로 추가됩니다.
      </p>

      {items.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-neutral-500">
            등록된 고정비가 없어요.
            <br />월세, 구독 등 매달 반복되는 거래를 추가해보세요.
          </p>
          <Link
            href="/recurring/new"
            className="mt-4 inline-block rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            고정비 추가
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={r.id}
              className={`rounded-xl border bg-white p-3 ${
                r.is_active
                  ? "border-neutral-100"
                  : "border-neutral-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/recurring/${r.id}/edit`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <PartnerChip
                      partner={r.paid_by}
                      name={
                        r.paid_by === "a"
                          ? couple.partner_a_name
                          : couple.partner_b_name
                      }
                    />
                    {!r.is_shared ? (
                      <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                        개인
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                    <Calendar size={11} />
                    매달 {r.day_of_month}일
                    {r.categories?.name ? ` · ${r.categories.name}` : ""}
                  </p>
                </Link>
                <p
                  className={`shrink-0 text-sm font-bold tabular-nums ${
                    txDisplay(r.type).textClass
                  }`}
                >
                  {txDisplay(r.type).sign}
                  {r.amount.toLocaleString("ko-KR")}원
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2">
                <form action={toggleRecurring}>
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    type="hidden"
                    name="is_active"
                    value={(!r.is_active).toString()}
                  />
                  <button
                    type="submit"
                    className={`flex items-center gap-1 text-xs font-medium ${
                      r.is_active
                        ? "text-emerald-600 hover:text-emerald-700"
                        : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <Power size={12} />
                    {r.is_active ? "활성" : "비활성"}
                  </button>
                </form>
                <form action={deleteRecurring}>
                  <input type="hidden" name="id" value={r.id} />
                  <button
                    type="submit"
                    className="text-xs text-neutral-400 hover:text-rose-500"
                  >
                    삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
