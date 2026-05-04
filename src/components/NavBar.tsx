"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, StickyNote, BarChart3, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "홈" },
  { href: "/transactions", icon: Receipt, label: "거래" },
  { href: "/memos", icon: StickyNote, label: "메모" },
  { href: "/stats", icon: BarChart3, label: "통계" },
  { href: "/settings", icon: Settings, label: "설정" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-neutral-100 bg-white">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-3 text-xs transition ${
                active
                  ? "text-rose-500"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
