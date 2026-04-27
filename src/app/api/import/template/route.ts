import * as XLSX from "xlsx";
import { requireCouple } from "@/lib/session";

export async function GET() {
  const couple = await requireCouple();
  const a = couple.partner_a_name;
  const b = couple.partner_b_name;

  const ws = XLSX.utils.aoa_to_sheet([
    ["거래일시", "거래금액", "메모", "카테고리", "결제자", "공동/개인"],
    ["2025-04-01", -30000, "스타벅스", "카페/간식", a, "공동"],
    ["2025-04-02", -18000, "마라탕", "식비", b, "공동"],
    ["2025-04-05", -5000, "지하철", "교통", a, "개인"],
    ["2025-04-25", 3000000, "월급", "월급", a, "개인"],
  ]);

  // 컬럼 너비
  ws["!cols"] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "거래");
  const buffer: ArrayBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="wecount-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
