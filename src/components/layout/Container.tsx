import type { HTMLAttributes, ReactNode } from 'react';

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Container({
  children,
  className = '',
  ...props
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 xl:px-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
