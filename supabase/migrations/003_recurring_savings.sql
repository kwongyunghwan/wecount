-- WeCount 마이그레이션 #003
-- 추가: 고정비 자동 등록(recurring_transactions), 저축 목표(savings_goals + savings_deposits)
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

-- ============================================================
-- 1. recurring_transactions: 매달 자동 등록되는 거래 (월세, 구독 등)
-- ============================================================
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount >= 0),
  paid_by text not null default 'a' check (paid_by in ('a', 'b')),
  is_shared boolean not null default true,
  day_of_month int not null check (day_of_month between 1 and 31),
  memo text,
  is_active boolean not null default true,
  -- 마지막으로 자동 등록된 (year, month) — 중복 방지용
  last_run_year int,
  last_run_month int,
  created_at timestamptz not null default now()
);

create index if not exists recurring_couple_idx
  on public.recurring_transactions(couple_id);

alter table public.recurring_transactions enable row level security;

-- ============================================================
-- 2. savings_goals: 저축 목표 (여행 자금 등)
-- ============================================================
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null,
  target_amount bigint not null check (target_amount > 0),
  deadline date,
  color text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists savings_goals_couple_idx
  on public.savings_goals(couple_id);

alter table public.savings_goals enable row level security;

-- ============================================================
-- 3. savings_deposits: 저축 입금 기록
-- ============================================================
create table if not exists public.savings_deposits (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  amount bigint not null check (amount > 0),
  memo text,
  deposited_at date not null,
  created_at timestamptz not null default now()
);

create index if not exists savings_deposits_goal_idx
  on public.savings_deposits(goal_id);

alter table public.savings_deposits enable row level security;
