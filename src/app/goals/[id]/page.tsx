import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, RotateCcw, Trash2, Pencil } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { getGoal, getGoalDeposits } from "@/lib/db/savings";
import { AppLayout } from "@/components/AppLayout";
import { GoalProgress } from "@/components/GoalProgress";
import { formatDate, toDateInputValue } from "@/lib/utils";
import {
  addDeposit,
  deleteDeposit,
  deleteGoal,
  completeGoal,
  reopenGoal,
} from "@/app/actions/savings";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const couple = await requireCouple();
  const { id } = await params;

  const [goal, deposits] = await Promise.all([
    getGoal(couple.id, id),
    getGoalDeposits(id),
  ]);

  if (!goal) notFound();

  const remaining = Math.max(0, goal.target_amount - goal.current_amount);
  const reached = goal.percent >= 100;
  const completed = goal.completed_at !== null;

  return (
    <AppLayout
      couple={couple}
      title={goal.name}
      backHref="/goals"
      headerRight={
        <Link
          href={`/goals/${id}/edit`}
          aria-label="수정"
          className="text-neutral-500 hover:text-neutral-700"
        >
          <Pencil size={16} />
        </Link>
      }
    >
      <div className="space-y-6">
        {/* 진행률 카드 */}
        <section className="rounded-2xl border border-neutral-100 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: goal.color ?? "#f43f5e" }}
            />
            <p className="text-sm font-semibold">{goal.name}</p>
            {completed ? (
              <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle2 size={12} /> 달성
              </span>
            ) : null}
          </div>
          <GoalProgress
            current={goal.current_amount}
            target={goal.target_amount}
            percent={goal.percent}
            color={goal.color}
          />
          {goal.deadline ? (
            <p className="mt-3 text-xs text-neutral-500">
              마감: {goal.deadline}
            </p>
          ) : null}
          {!completed && remaining > 0 ? (
            <p className="mt-2 text-xs text-neutral-500">
              {remaining.toLocaleString("ko-KR")}원 더 모으면 목표 달성!
            </p>
          ) : null}
        </section>

        {/* 입금 폼 (완료 안 됐을 때만) */}
        {!completed ? (
          <section>
            <h2 className="mb-3 text-sm font-semibold">입금하기</h2>
            <form
              action={addDeposit}
              className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4"
            >
              <input type="hidden" name="goal_id" value={id} />
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="block text-xs text-neutral-500">금액</label>
                  <input
                    name="amount"
                    type="number"
                    min={1}
                    placeholder="100000"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm tabular-nums outline-none focus:border-rose-400"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-neutral-500">날짜</label>
                  <input
                    name="deposited_at"
                    type="date"
                    defaultValue={toDateInputValue()}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400"
                    required
                  />
                </div>
              </div>
              <input
                name="memo"
                type="text"
                placeholder="메모 (선택)"
                maxLength={100}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
              >
                입금하기
              </button>
            </form>
          </section>
        ) : null}

        {/* 입금 기록 */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">입금 기록</h2>
          {deposits.length === 0 ? (
            <p className="text-sm text-neutral-400">아직 입금 기록이 없어요.</p>
          ) : (
            <ul className="space-y-2">
              {deposits.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums text-emerald-600">
                      +{d.amount.toLocaleString("ko-KR")}원
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {formatDate(d.deposited_at)}
                      {d.memo ? ` · ${d.memo}` : ""}
                    </p>
                  </div>
                  <form action={deleteDeposit}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="goal_id" value={id} />
                    <button
                      type="submit"
                      aria-label="삭제"
                      className="text-neutral-300 hover:text-rose-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 액션 */}
        <section className="space-y-2">
          {!completed && reached ? (
            <form action={completeGoal}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <CheckCircle2 size={14} /> 목표 달성 처리
              </button>
            </form>
          ) : null}
          {completed ? (
            <form action={reopenGoal}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
              >
                <RotateCcw size={14} /> 다시 진행 중으로
              </button>
            </form>
          ) : null}
          <form action={deleteGoal}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="w-full rounded-xl border border-rose-200 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              이 목표 삭제
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
