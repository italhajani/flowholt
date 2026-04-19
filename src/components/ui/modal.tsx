import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Width class, default w-[480px] */
  width?: string;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, description, children, width = "w-[480px]", footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" style={{ animation: "modalBdIn 150ms ease-out" }} />

      {/* Panel */}
      <div
        className={cn(
          "relative rounded-xl border border-zinc-100 bg-white shadow-xl overflow-hidden",
          width
        )}
        style={{ animation: "modalIn 150ms ease-out" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-900">{title}</h2>
            {description && <p className="text-[12px] text-zinc-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-100 hover:text-zinc-600 transition-colors -mt-0.5"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: "1px solid #f4f4f5" }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalBdIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
