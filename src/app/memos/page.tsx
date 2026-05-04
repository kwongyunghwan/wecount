import Link from "next/link";
import { Pin, Plus } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { getMemos } from "@/lib/db/memos";
import { AppLayout } from "@/components/AppLayout";
import { PartnerChip } from "@/components/PartnerChip";
import { Markdown } from "@/components/Markdown";

export default async function MemosPage() {
  const couple = await requireCouple();
  const memos = await getMemos(couple.id);

  return (
    <AppLayout
      couple={couple}
      title="메모"
      headerRight={
        <Link
          href="/memos/new"
          className="flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600"
        >
          <Plus size={13} strokeWidth={2.5} /> 추가
        </Link>
      }
    >
      {memos.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-sm text-neutral-500">
            아직 메모가 없어요.
            <br />첫 메모를 남겨보세요.
          </p>
          <Link
            href="/memos/new"
            className="mt-4 inline-block rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
          >
            첫 메모 쓰기
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {memos.map((m) => (
            <li key={m.id}>
              <Link
                href={`/memos/${m.id}/edit`}
                className={`block rounded-xl border p-3 transition ${
                  m.is_pinned
                    ? "border-teal-100 bg-teal-50/60 hover:bg-teal-50"
                    : "border-neutral-100 bg-white hover:bg-neutral-50"
                }`}
              >
                {m.is_pinned ? (
                  <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium text-rose-600">
                    <Pin size={10} /> 고정됨
                  </div>
                ) : null}
                <div className="line-clamp-4 overflow-hidden">
                  <Markdown content={m.content} />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <PartnerChip
                    partner={m.author}
                    name={
                      m.author === "a"
                        ? couple.partner_a_name
                        : couple.partner_b_name
                    }
                  />
                  <p className="text-[10px] text-neutral-400">
                    {new Date(m.updated_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}
