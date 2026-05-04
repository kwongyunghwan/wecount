"use client";

import { useState } from "react";
import { Markdown } from "./Markdown";

type Props = {
  defaultValue?: string;
  placeholder?: string;
};

const TAB_BTN =
  "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition";
const TAB_ACTIVE = "bg-white text-neutral-900 shadow-sm";
const TAB_IDLE = "text-neutral-500 hover:text-neutral-700";

export function MemoEditor({ defaultValue = "", placeholder }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");

  return (
    <div className="space-y-2">
      <div className="flex w-full rounded-lg bg-neutral-100 p-1">
        <button
          type="button"
          onClick={() => setMode("write")}
          className={`${TAB_BTN} ${mode === "write" ? TAB_ACTIVE : TAB_IDLE}`}
        >
          작성
        </button>
        <button
          type="button"
          onClick={() => setMode("preview")}
          className={`${TAB_BTN} ${mode === "preview" ? TAB_ACTIVE : TAB_IDLE}`}
        >
          미리보기
        </button>
      </div>

      {mode === "write" ? (
        <textarea
          name="content"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={10}
          placeholder={placeholder}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          required
        />
      ) : (
        <>
          <input type="hidden" name="content" value={value} />
          <div className="min-h-[10rem] rounded-xl border border-neutral-200 bg-white px-4 py-3">
            {value.trim() ? (
              <Markdown content={value} />
            ) : (
              <p className="text-sm text-neutral-400">표시할 내용이 없어요.</p>
            )}
          </div>
        </>
      )}

      <p className="text-[11px] text-neutral-400">
        마크다운을 지원해요. **굵게**, *기울임*, # 제목, - 리스트, [링크](url),
        `코드`
      </p>
    </div>
  );
}
