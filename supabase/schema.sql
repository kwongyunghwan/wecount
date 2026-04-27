-- WeCount: 커플 가계부 스키마
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

-- ============================================================
-- 1. couples: 커플 정보 (커플코드로 식별)
-- ============================================================
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  partner_a_name text not null,
  partner_b_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists couples_code_idx on public.couples(code);

-- ============================================================
-- 2. categories: 카테고리 (수입/지출 구분, 커플별)
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_couple_idx on public.categories(couple_id);

-- ============================================================
-- 3. transactions: 거래 내역
-- ============================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount >= 0),
  memo text,
  occurred_at date not null,
  created_at timestamptz not null default now()
);

create index if not exists transactions_couple_date_idx
  on public.transactions(couple_id, occurred_at desc);
create index if not exists transactions_category_idx
  on public.transactions(category_id);

-- ============================================================
-- 4. RLS: anon 접근 차단 (service_role만 사용하므로 정책 미생성 = 전부 거부)
-- ============================================================
alter table public.couples enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
