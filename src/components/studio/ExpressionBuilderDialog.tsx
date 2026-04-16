import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Braces, CornerDownLeft, Database, Search, Sparkles } from "lucide-react";

import type { ApiNodeDataReference } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import StudioDataViewer from "./StudioDataViewer";
import { buildExpressionPreview, validateExpressionTemplate } from "./expression-utils";

interface ExpressionBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldLabel: string;
  initialValue: string;
  references: ApiNodeDataReference[];
  onApply: (value: string) => void;
}

type ReferenceScope = "all" | "input" | "node";

interface ActiveExpressionToken {
  start: number;
  end: number;
  query: string;
}

const insertAtCursor = (
  target: HTMLTextAreaElement,
  currentValue: string,
  expression: string,
  setValue: (nextValue: string) => void,
) => {
  const start = target.selectionStart ?? currentValue.length;
  const end = target.selectionEnd ?? currentValue.length;
  const nextValue = `${currentValue.slice(0, start)}${expression}${currentValue.slice(end)}`;
  setValue(nextValue);
  requestAnimationFrame(() => {
    const cursor = start + expression.length;
    target.focus();
    target.setSelectionRange(cursor, cursor);
  });
};

const insertExpressionShellAtCursor = (
  target: HTMLTextAreaElement,
  currentValue: string,
  setValue: (nextValue: string) => void,
) => {
  const start = target.selectionStart ?? currentValue.length;
  const end = target.selectionEnd ?? currentValue.length;
  const shell = "{{}}";
  const nextValue = `${currentValue.slice(0, start)}${shell}${currentValue.slice(end)}`;
  setValue(nextValue);
  requestAnimationFrame(() => {
    const cursor = start + 2;
    target.focus();
    target.setSelectionRange(cursor, cursor);
  });
};

const getActiveExpressionToken = (value: string, cursor: number): ActiveExpressionToken | null => {
  const beforeCursor = value.slice(0, cursor);
  const start = beforeCursor.lastIndexOf("{{");
  if (start === -1) return null;

  const closedBeforeCursor = beforeCursor.lastIndexOf("}}");
  if (closedBeforeCursor > start) return null;

  const closingIndex = value.indexOf("}}", cursor);
  const end = closingIndex === -1 ? cursor : closingIndex + 2;
  const queryEnd = closingIndex === -1 ? cursor : closingIndex;
  const query = value.slice(start + 2, queryEnd).trim();
  return { start, end, query };
};

const getReferenceScore = (reference: ApiNodeDataReference, query: string) => {
  if (!query) return 0;
  const normalizedQuery = query.toLowerCase();
  const expressionCore = (reference.expression_core ?? reference.expression.slice(2, -2)).toLowerCase();
  const path = reference.path.toLowerCase();
  const stepName = reference.step_name.toLowerCase();
  const namespace = (reference.namespace ?? "").toLowerCase();
  const searchTerms = reference.search_terms.map((term) => term.toLowerCase());

  if (expressionCore === normalizedQuery) return 100;
  if (reference.is_root && expressionCore.startsWith(normalizedQuery)) return 92;
  if (namespace === normalizedQuery) return 90;
  if (expressionCore.startsWith(normalizedQuery)) return 80;
  if (path.startsWith(normalizedQuery)) return 70;
  if (searchTerms.some((term) => term === normalizedQuery)) return 68;
  if (expressionCore.includes(normalizedQuery)) return 50;
  if (path.includes(normalizedQuery)) return 40;
  if (searchTerms.some((term) => term.includes(normalizedQuery))) return 32;
  if (stepName.includes(normalizedQuery)) return 20;
  return 0;
};

const ExpressionBuilderDialog: React.FC<ExpressionBuilderDialogProps> = ({
  open,
  onOpenChange,
  fieldLabel,
  initialValue,
  references,
  onApply,
}) => {
  const [draftValue, setDraftValue] = useState(initialValue);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<ReferenceScope>("all");
  const [cursorPosition, setCursorPosition] = useState(initialValue.length);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraftValue(initialValue);
    setSearch("");
    setScope("all");
    setCursorPosition(initialValue.length);
    setActiveSuggestionIndex(0);
  }, [initialValue, open]);

  const scopeFilteredReferences = useMemo(() => {
    return references.filter((reference) => scope === "all" || reference.source === scope);
  }, [references, scope]);

  const filteredReferences = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return scopeFilteredReferences.filter((reference) => {
      if (!normalizedSearch) return true;
      const haystack = [
        reference.step_name,
        reference.path,
        reference.expression,
        reference.expression_core ?? "",
        reference.namespace ?? "",
        reference.preview ?? "",
        ...reference.search_terms,
      ].join(" ").toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [scopeFilteredReferences, search]);

  const groupedReferences = useMemo(() => {
    const groups = new Map<string, ApiNodeDataReference[]>();
    filteredReferences.forEach((reference) => {
      const groupLabel = reference.source === "input" ? "Input" : reference.step_name;
      const list = groups.get(groupLabel) ?? [];
      list.push(reference);
      groups.set(groupLabel, list);
    });
    return Array.from(groups.entries()).map(([groupLabel, groupReferences]) => [
      groupLabel,
      [...groupReferences].sort((left, right) => {
        if (left.is_root !== right.is_root) return left.is_root ? -1 : 1;
        if (left.depth !== right.depth) return left.depth - right.depth;
        return left.path.localeCompare(right.path);
      }),
    ] as const);
  }, [filteredReferences]);

  const preview = useMemo(() => {
    if (!draftValue.includes("{{")) return null;
    return buildExpressionPreview(draftValue, references);
  }, [draftValue, references]);

  const expressionIssues = useMemo(() => {
    if (!draftValue.includes("{{") && !draftValue.includes("}}")) return [];
    return validateExpressionTemplate(draftValue, references);
  }, [draftValue, references]);

  const activeExpressionToken = useMemo(
    () => getActiveExpressionToken(draftValue, cursorPosition),
    [cursorPosition, draftValue],
  );

  const quickReferences = useMemo(() => {
    return scopeFilteredReferences
      .filter((reference) => reference.is_root)
      .slice(0, 6);
  }, [scopeFilteredReferences]);

  const suggestedReferences = useMemo(() => {
    if (!activeExpressionToken) return [];
    const query = activeExpressionToken.query;
    return [...scopeFilteredReferences]
      .map((reference) => ({ reference, score: getReferenceScore(reference, query) }))
      .filter(({ score }) => !query || score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        if (left.reference.is_root !== right.reference.is_root) return left.reference.is_root ? -1 : 1;
        if (left.reference.depth !== right.reference.depth) return left.reference.depth - right.reference.depth;
        return left.reference.path.localeCompare(right.reference.path);
      })
      .slice(0, 8)
      .map(({ reference }) => reference);
  }, [activeExpressionToken, scopeFilteredReferences]);

  useEffect(() => {
    setActiveSuggestionIndex(0);
  }, [activeExpressionToken?.query, scope]);

  const updateCursorPosition = useCallback((target: HTMLTextAreaElement) => {
    setCursorPosition(target.selectionStart ?? draftValue.length);
  }, [draftValue.length]);

  const applyReference = useCallback((reference: ApiNodeDataReference) => {
    const target = textAreaRef.current;
    if (!target) {
      setDraftValue(reference.expression);
      setCursorPosition(reference.expression.length);
      return;
    }

    const selectionStart = target.selectionStart ?? draftValue.length;
    const token = getActiveExpressionToken(draftValue, selectionStart);
    if (!token) {
      insertAtCursor(target, draftValue, reference.expression, setDraftValue);
      setCursorPosition(selectionStart + reference.expression.length);
      return;
    }

    const nextValue = `${draftValue.slice(0, token.start)}${reference.expression}${draftValue.slice(token.end)}`;
    const nextCursor = token.start + reference.expression.length;
    setDraftValue(nextValue);
    setCursorPosition(nextCursor);
    requestAnimationFrame(() => {
      target.focus();
      target.setSelectionRange(nextCursor, nextCursor);
    });
  }, [draftValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1180px] gap-0 overflow-hidden border-slate-200 bg-white p-0">
        <div className="grid h-[78vh] min-h-[620px] grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col border-r border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%)]">
            <DialogHeader className="border-b border-slate-200 px-5 py-4 text-left">
              <DialogTitle className="text-[16px] text-slate-900">Expression editor</DialogTitle>
              <DialogDescription className="text-[12px] leading-5 text-slate-500">
                Drag or click values from the input pane to build expressions for {fieldLabel}.
              </DialogDescription>
            </DialogHeader>

            <div className="border-b border-slate-100 px-4 py-3">
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search references"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-[12px] text-slate-700 outline-none transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-50"
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                {([
                  { value: "all", label: "All" },
                  { value: "input", label: "Input" },
                  { value: "node", label: "Nodes" },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setScope(item.value)}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${scope === item.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-3">
                {groupedReferences.map(([groupLabel, groupReferences]) => (
                  <div key={groupLabel} className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                    <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-slate-700">
                      <Database size={13} className="text-slate-400" />
                      {groupLabel}
                    </div>
                    <div className="space-y-2">
                      {groupReferences.slice(0, 18).map((reference) => (
                        <button
                          key={`${reference.source}-${reference.step_id}-${reference.path}`}
                          type="button"
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData("application/x-flowholt-expression", reference.expression);
                            event.dataTransfer.setData("text/plain", reference.expression);
                            event.dataTransfer.effectAllowed = "copy";
                          }}
                          onClick={() => {
                            applyReference(reference);
                          }}
                          className="flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-colors hover:border-sky-200 hover:bg-sky-50"
                          title={reference.expression}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-medium text-slate-700">
                              {reference.path.replace(`${groupLabel}.`, "")}
                            </div>
                            <div className="truncate text-[11px] text-slate-400">{reference.expression_core ?? reference.expression}</div>
                          </div>
                          {reference.preview && (
                            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">
                              {reference.preview}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {groupedReferences.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[12px] text-slate-500">
                    No references match this search.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="text-[13px] font-medium text-slate-700">Expression output</div>
              <div className="mt-1 text-[12px] text-slate-500">
                {"Use {{ ... }} syntax. Plain text is preserved and expressions are rendered inline."}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!textAreaRef.current) return;
                    insertExpressionShellAtCursor(textAreaRef.current, draftValue, setDraftValue);
                    const selectionStart = textAreaRef.current.selectionStart ?? 0;
                    setCursorPosition(selectionStart + 2);
                  }}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                >
                  <Braces size={12} /> Insert expression
                </button>
                {quickReferences.map((reference) => (
                  <button
                    key={`quick-${reference.step_id}-${reference.path}`}
                    type="button"
                    onClick={() => applyReference(reference)}
                    className="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 text-[11px] font-medium text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  >
                    {reference.path}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-0">
              <div className="min-h-0 border-b border-slate-200 p-5">
                <div className="relative h-full">
                  <textarea
                    ref={textAreaRef}
                    value={draftValue}
                    onChange={(event) => {
                      setDraftValue(event.target.value);
                      updateCursorPosition(event.target);
                    }}
                    onClick={(event) => updateCursorPosition(event.currentTarget)}
                    onKeyUp={(event) => updateCursorPosition(event.currentTarget)}
                    onSelect={(event) => updateCursorPosition(event.currentTarget)}
                    onKeyDown={(event) => {
                      if ((event.ctrlKey || event.metaKey) && event.key === " ") {
                        event.preventDefault();
                        if (textAreaRef.current) {
                          insertExpressionShellAtCursor(textAreaRef.current, draftValue, setDraftValue);
                        }
                        return;
                      }

                      if (!activeExpressionToken || suggestedReferences.length === 0) return;

                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setActiveSuggestionIndex((current) => (current + 1) % suggestedReferences.length);
                        return;
                      }

                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        setActiveSuggestionIndex((current) => (current - 1 + suggestedReferences.length) % suggestedReferences.length);
                        return;
                      }

                      if (event.key === "Enter" || event.key === "Tab") {
                        event.preventDefault();
                        applyReference(suggestedReferences[activeSuggestionIndex] ?? suggestedReferences[0]);
                        return;
                      }

                      if (event.key === "Escape") {
                        event.preventDefault();
                        setActiveSuggestionIndex(0);
                      }
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      const expression = event.dataTransfer.getData("application/x-flowholt-expression") || event.dataTransfer.getData("text/plain");
                      if (!expression) return;
                      event.preventDefault();
                      insertAtCursor(event.currentTarget, draftValue, expression, setDraftValue);
                      setCursorPosition((event.currentTarget.selectionStart ?? draftValue.length) + expression.length);
                    }}
                    spellCheck={false}
                    className="h-full min-h-[220px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-[12px] leading-6 text-slate-100 outline-none transition-colors focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  />

                  {activeExpressionToken && suggestedReferences.length > 0 && (
                    <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-slate-700 bg-slate-900/95 p-2 shadow-[0_18px_60px_rgba(15,23,42,0.55)] backdrop-blur">
                      <div className="mb-2 flex items-center justify-between gap-3 px-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        <span>Suggestions</span>
                        <span className="inline-flex items-center gap-1 text-[10px] normal-case tracking-normal text-slate-500">
                          <CornerDownLeft size={10} /> Enter or Tab to insert
                        </span>
                      </div>
                      <div className="space-y-1">
                        {suggestedReferences.map((reference, index) => (
                          <button
                            key={`suggestion-${reference.step_id}-${reference.path}`}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => applyReference(reference)}
                            className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors ${index === activeSuggestionIndex ? "bg-sky-500/15 text-sky-100" : "text-slate-200 hover:bg-slate-800"}`}
                          >
                            <div className="min-w-0">
                              <div className="truncate text-[12px] font-medium">{reference.path}</div>
                              <div className="truncate text-[11px] text-slate-400">{reference.expression}</div>
                            </div>
                            <span className="shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                              {reference.source === "input" ? "Input" : reference.step_name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto p-5">
                <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-slate-700">
                  <Sparkles size={14} className="text-sky-500" />
                  Live preview
                </div>
                {activeExpressionToken && (
                  <div className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-[12px] leading-5 text-sky-800">
                    Typing inside an expression token. Suggestions are filtered against <span className="font-semibold">{activeExpressionToken.query || "all available references"}</span>.
                  </div>
                )}
                {expressionIssues.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {expressionIssues.map((issue, index) => (
                      <div
                        key={`${issue.severity}-${issue.token ?? index}`}
                        className={`rounded-xl px-4 py-3 text-[12px] leading-5 ${issue.severity === "error" ? "border border-red-100 bg-red-50 text-red-700" : "border border-amber-100 bg-amber-50 text-amber-700"}`}
                      >
                        {issue.message}
                      </div>
                    ))}
                  </div>
                )}
                {!preview && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-[12px] text-slate-500">
                    Add an expression to see a live preview here. Use Ctrl+Space to insert a new expression token.
                  </div>
                )}
                {preview && (
                  <div className="space-y-3">
                    {preview.unresolved.length > 0 && (
                      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-700">
                        Unresolved references: {preview.unresolved.slice(0, 4).join(", ")}
                      </div>
                    )}
                    {preview.exactValue !== null && typeof preview.exactValue === "object" ? (
                      <StudioDataViewer data={preview.exactValue} />
                    ) : (
                      <pre className="overflow-auto rounded-2xl bg-slate-950 px-4 py-4 text-[12px] leading-6 text-slate-100">{preview.renderedText}</pre>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draftValue);
                  onOpenChange(false);
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-sky-700"
              >
                Apply expression
              </button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpressionBuilderDialog;