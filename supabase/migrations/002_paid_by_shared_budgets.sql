-- WeCount 마이그레이션 #002
-- 추가: 누가 결제했는지(paid_by), 공동/개인 구분(is_shared), 카테고리별 월 예산(budgets)
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

-- ============================================================
-- 1. transactions에 paid_by, is_shared 컬럼 추가
-- ============================================================
alter table public.transactions
  add column if not exists paid_by text not null default 'a'
    check (paid_by in ('a', 'b'));

alter table public.transactions
  add column if not exists is_shared boolean not null default true;

-- 인덱스: 사람별 / 공동여부별 집계 가속
create index if not exists transactions_couple_paidby_idx
  on public.transactions(couple_id, paid_by);
create index if not exists transactions_couple_shared_idx
  on public.transactions(couple_id, is_shared);

-- ============================================================
-- 2. budgets: 카테고리별 월 예산
-- ============================================================
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  amount bigint not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (couple_id, category_id, year, month)
);

create index if not exists budgets_couple_period_idx
  on public.budgets(couple_id, year, month);

alter table public.budgets enable row level security;
