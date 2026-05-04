import Link from "next/link";
import {
  Users,
  Tag,
  LogOut,
  Trash2,
  Plus,
  RotateCw,
  Target,
  ChevronRight,
} from "lucide-react";
import { requireCouple } from "@/lib/session";
import { getCategories, type Category } from "@/lib/db/categories";
import { AppLayout } from "@/components/AppLayout";
import { CategoryIcon } from "@/components/CategoryIcon";
import { createCategory, deleteCategory } from "@/app/actions/category";
import { leaveCouple } from "@/app/actions/couple";

export default async function SettingsPage() {
  const couple = await requireCouple();
  const categories = await getCategories(couple.id);

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");
  const savingsCategories = categories.filter((c) => c.type === "savings");

  return (
    <AppLayout couple={couple} title="설정">
      <div className="space-y-8">
        {/* 커플 정보 */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-600">
            <Users size={14} /> 커플 정보
          </h2>
          <div className="rounded-xl border border-neutral-100 bg-white p-4">
            <p className="text-sm font-medium">
              {couple.partner_a_name}{" "}
              <span className="text-rose-400">&amp;</span>{" "}
              {couple.partner_b_name}
            </p>
            <p className="mt-1 font-mono text-xs text-neutral-500">
              코드 {couple.code}
            </p>
          </div>
        </section>

        {/* 메뉴 */}
        <section>
          <ul className="space-y-2">
            <SettingsLink
              href="/recurring"
              icon={RotateCw}
              label="고정비"
              desc="월세, 구독 등 매달 자동 등록"
            />
            <SettingsLink
              href="/goals"
              icon={Target}
              label="저축 목표"
              desc="여행 자금, 비상금 등 목표 진행률"
            />
          </ul>
        </section>

        {/* 지출 카테고리 */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-600">
            <Tag size={14} /> 지출 카테고리
          </h2>
          <CategoryList categories={expenseCategories} />
          <AddCategoryForm type="expense" action={createCategory} />
        </section>

        {/* 수입 카테고리 */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-600">
            <Tag size={14} /> 수입 카테고리
          </h2>
          <CategoryList categories={incomeCategories} />
          <AddCategoryForm type="income" action={createCategory} />
        </section>

        {/* 저금 카테고리 */}
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-600">
            <Tag size={14} /> 저금 카테고리
          </h2>
          <CategoryList categories={savingsCategories} />
          <AddCategoryForm type="savings" action={createCategory} />
        </section>

        {/* 나가기 */}
        <section className="pt-2">
          <form action={leaveCouple}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-sm text-neutral-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
            >
              <LogOut size={14} /> 커플에서 나가기
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}

function SettingsLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4 transition hover:border-neutral-200 hover:bg-neutral-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-neutral-500">{desc}</p>
        </div>
        <ChevronRight size={16} className="text-neutral-300" />
      </Link>
    </li>
  );
}

function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <p className="mb-3 text-sm text-neutral-400">카테고리가 없어요.</p>
    );
  }
  return (
    <ul className="mb-3 space-y-2">
      {categories.map((c) => (
        <li
          key={c.id}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <CategoryIcon name={c.name} color={c.color} />
            <span className="text-sm">{c.name}</span>
          </div>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={c.id} />
            <button
              type="submit"
              aria-label="삭제"
              className="text-neutral-300 hover:text-rose-500"
            >
              <Trash2 size={14} />
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

function AddCategoryForm({
  type,
  action,
}: {
  type: "income" | "expense" | "savings";
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="color" value="#737373" />
      <input
        name="name"
        type="text"
        placeholder="새 카테고리 이름"
        maxLength={20}
        className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        required
      />
      <button
        type="submit"
        className="flex items-center gap-1 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
      >
        <Plus size={14} strokeWidth={2.5} /> 추가
      </button>
    </form>
  );
}
