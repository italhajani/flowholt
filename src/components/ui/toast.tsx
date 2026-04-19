import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Undo2, RefreshCw, Loader2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info" | "pending";

interface Toast {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
  createdAt: number;
  duration: number;
  persistent?: boolean;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, opts?: { title?: string; action?: Toast["action"]; duration?: number; persistent?: boolean }) => string;
  dismiss: (id: string) => void;
  update: (id: string, message: string, variant?: ToastVariant) => void;
  notifications: Toast[];
  clearNotifications: () => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => "", dismiss: () => {}, update: () => {}, notifications: [], clearNotifications: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 size={15} className="text-green-500" />,
  error:   <XCircle size={15} className="text-red-500" />,
  warning: <AlertTriangle size={15} className="text-amber-500" />,
  info:    <Info size={15} className="text-blue-500" />,
  pending: <Loader2 size={15} className="text-blue-500 animate-spin" />,
};

const MAX_VISIBLE = 5;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notificationsRef = useRef<Toast[]>([]);
  const [notifications, setNotifications] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "info", opts?: { title?: string; action?: Toast["action"]; duration?: number; persistent?: boolean }) => {
    const id = Math.random().toString(36).slice(2, 9);
    const persistent = opts?.persistent || variant === "pending";
    const duration = persistent ? 0 : (opts?.duration ?? (variant === "error" ? 8000 : 4000));
    const newToast: Toast = { id, message, variant, title: opts?.title, action: opts?.action, createdAt: Date.now(), duration, persistent };
    setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), newToast]);
    notificationsRef.current = [newToast, ...notificationsRef.current].slice(0, 50);
    setNotifications([...notificationsRef.current]);
    if (!persistent && duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const update = useCallback((id: string, message: string, variant?: ToastVariant) => {
    setToasts((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const updated = { ...t, message, variant: variant ?? t.variant, persistent: variant === "pending" };
      if (variant && variant !== "pending") {
        setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 3000);
      }
      return updated;
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    notificationsRef.current = [];
    setNotifications([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss, update, notifications, clearNotifications }}>
      {children}

      {/* Toast container — bottom-right */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t, i) => {
          const stackOffset = Math.max(0, toasts.length - MAX_VISIBLE);
          const stackIdx = i - stackOffset;
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-2.5 rounded-lg bg-white px-4 py-3 shadow-lg border relative overflow-hidden",
                t.variant === "pending" && "border-blue-200 bg-blue-50/30",
              )}
              style={{
                borderColor: t.variant === "pending" ? undefined : "var(--color-border-default)",
                animation: `toastIn 200ms ease-out ${stackIdx * 30}ms both`,
                minWidth: "300px",
                maxWidth: "420px",
                opacity: stackIdx < 0 ? 0.5 : 1,
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
            {/* Auto-dismiss progress bar (hidden for persistent toasts) */}
            {!t.persistent && t.duration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-100">
              <div
                className={cn(
                  "h-full rounded-full",
                  t.variant === "error" ? "bg-red-400" : t.variant === "warning" ? "bg-amber-400" : t.variant === "success" ? "bg-green-400" : "bg-blue-400"
                )}
                style={{ animation: `toastProgress ${t.duration}ms linear forwards` }}
              />
            </div>
            )}
            {t.variant === "pending" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden bg-blue-100">
                <div className="h-full w-1/3 bg-blue-400 rounded-full" style={{ animation: "toastPendingSlide 1.5s ease-in-out infinite" }} />
              </div>
            )}
          </div>
          );
        })}
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
        @keyframes toastPendingSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
