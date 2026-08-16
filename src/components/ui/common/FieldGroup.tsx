import type { HTMLAttributes, ReactNode } from "react";

type FieldGroupProps = HTMLAttributes<HTMLDivElement> & {
  items: ReactNode[];
};

export default function FieldGroup({
  items,
  className = "flex flex-wrap gap-2",
  ...props
}: FieldGroupProps) {
  return (
    <div className={className} {...props}>
      {items.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  );
}
