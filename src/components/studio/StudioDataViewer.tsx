import React, { useMemo, useState } from "react";

type ViewerMode = "schema" | "table" | "json";

interface StudioDataViewerProps {
  data: unknown;
  className?: string;
}

interface SchemaRow {
  key: string;
  path: string;
  type: string;
  preview: string;
  depth: number;
}

const describeValue = (value: unknown): string => {
  if (Array.isArray(value)) return `array[${value.length}]`;
  if (value === null) return "null";
  return typeof value;
};

const previewValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.length === 0 ? "Empty array" : `Array of ${describeValue(value[0])}`;
  if (value && typeof value === "object") return `${Object.keys(value as Record<string, unknown>).length} field(s)`;
  if (typeof value === "string") return value;
  return String(value);
};

const buildSchemaRows = (value: unknown, depth = 0, path: string[] = []): SchemaRow[] => {
  if (Array.isArray(value)) {
    const head = value[0];
    const currentPath = path.join(".") || "$";
    return [
      {
        key: path[path.length - 1] ?? "$",
        path: currentPath,
        type: `array[${value.length}]`,
        preview: value.length === 0 ? "Empty array" : `First item is ${describeValue(head)}`,
        depth,
      },
      ...(value.length > 0 && head && typeof head === "object" ? buildSchemaRows(head, depth + 1, [...path, "[]"]) : []),
    ];
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => {
      const currentPath = [...path, key];
      const row: SchemaRow = {
        key,
        path: currentPath.join("."),
        type: describeValue(entry),
        preview: previewValue(entry),
        depth,
      };
      const nested = entry && typeof entry === "object" ? buildSchemaRows(entry, depth + 1, currentPath) : [];
      return [row, ...nested];
    });
  }

  return [
    {
      key: path[path.length - 1] ?? "$",
      path: path.join(".") || "$",
      type: describeValue(value),
      preview: previewValue(value),
      depth,
    },
  ];
};

const normalizeRows = (data: unknown): Array<Record<string, unknown>> => {
  if (Array.isArray(data)) {
    return data.map((item) => (item && typeof item === "object" && !Array.isArray(item) ? item as Record<string, unknown> : { value: item }));
  }
  if (data && typeof data === "object") {
    return [data as Record<string, unknown>];
  }
  return [{ value: data }];
};

const formatCell = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value === null) return "null";
  if (typeof value === "undefined") return "";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
};

const StudioDataViewer: React.FC<StudioDataViewerProps> = ({ data, className }) => {
  const [mode, setMode] = useState<ViewerMode>("schema");
  const schemaRows = useMemo(() => buildSchemaRows(data), [data]);
  const tableRows = useMemo(() => normalizeRows(data), [data]);
  const columns = useMemo(() => {
    const keys = new Set<string>();
    tableRows.forEach((row) => Object.keys(row).forEach((key) => keys.add(key)));
    return Array.from(keys).slice(0, 8);
  }, [tableRows]);

  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <div className="text-[11px] font-medium text-slate-600">Data viewer</div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {(["schema", "table", "json"] as ViewerMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${mode === item ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[280px] overflow-auto p-3">
        {mode === "schema" && (
          <div className="space-y-1">
            {schemaRows.map((row) => (
              <div key={`${row.path}-${row.depth}`} className="grid grid-cols-[minmax(0,1.2fr)_110px_minmax(0,1.4fr)] gap-3 rounded-lg px-2 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50">
                <div className="truncate font-medium text-slate-700" style={{ paddingLeft: row.depth * 14 }} title={row.path}>{row.key}</div>
                <div className="truncate text-slate-400">{row.type}</div>
                <div className="truncate text-slate-500" title={row.preview}>{row.preview}</div>
              </div>
            ))}
          </div>
        )}

        {mode === "table" && (
          <div className="overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-full border-collapse text-[11px]">
              <thead className="bg-slate-50">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="border-b border-slate-200 px-3 py-2 text-left font-medium text-slate-600">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(0, 20).map((row, index) => (
                  <tr key={index} className="border-b border-slate-100 last:border-b-0">
                    {columns.map((column) => (
                      <td key={`${index}-${column}`} className="max-w-[220px] truncate px-3 py-2 align-top text-slate-700" title={formatCell(row[column])}>
                        {formatCell(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mode === "json" && (
          <pre className="overflow-auto rounded-lg bg-slate-950 px-3 py-3 text-[11px] leading-5 text-slate-100">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default StudioDataViewer;