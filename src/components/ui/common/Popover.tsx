import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type PopoverProps = {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  offset?: number;
};

export default function Popover({
  open,
  onClose,
  trigger,
  children,
  className = "",
  offset = 8,
}: PopoverProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

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

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      const panel = panelRef.current;
      if (!triggerRect || !panel) return;

      const margin = 8;
      const panelWidth = panel.offsetWidth;
      const panelHeight = panel.offsetHeight;
      const spaceBelow = window.innerHeight - triggerRect.bottom;

      const top =
        spaceBelow >= panelHeight + offset + margin
          ? triggerRect.bottom + offset
          : Math.max(margin, triggerRect.top - panelHeight - offset);

      const left = Math.min(
        Math.max(margin, triggerRect.right - panelWidth),
        window.innerWidth - panelWidth - margin,
      );

      setPanelStyle({ position: "fixed", top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [offset, open]);

  return (
    <>
      <span ref={triggerRef} className="inline-flex">
        {trigger}
      </span>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Đóng popover"
            onClick={onClose}
          />

          <div
            ref={panelRef}
            style={panelStyle}
            className={`relative rounded-lg border border-slate-200 bg-surface text-text shadow-lg ${className}`}
          >
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}
