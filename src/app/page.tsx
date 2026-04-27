import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, ArrowRight, Sparkles } from "lucide-react";
import { getCurrentCouple } from "@/lib/session";
import { joinCouple } from "./actions/couple";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "커플코드를 입력해주세요.",
  notfound: "존재하지 않는 커플코드예요. 다시 확인해주세요.",
};

export default async function Home({
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
        <div className="mb-10 text-center">
          <div className="mb-3 flex justify-center">
            <Heart size={40} className="text-rose-500" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">WeCount</h1>
          <p className="mt-2 text-sm text-neutral-500">
            두 사람을 위한 가장 단순한 가계부
          </p>
        </div>

        <form action={joinCouple} className="space-y-3">
          <label htmlFor="code" className="block text-sm font-medium">
            커플코드로 입장
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            placeholder="예: K7M2X9"
            maxLength={6}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center font-mono text-lg uppercase tracking-widest outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            required
          />
          {errorMessage ? (
            <p className="text-sm text-rose-600">{errorMessage}</p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:bg-rose-700"
          >
            <span className="flex items-center justify-center gap-2">
              입장하기 <ArrowRight size={16} />
            </span>
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
          <div className="h-px flex-1 bg-neutral-200" />
          또는
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <Link
          href="/new"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <Sparkles size={15} className="text-rose-400" />
          새 커플 만들기
        </Link>
      </div>
    </main>
  );
}
