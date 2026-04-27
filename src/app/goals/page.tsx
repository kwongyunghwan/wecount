import Link from "next/link";
import { Plus, CheckCircle2 } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { getGoals } from "@/lib/db/savings";
import { AppLayout } from "@/components/AppLayout";
import { GoalProgress } from "@/components/GoalProgress";

export default async function GoalsPage() {
  const couple = await requireCouple();
  const goals = await getGoals(couple.id);

  const active = goals.filter((g) => !g.completed_at);
  const done = goals.filter((g) => g.completed_at);

  return (
    <AppLayout
      couple={couple}
      title="저축 목표"
      backHref="/settings"
      headerRight={
        <Link
          href="/goals/new"
          className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
        >
          <Plus size={13} strokeWidth={2.5} /> 추가
        </Link>
      }
    >
      {goals.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-neutral-500">
            아직 저축 목표가 없어요.
            <br />함께 모을 첫 목표를 추가해보세요.
          </p>
          <Link
            href="/goals/new"
            className="mt-4 inline-block rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            첫 목표 만들기
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-neutral-600">
                진행 중
              </h2>
              <ul className="space-y-2">
                {active.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/goals/${g.id}`}
                      className="block rounded-xl border border-neutral-100 bg-white p-4 transition hover:border-neutral-200 hover:bg-neutral-50"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: g.color ?? "#f43f5e",
                            }}
                          />
                          <p className="truncate text-sm font-semibold">
                            {g.name}
                          </p>
                        </div>
                        {g.deadline ? (
                          <p className="shrink-0 text-xs text-neutral-400">
                            ~ {g.deadline}
                          </p>
                        ) : null}
                      </div>
                      <GoalProgress
                        current={g.current_amount}
                        target={g.target_amount}
                        percent={g.percent}
                        color={g.color}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {done.length > 0 ? (
            <section>
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-600">
                <CheckCircle2 size={14} className="text-emerald-500" /> 달성
              </h2>
              <ul className="space-y-2">
                {done.map((g) => (
                  <li key={g.id}>
                    <Link
                      href={`/goals/${g.id}`}
                      className="block rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 transition hover:bg-emerald-50"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-emerald-500 shrink-0"
                        />
                        <p className="truncate text-sm font-semibold">
                          {g.name}
                        </p>
                      </div>
                      <p className="text-xs tabular-nums text-neutral-500">
                        {g.current_amount.toLocaleString("ko-KR")}원 /{" "}
                        {g.target_amount.toLocaleString("ko-KR")}원
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </AppLayout>
  );
}
