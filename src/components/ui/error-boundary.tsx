import { Component, useState, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Bug, Home, Copy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Error Boundary class component ── */
interface Props {
  children: ReactNode;
  /** Fallback UI to show on error. If not provided, uses default. */
  fallback?: ReactNode;
  /** Scope label for error context (e.g., "Studio Canvas", "Workflows Page") */
  scope?: string;
  /** Called on error for logging/analytics */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error(`[ErrorBoundary${this.props.scope ? `: ${this.props.scope}` : ""}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          scope={this.props.scope}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

/* ── Default error fallback UI ── */
function ErrorFallback({
  error,
  errorInfo,
  scope,
  onRetry,
}: {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  scope?: string;
  onRetry: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorReport = [
    `Scope: ${scope ?? "Unknown"}`,
    `Error: ${error?.message ?? "Unknown error"}`,
    `Stack: ${error?.stack ?? "No stack trace"}`,
    `Component: ${errorInfo?.componentStack ?? "Unknown"}`,
    `Time: ${new Date().toISOString()}`,
    `URL: ${window.location.href}`,
  ].join("\n\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(errorReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-[300px] items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 mx-auto">
          <AlertTriangle size={28} className="text-red-500" />
        </div>

        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900">
            Something went wrong
          </h3>
          <p className="text-[12px] text-zinc-500 mt-1">
            {scope ? `An error occurred in "${scope}"` : "An unexpected error occurred"}. 
            Try refreshing or contact support if the issue persists.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw size={12} /> Retry
          </button>
          <button
            onClick={() => window.location.hash = "#/"}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            <Home size={12} /> Go Home
          </button>
        </div>

        <button
          onClick={() => setShowDetails(o => !o)}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-1 mx-auto"
        >
          <Bug size={10} /> {showDetails ? "Hide" : "Show"} error details
        </button>

        {showDetails && (
          <div className="text-left rounded-lg border border-zinc-200 bg-zinc-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-500">Error Report</span>
              <button onClick={handleCopy} className="text-[10px] text-zinc-400 hover:text-zinc-600 flex items-center gap-1">
                {copied ? <><CheckCircle2 size={9} className="text-green-500" /> Copied</> : <><Copy size={9} /> Copy</>}
              </button>
            </div>
            <pre className="text-[10px] text-red-600 font-mono whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto">
              {error?.message}
            </pre>
            {error?.stack && (
              <pre className="text-[9px] text-zinc-400 font-mono whitespace-pre-wrap break-all max-h-[150px] overflow-y-auto border-t border-zinc-200 pt-2 mt-2">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inline Error Banner (for non-critical errors) ── */
export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2.5">
      <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
      <p className="flex-1 text-[12px] text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-[11px] font-medium text-red-600 hover:text-red-800 transition-colors">
          <RefreshCw size={10} /> Retry
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 transition-colors text-[11px]">
          Dismiss
        </button>
      )}
    </div>
  );
}

/* ── Network Error Toast (for API calls) ── */
export function NetworkErrorToast({
  statusCode,
  message,
  onRetry,
}: {
  statusCode?: number;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-lg max-w-sm">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 flex-shrink-0 mt-0.5">
        <AlertTriangle size={12} className="text-red-500" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-medium text-zinc-800">Network Error</p>
          {statusCode && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono text-zinc-500">{statusCode}</span>
          )}
        </div>
        <p className="text-[11px] text-zinc-500 mt-0.5">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-800 transition-colors">
            <RefreshCw size={10} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}
