import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Undo2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
  createdAt: number;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, opts?: { title?: string; action?: Toast["action"]; duration?: number }) => void;
  notifications: Toast[];
  clearNotifications: () => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {}, notifications: [], clearNotifications: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 size={15} className="text-green-500" />,
  error:   <XCircle size={15} className="text-red-500" />,
  warning: <AlertTriangle size={15} className="text-amber-500" />,
  info:    <Info size={15} className="text-blue-500" />,
};

const MAX_VISIBLE = 5;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notificationsRef = useRef<Toast[]>([]);
  const [notifications, setNotifications] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "info", opts?: { title?: string; action?: Toast["action"]; duration?: number }) => {
    const id = Math.random().toString(36).slice(2, 9);
    const duration = opts?.duration ?? (variant === "error" ? 8000 : 4000);
    const newToast: Toast = { id, message, variant, title: opts?.title, action: opts?.action, createdAt: Date.now(), duration };
    setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), newToast]);
    // Add to notification history
    notificationsRef.current = [newToast, ...notificationsRef.current].slice(0, 50);
    setNotifications([...notificationsRef.current]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    notificationsRef.current = [];
    setNotifications([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, notifications, clearNotifications }}>
      {children}

      {/* Toast container — bottom-right */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t, i) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-2.5 rounded-lg bg-white px-4 py-3 shadow-lg border relative overflow-hidden"
            style={{
              borderColor: "var(--color-border-default)",
              animation: "toastIn 200ms ease-out",
              minWidth: "300px",
              maxWidth: "420px",
              opacity: i < toasts.length - MAX_VISIBLE ? 0.5 : 1,
            }}
          >
            <span className="mt-0.5">{icons[t.variant]}</span>
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-[13px] font-semibold text-zinc-800">{t.title}</p>}
              <p className={cn("text-[12px] text-zinc-600", t.title && "mt-0.5")}>{t.message}</p>
              {t.action && (
                <button
                  onClick={() => { t.action!.onClick(); dismiss(t.id); }}
                  className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t.variant === "success" ? <Undo2 size={10} /> : <RefreshCw size={10} />}
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 text-zinc-300 hover:text-zinc-500 transition-colors mt-0.5"
            >
              <X size={13} />
            </button>
            {/* Auto-dismiss progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-100">
              <div
                className={cn(
                  "h-full rounded-full",
                  t.variant === "error" ? "bg-red-400" : t.variant === "warning" ? "bg-amber-400" : t.variant === "success" ? "bg-green-400" : "bg-blue-400"
                )}
                style={{ animation: `toastProgress ${t.duration}ms linear forwards` }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
