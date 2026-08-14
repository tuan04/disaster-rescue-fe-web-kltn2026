import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function FormField({
  label,
  error,
  id,
  className = "",
  disabled = false,
  ...inputProps
}: FormFieldProps) {
  const inputId = id ?? inputProps.name;

  return (
    <label className="flex flex-col gap-1.5" htmlFor={inputId}>
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        className={`h-10 rounded-md border bg-white px-3 text-sm text-text outline-none transition-colors placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-text-muted ${
          error
            ? "border-danger focus:border-danger focus:ring-danger/20"
            : "border-slate-300 focus:border-secondary focus:ring-secondary/30"
        } ${className}`}
        {...inputProps}
      />
      {error ? (
        <span id={inputId ? `${inputId}-error` : undefined} className="text-xs font-medium text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}
