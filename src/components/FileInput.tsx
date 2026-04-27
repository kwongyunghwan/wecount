"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet } from "lucide-react";

type Props = {
  name: string;
  accept?: string;
};

export function FileInput({ name, accept }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 bg-white py-10 text-center text-sm text-neutral-500 transition hover:border-rose-300 hover:bg-rose-50/30"
      >
        <FileSpreadsheet size={28} className="text-rose-400" />
        {fileName ? (
          <>
            <span className="font-medium text-neutral-700">{fileName}</span>
            <span className="text-xs text-neutral-400">다른 파일로 변경</span>
          </>
        ) : (
          <>
            <span>엑셀 파일 선택</span>
            <span className="text-xs text-neutral-400">.xlsx 또는 .xls</span>
          </>
        )}
      </button>
      <input
        ref={ref}
        name={name}
        type="file"
        accept={accept}
        required
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
    </>
  );
}
