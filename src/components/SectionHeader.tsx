import type { LucideIcon } from "lucide-react";

type Props = {
  icon?: LucideIcon;
  iconColor?: string;
  accentColor?: string;
  title: string;
  right?: React.ReactNode;
  className?: string;
};

export function SectionHeader({
  icon: Icon,
  iconColor = "text-rose-500",
  accentColor = "bg-rose-400",
  title,
  right,
  className,
}: Props) {
  return (
    <div
      className={`mb-3 flex items-center justify-between ${className ?? ""}`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-4 w-1 rounded-full ${accentColor}`} />
        {Icon ? <Icon size={15} className={iconColor} /> : null}
        <p className="text-base font-bold text-neutral-900">{title}</p>
      </div>
      {right}
    </div>
  );
}
