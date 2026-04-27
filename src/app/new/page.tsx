import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCouple } from "@/lib/session";
import { createCouple } from "../actions/couple";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "두 사람의 이름을 모두 입력해주세요.",
  create: "커플 생성에 실패했어요. 다시 시도해주세요.",
};

export default async function NewCouplePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const couple = await getCurrentCouple();
  if (couple) redirect("/dashboard");

  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-700"
          >
            ← 뒤로
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">새 커플 만들기</h1>
          <p className="mt-2 text-sm text-neutral-500">
            두 사람의 이름을 입력하면 커플코드가 생성돼요.
          </p>
        </div>

        <form action={createCouple} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="partner_a" className="block text-sm font-medium">
              파트너 A
            </label>
            <input
              id="partner_a"
              name="partner_a"
              type="text"
              autoComplete="off"
              placeholder="예: 민수"
              maxLength={20}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="partner_b" className="block text-sm font-medium">
              파트너 B
            </label>
            <input
              id="partner_b"
              name="partner_b"
              type="text"
              autoComplete="off"
              placeholder="예: 지영"
              maxLength={20}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              required
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-rose-600">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:bg-rose-700"
          >
            커플 만들기
          </button>
        </form>
      </div>
    </main>
  );
}
