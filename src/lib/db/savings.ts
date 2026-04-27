import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type SavingsGoal = {
  id: string;
  couple_id: string;
  name: string;
  target_amount: number;
  deadline: string | null;
  color: string | null;
  completed_at: string | null;
  created_at: string;
};

export type SavingsDeposit = {
  id: string;
  goal_id: string;
  amount: number;
  memo: string | null;
  deposited_at: string;
  created_at: string;
};

export type GoalWithProgress = SavingsGoal & {
  current_amount: number;
  percent: number;
};

export async function getGoals(coupleId: string): Promise<GoalWithProgress[]> {
  const { data: goals, error } = await supabaseAdmin
    .from("savings_goals")
    .select("*")
    .eq("couple_id", coupleId)
    .order("completed_at", { nullsFirst: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!goals || goals.length === 0) return [];

  const goalIds = goals.map((g) => g.id);
  const { data: deposits } = await supabaseAdmin
    .from("savings_deposits")
    .select("goal_id, amount")
    .in("goal_id", goalIds);

  const totals = new Map<string, number>();
  for (const d of (deposits ?? []) as Array<{
    goal_id: string;
    amount: number;
  }>) {
    totals.set(d.goal_id, (totals.get(d.goal_id) ?? 0) + d.amount);
  }

  return (goals as SavingsGoal[]).map((g) => {
    const current = totals.get(g.id) ?? 0;
    return {
      ...g,
      current_amount: current,
      percent:
        g.target_amount === 0
          ? 0
          : Math.min(100, (current / g.target_amount) * 100),
    };
  });
}

export async function getActiveGoals(
  coupleId: string,
  limit?: number,
): Promise<GoalWithProgress[]> {
  const all = await getGoals(coupleId);
  const active = all.filter((g) => !g.completed_at);
  return limit ? active.slice(0, limit) : active;
}

export async function getGoal(
  coupleId: string,
  id: string,
): Promise<GoalWithProgress | null> {
  const { data: goal } = await supabaseAdmin
    .from("savings_goals")
    .select("*")
    .eq("couple_id", coupleId)
    .eq("id", id)
    .maybeSingle();

  if (!goal) return null;

  const { data: deposits } = await supabaseAdmin
    .from("savings_deposits")
    .select("amount")
    .eq("goal_id", id);

  const current = ((deposits ?? []) as Array<{ amount: number }>).reduce(
    (sum, d) => sum + d.amount,
    0,
  );

  const g = goal as SavingsGoal;
  return {
    ...g,
    current_amount: current,
    percent:
      g.target_amount === 0
        ? 0
        : Math.min(100, (current / g.target_amount) * 100),
  };
}

export async function getGoalDeposits(
  goalId: string,
): Promise<SavingsDeposit[]> {
  const { data, error } = await supabaseAdmin
    .from("savings_deposits")
    .select("*")
    .eq("goal_id", goalId)
    .order("deposited_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SavingsDeposit[];
}
