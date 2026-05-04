-- WeCount 마이그레이션 #005
-- 변경: 메모 핀 고정을 커플당 1개 → 커플 × 작성자(a/b)당 1개
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

drop index if exists public.memos_couple_pinned_unique;

create unique index if not exists memos_couple_author_pinned_unique
  on public.memos(couple_id, author) where is_pinned;
