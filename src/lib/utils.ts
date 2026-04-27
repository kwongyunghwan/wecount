export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function currentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function toDateInputValue(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

const KO_DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const KO_SMALL = ["", "십", "백", "천"];
const KO_LARGE = ["", "만", "억", "조", "경"];

/** 숫자를 한국어로 변환. 예: 12850 → "만이천팔백오십" */
export function numberToKorean(num: number): string {
  if (!Number.isFinite(num) || num === 0) return "";
  let n = Math.abs(Math.trunc(num));
  let result = "";
  let groupIndex = 0;

  while (n > 0) {
    const group = n % 10000;
    if (group > 0) {
      let groupStr = "";
      let temp = group;
      let i = 0;
      while (temp > 0) {
        const digit = temp % 10;
        if (digit > 0) {
          const d = digit === 1 && i > 0 ? "" : KO_DIGITS[digit];
          groupStr = d + KO_SMALL[i] + groupStr;
        }
        temp = Math.floor(temp / 10);
        i++;
      }
      // "일만/일억/일조" → "만/억/조"
      if (groupStr === "일" && groupIndex > 0) groupStr = "";
      result = groupStr + KO_LARGE[groupIndex] + result;
    }
    n = Math.floor(n / 10000);
    groupIndex++;
  }

  return num < 0 ? `마이너스 ${result}` : result;
}
