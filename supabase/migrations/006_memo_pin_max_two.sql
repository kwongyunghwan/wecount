-- WeCount 마이그레이션 #006
-- 변경: 메모 핀 정책을 "작성자별 1개"에서 "커플당 최대 2개(작성자 무관)"로 변경
-- 개수 제한은 애플리케이션에서 관리(가장 오래된 핀을 자동 해제)
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

drop index if exists public.memos_couple_author_pinned_unique;
