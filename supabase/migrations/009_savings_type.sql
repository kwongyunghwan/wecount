-- WeCount 마이그레이션 #009
-- 추가: 거래 타입에 'savings'(저금) 추가 — 수입/지출과 별개로 잔액에서 차감되는
--       이체성 기록. transactions, recurring_transactions, categories 모두 확장.
--
-- 실행 방법: Supabase 대시보드 → SQL Editor → New query → 아래 내용 붙여넣고 RUN

alter table public.transactions
  drop constraint if exists transactions_type_check;
alter table public.transactions
  add constraint transactions_type_check
  check (type in ('income', 'expense', 'savings'));

alter table public.recurring_transactions
  drop constraint if exists recurring_transactions_type_check;
alter table public.recurring_transactions
  add constraint recurring_transactions_type_check
  check (type in ('income', 'expense', 'savings'));

alter table public.categories
  drop constraint if exists categories_type_check;
alter table public.categories
  add constraint categories_type_check
  check (type in ('income', 'expense', 'savings'));
