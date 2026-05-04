-- WeCount 마이그레이션 #004
-- 추가: 커플 메모(memos) — 작성자(a/b) 표시, 1개 핀 고정 지원
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

-- ============================================================
-- memos: 커플 공유 메모 (여러 개 작성, 1개만 pinned 가능)
-- ============================================================
create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  content text not null,
  author text not null check (author in ('a', 'b')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memos_couple_idx
  on public.memos(couple_id, created_at desc);

-- 커플당 핀 고정은 최대 1개
create unique index if not exists memos_couple_pinned_unique
  on public.memos(couple_id) where is_pinned;

alter table public.memos enable row level security;
