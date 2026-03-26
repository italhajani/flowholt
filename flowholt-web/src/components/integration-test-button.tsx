"use client";

import { useState } from "react";

type IntegrationTestResponse = {
  test?: {
    ok: boolean;
    status: "passed" | "warn" | "failed";
    message: string;
    checked_at?: string;
  };
  error?: string;
};

type IntegrationTestButtonProps = {
  connectionId: string;
};

export function IntegrationTestButton({ connectionId }: IntegrationTestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntegrationTestResponse["test"] | null>(null);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/integrations/${connectionId}/test`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as IntegrationTestResponse;

      if (!response.ok) {
        setResult(null);
        setError(payload.error || "Connection test failed.");
        return;
      }

      setResult(payload.test ?? null);
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : "Connection test failed.");
    } finally {
      setLoading(false);
    }
  }

  const toneClass =
    result?.status === "passed"
      ? "bg-[#eef4ef] text-emerald-900"
      : result?.status === "warn"
        ? "bg-[#fff3df] text-amber-950"
        : "bg-[#f7ede2] text-amber-950";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Testing..." : "Test connection"}
      </button>

      {error ? (
        <div className="rounded-2xl bg-[#f7ede2] px-3 py-2 text-sm text-amber-950">{error}</div>
      ) : null}

      {result ? (
        <div className={`rounded-2xl px-3 py-2 text-sm ${toneClass}`}>
          <p className="font-medium">{result.message}</p>
          {result.checked_at ? (
            <p className="mt-1 text-xs opacity-75">Checked: {new Date(result.checked_at).toLocaleString()}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
