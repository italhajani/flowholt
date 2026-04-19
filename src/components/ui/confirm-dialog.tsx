import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const respond = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
            onClick={() => respond(false)}
            style={{ animation: "fadeIn 100ms ease-out" }}
          />

          {/* Dialog */}
          <div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-6 shadow-overlay"
            style={{
              borderColor: "var(--color-border-default)",
              animation: "confirmIn 150ms ease-out",
            }}
          >
            <div className="flex items-start gap-3">
              {state.options.variant === "danger" && (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle size={17} className="text-red-500" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-zinc-900">{state.options.title}</h3>
                {state.options.description && (
                  <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed">
                    {state.options.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => respond(false)}>
                {state.options.cancelLabel || "Cancel"}
              </Button>
              <Button
                variant={state.options.variant === "danger" ? "danger" : "primary"}
                size="sm"
                onClick={() => respond(true)}
              >
                {state.options.confirmLabel || "Confirm"}
              </Button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes confirmIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
          `}</style>
        </>
      )}
    </ConfirmContext.Provider>
  );
}
