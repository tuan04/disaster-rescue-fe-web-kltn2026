import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxOptionProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: ReactNode;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export default function CheckboxOption({
  label,
  className = "",
  inputClassName = "",
  labelClassName = "",
  checked,
  defaultChecked,
  ...props
}: CheckboxOptionProps) {
  const selected = Boolean(checked ?? defaultChecked);

  return (
    <label
      className={`flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:cursor-pointer has-disabled:pointer-events-none has-disabled:opacity-50 ${
        selected
          ? "border-secondary bg-secondary/10 text-primary"
          : "border-slate-200 bg-white text-slate-700 hover:border-secondary/50"
      } ${className}`}
    >
      <input
        type="checkbox"
        className={`h-4 w-4 accent-secondary ${inputClassName}`}
        checked={checked}
        defaultChecked={defaultChecked}
        {...props}
      />
      <span className={labelClassName}>{label}</span>
    </label>
  );
}
