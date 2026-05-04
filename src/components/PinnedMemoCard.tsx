import Link from "next/link";
import { Pin, ChevronRight, Plus } from "lucide-react";
import type { Couple } from "@/lib/session";
import type { Memo } from "@/lib/db/memos";
import { PartnerChip } from "./PartnerChip";
import { Markdown } from "./Markdown";
import { SectionHeader } from "./SectionHeader";

const MAX_PINNED = 2;

type Props = {
  memos: Memo[];
  couple: Couple;
};

export function PinnedMemoCard({ memos, couple }: Props) {
  const hasRoom = memos.length < MAX_PINNED;

  return (
    <section>
      <SectionHeader
        icon={Pin}
        iconColor="text-teal-500"
        accentColor="bg-teal-400"
        title="고정 메모"
        right={
          <Link
            href="/memos"
            className="flex items-center gap-0.5 text-xs text-neutral-500 hover:text-neutral-700"
          >
            전체보기 <ChevronRight size={12} />
          </Link>
        }
      />

      <div className="space-y-2">
        {memos.map((memo) => (
          <Link
            key={memo.id}
            href={`/memos/${memo.id}/edit`}
            className="block rounded-xl border border-teal-100 bg-teal-50/60 p-3 transition hover:bg-teal-50"
          >
            <Markdown content={memo.content} />
            <div className="mt-2 flex items-center justify-between">
              <PartnerChip
                partner={memo.author}
                name={
                  memo.author === "a"
                    ? couple.partner_a_name
                    : couple.partner_b_name
                }
              />
              <p className="text-[10px] text-neutral-400">
                {new Date(memo.updated_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </Link>
        ))}

        {hasRoom ? (
          <Link
            href="/memos/new?pin=1"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-200 py-5 text-xs text-neutral-400 transition hover:border-neutral-300 hover:text-neutral-500"
          >
            <Plus size={13} /> 고정 메모 추가
            <span className="text-neutral-300">
              ({memos.length}/{MAX_PINNED})
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
