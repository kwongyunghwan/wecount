import { Download } from "lucide-react";
import { requireCouple } from "@/lib/session";
import { AppLayout } from "@/components/AppLayout";
import { ImportClient } from "./ImportClient";

export default async function ImportPage() {
  const couple = await requireCouple();

  return (
    <AppLayout
      couple={couple}
      title="엑셀로 불러오기"
      backHref="/transactions/new"
    >
      <div className="space-y-5">
        {/* 안내 */}
        <section className="rounded-xl border border-neutral-100 bg-white p-4">
          <p className="mb-3 text-sm font-semibold">필요한 컬럼</p>
          <ul className="space-y-1.5 text-xs text-neutral-600">
            <li>
              <span className="font-mono font-semibold text-neutral-800">
                거래일시
              </span>{" "}
              (또는 <span className="font-mono">날짜</span>,{" "}
              <span className="font-mono">거래일</span>) — 필수
            </li>
            <li>
              <span className="font-mono font-semibold text-neutral-800">
                거래금액
              </span>{" "}
              (또는 <span className="font-mono">금액</span>) — 필수.{" "}
              <span className="text-rose-500 font-semibold">음수면 출금</span>
              (지출),{" "}
              <span className="text-emerald-600 font-semibold">양수면 입금</span>
              (수입)
            </li>
          </ul>
          <p className="mt-3 mb-2 text-xs font-semibold text-neutral-500">
            추가로 있으면 함께 저장되는 컬럼
          </p>
          <ul className="space-y-1.5 text-xs text-neutral-600">
            <li>
              <span className="font-mono font-semibold text-neutral-800">
                메모
              </span>{" "}
              (또는 <span className="font-mono">이름</span>,{" "}
              <span className="font-mono">적요</span>,{" "}
              <span className="font-mono">내역</span>)
            </li>
            <li>
              <span className="font-mono font-semibold text-neutral-800">
                카테고리
              </span>{" "}
              — 카테고리 이름이 정확히 일치해야 매칭
            </li>
            <li>
              <span className="font-mono font-semibold text-neutral-800">
                결제자
              </span>{" "}
              — {couple.partner_a_name} / {couple.partner_b_name} (없으면{" "}
              <span className="font-semibold text-rose-600">공동</span>)
            </li>
            <li>
              <span className="font-mono font-semibold text-neutral-800">
                공동/개인
              </span>{" "}
              — <span className="font-mono">개인</span>이면 개인, 그 외는 공동
            </li>
          </ul>
        </section>

        {/* 템플릿 다운로드 */}
        <a
          href="/api/import/template"
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
        >
          <Download size={15} /> 템플릿 다운로드 (.xlsx)
        </a>

        {/* 폼 + 결과 */}
        <ImportClient />
      </div>
    </AppLayout>
  );
}
