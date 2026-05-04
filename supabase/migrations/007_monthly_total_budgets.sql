-- WeCount 마이그레이션 #007
-- 추가: 월 총 예산(monthly_total_budgets) — 카테고리별 예산과 별개로
--       "이번 달 총 한도"를 잡을 수 있는 단일 값
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

create table if not exists public.monthly_total_budgets (
  couple_id uuid not null references public.couples(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  amount bigint not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (couple_id, year, month)
);

alter table public.monthly_total_budgets enable row level security;
