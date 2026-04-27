type Props = {
  current: number;
  target: number;
  percent: number;
  color: string | null;
  size?: "sm" | "md";
};

export function GoalProgress({ current, target, percent, color, size = "md" }: Props) {
  const barColor = color ?? "#f43f5e";
  const reached = percent >= 100;
  const heightClass = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold tabular-nums">
          {current.toLocaleString("ko-KR")}원
          <span className="text-neutral-400">
            {" "}/ {target.toLocaleString("ko-KR")}원
          </span>
        </span>
        <span
          className={`tabular-nums font-semibold ${
            reached ? "text-emerald-600" : "text-neutral-500"
          }`}
        >
          {Math.floor(percent)}%
        </span>
      </div>
      <div
        className={`overflow-hidden rounded-full bg-neutral-100 ${heightClass}`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percent}%`,
            backgroundColor: reached ? "#10b981" : barColor,
          }}
        />
      </div>
    </div>
  );
}
