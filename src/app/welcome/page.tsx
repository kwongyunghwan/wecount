import Link from "next/link";
import { redirect } from "next/navigation";
import { PartyPopper, Key, ArrowRight } from "lucide-react";
import { getCurrentCouple } from "@/lib/session";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const couple = await getCurrentCouple();
  if (!couple) redirect("/");

  const { code: queryCode } = await searchParams;
  const code = queryCode ?? couple.code;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="mb-3 flex justify-center">
          <PartyPopper size={42} className="text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          커플이 만들어졌어요!
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          아래 커플코드를 상대방에게 알려주세요.
        </p>

        <div className="my-8 rounded-2xl border border-rose-100 bg-rose-50 p-6">
          <div className="flex items-center justify-center gap-1.5 text-rose-500">
            <Key size={13} />
            <p className="text-xs font-medium uppercase tracking-wider text-rose-600">
              커플코드
            </p>
          </div>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[0.3em] text-rose-700">
            {code}
          </p>
        </div>

        <p className="mb-6 text-xs text-neutral-500">
          상대방은 시작 화면에서 이 코드를 입력하면 같이 가계부를 쓸 수 있어요.
        </p>

        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:bg-rose-700"
        >
          시작하기 <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
