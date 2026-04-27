"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";
import type { Category } from "@/lib/db/categories";

type Props = {
  categories: Category[];
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
};

export function CategorySelect({
  categories,
  name,
  defaultValue,
  placeholder = "카테고리 없음",
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultValue ?? null,
  );
  const ref = useRef<HTMLDivElement>(null);

  const selected = selectedId
    ? categories.find((c) => c.id === selectedId)
    : null;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
    }
  }, [open]);

  function pick(id: string | null) {
    setSelectedId(id);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name={name} value={selectedId ?? ""} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left transition ${
          open
            ? "border-rose-400 ring-2 ring-rose-100"
            : "border-neutral-200 hover:border-neutral-300"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <CategoryIcon
                name={selected.name}
                color={selected.color}
              />
              <span className="truncate text-sm font-medium">
                {selected.name}
              </span>
            </>
          ) : (
            <span className="text-sm text-neutral-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-neutral-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-neutral-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => pick(null)}
            className={`flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-neutral-50 ${
              selectedId === null ? "text-rose-600" : "text-neutral-500"
            }`}
          >
            <span>카테고리 없음</span>
            {selectedId === null ? <Check size={14} /> : null}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-neutral-50 ${
                selectedId === c.id ? "bg-rose-50/60" : ""
              }`}
            >
              <CategoryIcon name={c.name} color={c.color} />
              <span className="flex-1 text-left font-medium">{c.name}</span>
              {selectedId === c.id ? (
                <Check size={14} className="text-rose-500" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
