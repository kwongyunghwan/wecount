import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  className?: string;
};

export function Markdown({ content, className }: Props) {
  return (
    <div className={`text-sm text-neutral-800 ${className ?? ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => (
            <h1 className="mb-1.5 mt-2 text-base font-bold first:mt-0" {...props} />
          ),
          h2: (props) => (
            <h2 className="mb-1.5 mt-2 text-sm font-bold first:mt-0" {...props} />
          ),
          h3: (props) => (
            <h3
              className="mb-1 mt-2 text-sm font-semibold first:mt-0"
              {...props}
            />
          ),
          p: (props) => <p className="my-1.5 first:mt-0 last:mb-0" {...props} />,
          ul: (props) => (
            <ul
              className="my-1.5 list-disc space-y-0.5 pl-5 first:mt-0 last:mb-0"
              {...props}
            />
          ),
          ol: (props) => (
            <ol
              className="my-1.5 list-decimal space-y-0.5 pl-5 first:mt-0 last:mb-0"
              {...props}
            />
          ),
          li: (props) => <li className="leading-snug" {...props} />,
          strong: (props) => (
            <strong className="font-semibold text-neutral-900" {...props} />
          ),
          em: (props) => <em className="italic" {...props} />,
          a: (props) => (
            <a
              className="text-rose-600 underline underline-offset-2 hover:text-rose-700"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          code: (props) => (
            <code
              className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.85em] text-rose-700"
              {...props}
            />
          ),
          pre: (props) => (
            <pre
              className="my-2 overflow-x-auto rounded-lg bg-neutral-900 p-3 font-mono text-xs text-neutral-100"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="my-1.5 border-l-2 border-neutral-300 pl-3 italic text-neutral-600"
              {...props}
            />
          ),
          hr: () => <hr className="my-3 border-neutral-200" />,
          table: (props) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs" {...props} />
            </div>
          ),
          th: (props) => (
            <th
              className="border border-neutral-200 bg-neutral-50 px-2 py-1 text-left font-semibold"
              {...props}
            />
          ),
          td: (props) => (
            <td className="border border-neutral-200 px-2 py-1" {...props} />
          ),
          input: (props) =>
            props.type === "checkbox" ? (
              <input
                {...props}
                disabled
                className="mr-1 align-middle accent-rose-500"
              />
            ) : (
              <input {...props} />
            ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
