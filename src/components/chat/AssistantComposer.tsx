import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, LockKeyhole, Paperclip, Send, Sparkles, Square, X } from "lucide-react";

import type { ApiChatAttachment, ApiLLMProviderInfo } from "@/lib/api";
import { cn } from "@/lib/utils";

export function pickPreferredModelId(models: ApiLLMProviderInfo[]): string {
  return (
    models.find((model) => model.id === "xai" && model.available)?.id
    || models.find((model) => model.id === "groq" && model.available)?.id
    || models.find((model) => model.available && model.is_default)?.id
    || models.find((model) => model.available)?.id
    || ""
  );
}

interface AssistantComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onStop?: () => void;
  submitting?: boolean;
  placeholder?: string;
  models?: ApiLLMProviderInfo[];
  selectedModel?: string;
  onModelSelect?: (modelId: string) => void;
  onLockedModelSelect?: (model: ApiLLMProviderInfo) => void;
  onAttachClick?: () => void;
  attachments?: ApiChatAttachment[];
  onRemoveAttachment?: (attachmentId: string) => void;
  attaching?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  variant?: "page" | "compact";
  showAttachButton?: boolean;
  showModelSelector?: boolean;
  modelLabel?: string;
  className?: string;
}

const AssistantComposer: React.FC<AssistantComposerProps> = ({
  value,
  onValueChange,
  onSubmit,
  onStop,
  submitting = false,
  placeholder = "Ask me anything...",
  models = [],
  selectedModel = "",
  onModelSelect,
  onLockedModelSelect,
  onAttachClick,
  attachments = [],
  onRemoveAttachment,
  attaching = false,
  disabled = false,
  autoFocus = false,
  variant = "page",
  showAttachButton = true,
  showModelSelector = true,
  modelLabel,
  className,
}) => {
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resolvedModel = useMemo(() => {
    if (selectedModel) {
      return models.find((model) => model.id === selectedModel) ?? null;
    }
    const preferredId = pickPreferredModelId(models);
    return models.find((model) => model.id === preferredId) ?? null;
  }, [models, selectedModel]);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = "0px";
    const nextHeight = Math.min(textareaRef.current.scrollHeight, variant === "page" ? 220 : 140);
    textareaRef.current.style.height = `${Math.max(nextHeight, variant === "page" ? 120 : 72)}px`;
  }, [value, variant]);

  useEffect(() => {
    if (!modelMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        setModelMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [modelMenuOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled && !submitting && value.trim()) {
        void onSubmit();
      }
    }
  };

  const containerClassName = variant === "page"
    ? "rounded-[30px] border border-slate-200/90 bg-white/95 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)]"
    : "rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)]";

  return (
    <div ref={shellRef} className={cn(containerClassName, className)}>
      <textarea
        ref={textareaRef}
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "w-full resize-none border-none bg-transparent px-1 text-slate-800 outline-none placeholder:text-slate-400",
          variant === "page" ? "text-[15px] leading-7" : "text-[13px] leading-6",
          disabled && "cursor-not-allowed opacity-60",
        )}
      />

      {attachments.length || attaching ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] text-slate-600">
              <Paperclip size={12} className="text-slate-400" />
              <span className="max-w-[220px] truncate">{attachment.file_name}</span>
              <span className="text-slate-400">{Math.max(1, Math.round(attachment.size_bytes / 1024))} KB</span>
              {onRemoveAttachment ? (
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(attachment.id)}
                  className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                  aria-label={`Remove ${attachment.file_name}`}
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>
          ))}
          {attaching ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-500">
              <Loader2 size={12} className="animate-spin" />
              Uploading attachments...
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {showAttachButton ? (
            <button
              type="button"
              onClick={onAttachClick}
              disabled={disabled || attaching}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Paperclip size={14} />
              {attaching ? "Uploading..." : "Attach"}
            </button>
          ) : null}

          {showModelSelector ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelMenuOpen((open) => !open)}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Sparkles size={14} className="text-indigo-500" />
                {resolvedModel?.name || modelLabel || "FlowHolt AI"}
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {modelMenuOpen ? (
                <div className="absolute left-0 top-11 z-50 min-w-[300px] rounded-[22px] border border-slate-200 bg-white p-2.5 shadow-[0_24px_50px_rgba(15,23,42,0.18)]">
                  <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Choose model
                  </div>
                  <div className="px-2.5 pb-2 text-[11px] leading-5 text-slate-500">
                    Default routes through FlowHolt AI. Locked models open Vault so users can add their own credentials.
                  </div>
                  <div className="space-y-1">
                    {models.map((model) => {
                      const active = (selectedModel || resolvedModel?.id) === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            if (!model.available) {
                              onLockedModelSelect?.(model);
                              setModelMenuOpen(false);
                              return;
                            }
                            onModelSelect?.(model.id);
                            setModelMenuOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors",
                            active
                              ? "border-slate-300 bg-slate-100 text-slate-900"
                              : model.available
                                ? "border-transparent hover:border-slate-200 hover:bg-slate-50"
                                : "border-transparent bg-slate-50/80 hover:bg-slate-100/80",
                          )}
                        >
                          <div className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            model.available ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600",
                          )}>
                            {model.available ? <Sparkles size={14} /> : <LockKeyhole size={14} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-[13px] font-semibold text-slate-800">{model.name}</span>
                              {model.is_default ? (
                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                  Default
                                </span>
                              ) : null}
                              {!model.available ? (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Credential required
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1 truncate text-[11px] text-slate-400">{model.model}</div>
                          </div>
                          {active ? <Check size={14} className="mt-1 shrink-0 text-slate-700" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : modelLabel ? (
            <div className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-600">
              <Sparkles size={14} className="text-indigo-500" />
              {modelLabel}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => {
            if (submitting && onStop) {
              onStop();
              return;
            }
            void onSubmit();
          }}
          disabled={disabled || attaching || (!submitting && !value.trim())}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[12px] font-semibold transition-colors",
            disabled || attaching || (!submitting && !value.trim())
              ? "cursor-not-allowed bg-slate-200 text-slate-400"
              : submitting && onStop
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-slate-900 text-white hover:bg-slate-800",
          )}
        >
          {submitting && onStop ? <Square size={14} /> : submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {submitting && onStop ? "Stop" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default AssistantComposer;