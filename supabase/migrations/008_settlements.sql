-- WeCount 마이그레이션 #008
-- 추가: 월별 정산 기록(settlements) — 공동 지출 50/50 분담을 정산했음을 기록
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  payer text not null check (payer in ('a', 'b')),
  amount bigint not null check (amount > 0),
  settled_at timestamptz not null default now(),
  note text,
  unique (couple_id, year, month)
);

create index if not exists settlements_couple_period_idx
  on public.settlements(couple_id, year desc, month desc);

alter table public.settlements enable row level security;
