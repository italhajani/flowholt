import { useState, type ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

/* ── Column definition ── */
export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  /** hidden at narrow widths */
  hideBelow?: "sm" | "md" | "lg";
}

/* ── Sort state ── */
type SortDir = "asc" | "desc" | null;
interface SortState {
  columnId: string | null;
  direction: SortDir;
}

/* ── Props ── */
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowId: (row: T) => string;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyState?: ReactNode;
  /** Shown above the table when rows are selected */
  bulkActions?: (selectedIds: string[]) => ReactNode;
}

const hideClass: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  selectable = false,
  onRowClick,
  loading = false,
  emptyState,
  bulkActions,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortState>({ columnId: null, direction: null });

  const allIds = data.map(getRowId);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSort = (colId: string) => {
    setSort((prev) => {
      if (prev.columnId !== colId) return { columnId: colId, direction: "asc" };
      if (prev.direction === "asc") return { columnId: colId, direction: "desc" };
      return { columnId: null, direction: null };
    });
  };

  const SortIcon = ({ colId }: { colId: string }) => {
    if (sort.columnId !== colId) return <ChevronsUpDown size={11} className="text-zinc-300" />;
    if (sort.direction === "asc") return <ChevronUp size={11} className="text-zinc-600" />;
    return <ChevronDown size={11} className="text-zinc-600" />;
  };

  return (
    <div className="rounded-lg border border-zinc-100 bg-white overflow-hidden shadow-xs">
      {/* Bulk action bar */}
      {someSelected && bulkActions && (
        <div
          className="flex items-center gap-3 px-5 py-2 text-[12px]"
          style={{
            background: "var(--color-bg-surface-strong)",
            borderBottom: "1px solid var(--color-border-default)",
          }}
        >
          <span className="font-medium text-zinc-600">{selected.size} selected</span>
          <div className="flex items-center gap-2">{bulkActions(Array.from(selected))}</div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ borderBottom: "1px solid #f4f4f5" }}>
            {selectable && (
              <th className="py-2.5 pl-5 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-zinc-200 accent-zinc-900"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.id}
                className={cn(
                  "py-2.5 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
                  col.hideBelow && hideClass[col.hideBelow],
                  col.className,
                  !selectable && "first:pl-5"
                )}
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.id)}
                    className="flex items-center gap-1 hover:text-zinc-600 transition-colors"
                  >
                    {col.header}
                    <SortIcon colId={col.id} />
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #fafafa" }}>
                {selectable && (
                  <td className="py-3 pl-5 pr-2">
                    <Skeleton className="h-3.5 w-3.5 rounded" />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "py-3 pr-4",
                      col.hideBelow && hideClass[col.hideBelow],
                      !selectable && "first:pl-5"
                    )}
                  >
                    <Skeleton className="h-3 w-24" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)}>
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = getRowId(row);
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors duration-100",
                    onRowClick && "cursor-pointer hover:bg-zinc-50",
                    selected.has(id) && "bg-zinc-50"
                  )}
                  style={{ borderBottom: "1px solid #fafafa" }}
                >
                  {selectable && (
                    <td className="py-3 pl-5 pr-2">
                      <input
                        type="checkbox"
                        checked={selected.has(id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleOne(id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-zinc-200 accent-zinc-900"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "py-3 pr-4",
                        col.hideBelow && hideClass[col.hideBelow],
                        !selectable && "first:pl-5"
                      )}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination footer */}
      {data.length > 0 && (
        <div
          className="flex items-center justify-between px-5 py-2.5 text-[11px] text-zinc-400"
          style={{ borderTop: "1px solid #f4f4f5" }}
        >
          <span>{data.length} item{data.length !== 1 ? "s" : ""}</span>
          <span>Page 1 of 1</span>
        </div>
      )}
    </div>
  );
}
