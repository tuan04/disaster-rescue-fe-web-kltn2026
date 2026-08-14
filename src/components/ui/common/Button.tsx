import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function Button({
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-body-sm font-semibold text-primary transition-colors hover:bg-secondary/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
