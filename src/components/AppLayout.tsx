import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Couple } from "@/lib/session";
import { NavBar } from "./NavBar";

type Props = {
  couple: Couple;
  children: React.ReactNode;
  title?: string;
  backHref?: string;
  headerRight?: React.ReactNode;
};

export function AppLayout({
  couple,
  children,
  title,
  backHref,
  headerRight,
}: Props) {
  return (
    <div className="mx-auto flex w-full max-w-md min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-100 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          {backHref ? (
            <Link
              href={backHref}
              className="shrink-0 text-neutral-500 hover:text-neutral-700"
            >
              <ChevronLeft size={22} />
            </Link>
          ) : null}
          <div className="flex-1 min-w-0">
            {title ? (
              <p className="font-semibold text-neutral-900">{title}</p>
            ) : (
              <>
                <p className="text-xs text-neutral-400">WeCount</p>
                <p className="text-sm font-semibold truncate">
                  {couple.partner_a_name}{" "}
                  <span className="text-rose-400">&amp;</span>{" "}
                  {couple.partner_b_name}
                </p>
              </>
            )}
          </div>
          {headerRight}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-4">{children}</main>

      <NavBar />
    </div>
  );
}
