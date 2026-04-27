import Link from "next/link";

type Props = {
  active: "month" | "year";
  year: number;
  month: number;
};

export function StatsTabs({ active, year, month }: Props) {
  return (
    <div className="mb-4 flex rounded-xl border border-neutral-200 bg-white p-1">
      <Link
        href={`/stats?year=${year}&month=${month}`}
        className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
          active === "month"
            ? "bg-rose-500 text-white shadow-sm"
            : "text-neutral-500 hover:text-neutral-700"
        }`}
      >
        월별
      </Link>
      <Link
        href={`/stats/year?year=${year}`}
        className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold transition ${
          active === "year"
            ? "bg-rose-500 text-white shadow-sm"
            : "text-neutral-500 hover:text-neutral-700"
        }`}
      >
        년도별
      </Link>
    </div>
  );
}
