import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdminCardProps = {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AdminCard({ title, children, className = "" }: AdminCardProps) {
  return (
    <section className={`rounded-lg bg-surface shadow-sm ring-1 ring-black/5 ${className}`}>
      {title ? (
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-body font-semibold text-text">{title}</h3>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

type ButtonVariant = "primary" | "outline" | "ghost" | "link" | "danger";

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  icon?: ReactNode;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  outline: "border border-slate-300 bg-white text-text hover:bg-slate-50",
  ghost: "text-text hover:bg-slate-100",
  link: "h-auto p-0 text-primary hover:text-primary/75",
  danger: "h-auto p-0 text-danger hover:text-danger/75",
};

export function AdminButton({
  variant = "outline",
  size = "md",
  icon,
  className = "",
  children,
  type = "button",
  ...props
}: AdminButtonProps) {
  const sizeClass = size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-4 text-sm";
  const sizing = variant === "link" || variant === "danger" ? "text-sm font-medium" : sizeClass;

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${buttonVariants[variant]} ${sizing} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

type TagTone =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "magenta"
  | "volcano";

type StatusTagProps = {
  tone?: TagTone;
  children: ReactNode;
};

const tagTones: Record<TagTone, string> = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  primary: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-amber-700 ring-warning/20",
  danger: "bg-danger/10 text-danger ring-danger/20",
  info: "bg-secondary/10 text-cyan-700 ring-secondary/20",
  magenta: "bg-pink-50 text-pink-700 ring-pink-200",
  volcano: "bg-orange-50 text-orange-700 ring-orange-200",
};

export function StatusTag({ tone = "default", children }: StatusTagProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tagTones[tone]}`}
    >
      {children}
    </span>
  );
}

export type DataTableColumn<T> = {
  key: string;
  title: ReactNode;
  className?: string;
  render: (record: T) => ReactNode;
};

type DataTableProps<T extends { key: string }> = {
  columns: DataTableColumn<T>[];
  rows: T[];
};

export function DataTable<T extends { key: string }>({ columns, rows }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 font-semibold text-slate-600 ${column.className ?? ""}`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 text-slate-700 ${column.className ?? ""}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: number;
  tone: "danger" | "warning" | "success";
  icon: ReactNode;
  suffix?: ReactNode;
};

const statToneText = {
  danger: "text-danger",
  warning: "text-amber-700",
  success: "text-success",
};

export function StatCard({ title, value, tone, icon, suffix }: StatCardProps) {
  return (
    <AdminCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <div className={`mt-2 flex items-center gap-2 text-3xl font-bold ${statToneText[tone]}`}>
            {icon}
            <span>{value}</span>
          </div>
        </div>
        {suffix ? <div className={`mt-8 text-xs font-medium ${statToneText[tone]}`}>{suffix}</div> : null}
      </div>
    </AdminCard>
  );
}
