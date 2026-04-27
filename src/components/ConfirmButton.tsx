"use client";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
};

export function ConfirmButton({ message, onClick, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        if (!confirm(message)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
