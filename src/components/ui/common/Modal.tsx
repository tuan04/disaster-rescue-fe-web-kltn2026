import { useEffect, type ReactNode } from "react";
import { IoClose } from "react-icons/io5";

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({ open, title, children, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Đóng modal"
        onClick={onClose}
      />

      <section
        className="relative w-full max-w-md rounded-lg bg-surface p-6 text-text shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          {title ? <h2 className="text-title-sm font-bold">{title}</h2> : null}
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-slate-100 hover:text-text"
            aria-label="Đóng"
            onClick={onClose}
          >
            <IoClose size={22} />
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}
