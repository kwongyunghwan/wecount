import {
  UtensilsCrossed,
  Coffee,
  Bus,
  Home,
  Smartphone,
  ShoppingBag,
  Stethoscope,
  Film,
  Briefcase,
  Coins,
  Sparkles,
  Tag,
  MoreHorizontal,
  Heart,
  Plane,
  Dumbbell,
  Gift,
  Book,
  Cat,
  Baby,
  Wine,
  Fuel,
  Wrench,
  Scissors,
  CreditCard,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  // 기본 지출
  식비: UtensilsCrossed,
  "카페/간식": Coffee,
  교통: Bus,
  주거: Home,
  통신: Smartphone,
  쇼핑: ShoppingBag,
  의료: Stethoscope,
  "문화/여가": Film,
  기타지출: MoreHorizontal,
  // 기본 수입
  월급: Briefcase,
  용돈: Coins,
  부수입: TrendingUp,
  기타수입: MoreHorizontal,
  // 자주 쓰는 추가 카테고리 (이름 매칭)
  데이트: Heart,
  여행: Plane,
  운동: Dumbbell,
  선물: Gift,
  교육: Book,
  반려동물: Cat,
  육아: Baby,
  술: Wine,
  주유: Fuel,
  수리: Wrench,
  미용: Scissors,
  카드: CreditCard,
  보너스: Sparkles,
};

export function getCategoryIcon(name?: string | null): LucideIcon {
  if (!name) return Tag;
  if (ICON_MAP[name]) return ICON_MAP[name];

  // 키워드 부분 매칭 (사용자 정의 이름 대응)
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (name.includes(key) || key.includes(name)) return icon;
  }
  return Tag;
}

type Props = {
  name?: string | null;
  color?: string | null;
  size?: "sm" | "md";
};

const SIZE_PX = { sm: 24, md: 32 };
const ICON_PX = { sm: 13, md: 16 };

export function CategoryIcon({ name, color, size = "sm" }: Props) {
  const Icon = getCategoryIcon(name);
  const c = color ?? "#737373";
  const dim = SIZE_PX[size];
  const ic = ICON_PX[size];
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        backgroundColor: `${c}22`,
        width: dim,
        height: dim,
      }}
    >
      <Icon size={ic} style={{ color: c }} />
    </div>
  );
}
