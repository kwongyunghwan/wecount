type Props = {
  name: string;
  partner: "a" | "b";
  size?: "sm" | "md";
};

const STYLES: Record<"a" | "b", string> = {
  a: "bg-sky-100 text-sky-700",
  b: "bg-violet-100 text-violet-700",
};

const SIZES: Record<"sm" | "md", string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
};

export function PartnerChip({ name, partner, size = "sm" }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded font-medium ${STYLES[partner]} ${SIZES[size]}`}
    >
      {name}
    </span>
  );
}

export const PARTNER_BAR_COLOR: Record<"a" | "b", string> = {
  a: "bg-sky-400",
  b: "bg-violet-400",
};

export const PARTNER_TEXT_COLOR: Record<"a" | "b", string> = {
  a: "text-sky-600",
  b: "text-violet-600",
};
