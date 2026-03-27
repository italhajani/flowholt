"use client";

import type { WorkflowNodeType } from "@/lib/flowholt/types";
import {
  applyToolPreset,
  getToolRegistryItem,
  toolRegistry,
} from "@/lib/flowholt/tool-registry";

type StudioNodeConfigFormProps = {
  nodeType: WorkflowNodeType;
  config: Record<string, unknown>;
  configError: string;
  onConfigChange: (config: Record<string, unknown>) => void;
  onDraftJsonChange: (value: string) => void;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function withField(config: Record<string, unknown>, key: string, value: unknown) {
  return {
    ...config,
    [key]: value,
  };
}

function configHint(nodeType: WorkflowNodeType) {
  switch (nodeType) {
    case "agent":
      return 'Example: {"instruction":"Use {{workflow.original_prompt}} and improve {{previous.text}}","model":"llama-3.3-70b-versatile"}';
    case "tool":
      return 'Example: {"tool_key":"crm-upsert","method":"POST","url":"https://api.example.com/upsert","body":{"draft":"{{previous.text}}","task":"{{workflow.original_prompt}}"}}';
    case "condition":
      return 'Example: {"value":"{{previous.status_code}}","equals":200,"branch_on_match":"true","branch_on_miss":"false"}';
    case "output":
      return 'Example: {"result":"{{nodes.writer.text}}"}';
    case "trigger":
      return 'Example: {"mode":"email","email_address":"leads@yourcompany.com","subject_contains":"new lead"}';
    default:
      return "Use advanced JSON only if you need extra control.";
  }
}

export function StudioNodeConfigForm({
  nodeType,
  config,
  configError,
  onConfigChange,
  onDraftJsonChange,
}: StudioNodeConfigFormProps) {
  const bodyJson = JSON.stringify(config.body ?? {}, null, 2);
  const triggerMode = asString(config.mode, "manual");
  const selectedToolKey = asString(config.tool_key, "http-request");
  const selectedToolPreset = getToolRegistryItem(selectedToolKey);

  return (
    <div className="space-y-4">
      {nodeType === "trigger" ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Mode</label>
            <select
              value={triggerMode}
              onChange={(event) => onConfigChange(withField(config, "mode", event.target.value))}
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
            >
              <option value="manual">Manual</option>
              <option value="webhook">Webhook</option>
              <option value="schedule">Schedule</option>
              <option value="event">Event</option>
              <option value="email">Email</option>
            </select>
          </div>

          {triggerMode === "webhook" ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Method</label>
                <select
                  value={asString(config.method, "POST")}
                  onChange={(event) => onConfigChange(withField(config, "method", event.target.value))}
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Path</label>
                <input
                  value={asString(config.path, "/")}
                  onChange={(event) => onConfigChange(withField(config, "path", event.target.value))}
                  placeholder="/lead-intake"
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                />
              </div>
              <p className="text-xs leading-5 text-stone-500">
                Use this when an outside app calls your FlowHolt webhook URL directly.
              </p>
            </>
          ) : null}

          {triggerMode === "event" ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Event name</label>
                <input
                  value={asString(config.event_name)}
                  onChange={(event) => onConfigChange(withField(config, "event_name", event.target.value))}
                  placeholder="lead.created or invoice.*"
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Event source</label>
                <input
                  value={asString(config.event_source)}
                  onChange={(event) => onConfigChange(withField(config, "event_source", event.target.value))}
                  placeholder="crm, billing, forms"
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                />
              </div>
              <p className="text-xs leading-5 text-stone-500">
                Use this when your own systems send named workspace events into FlowHolt.
              </p>
            </>
          ) : null}

          {triggerMode === "email" ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Inbox address</label>
                <input
                  value={asString(config.email_address)}
                  onChange={(event) => onConfigChange(withField(config, "email_address", event.target.value))}
                  placeholder="leads@yourcompany.com"
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">Subject must contain</label>
                <input
                  value={asString(config.subject_contains)}
                  onChange={(event) => onConfigChange(withField(config, "subject_contains", event.target.value))}
                  placeholder="optional, like new lead"
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
                />
              </div>
              <p className="text-xs leading-5 text-stone-500">
                Use this when an email provider or inbox parser sends inbound email data into FlowHolt, and you want matching emails to start the workflow automatically.
              </p>
            </>
          ) : null}

          {triggerMode === "manual" ? (
            <p className="text-xs leading-5 text-stone-500">
              Manual means the workflow starts only when someone clicks Run workflow.
            </p>
          ) : null}

          {triggerMode === "schedule" ? (
            <p className="text-xs leading-5 text-stone-500">
              Schedule details are managed in the Schedule builder panel on the right side of Studio.
            </p>
          ) : null}
        </>
      ) : null}

      {nodeType === "agent" ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Instruction</label>
            <textarea
              value={asString(config.instruction)}
              onChange={(event) => onConfigChange(withField(config, "instruction", event.target.value))}
              rows={4}
              placeholder="Summarize the task, think carefully, and produce a clear result."
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Model</label>
            <select
              value={asString(config.model)}
              onChange={(event) => onConfigChange(withField(config, "model", event.target.value))}
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
            >
              <option value="">Use workspace default</option>
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
            </select>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Use workspace default unless you specifically want another Groq model.
            </p>
          </div>
        </>
      ) : null}

      {nodeType === "tool" ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Tool preset</label>
            <select
              value={selectedToolPreset.key}
              onChange={(event) => onConfigChange(applyToolPreset(event.target.value, config))}
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
            >
              {toolRegistry.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.title}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-stone-500">{selectedToolPreset.description}</p>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              {selectedToolPreset.requiresConnection
                ? `Requires an active ${selectedToolPreset.connectionProvider ?? "compatible"} connection from Integrations.` 
                : "Connection is optional for this preset."}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Auth
              </p>
              <p className="mt-2 text-sm text-stone-900">
                {selectedToolPreset.authKind.replaceAll("_", " ")}
              </p>
            </div>
            <div className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                Returns
              </p>
              <p className="mt-2 text-sm text-stone-900">{selectedToolPreset.outputShape}</p>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Method</label>
            <select
              value={asString(config.method, "POST")}
              onChange={(event) => onConfigChange(withField(config, "method", event.target.value))}
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">URL</label>
            <input
              value={asString(config.url)}
              onChange={(event) => onConfigChange(withField(config, "url", event.target.value))}
              placeholder="https://api.example.com/action"
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Recommended label</label>
            <input
              value={selectedToolPreset.recommendedLabel}
              readOnly
              className="w-full rounded-2xl border border-dashed border-stone-900/10 bg-stone-100 px-4 py-3 text-sm text-stone-500 outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Request body</label>
            <textarea
              value={bodyJson}
              onChange={(event) => {
                try {
                  const parsed = JSON.parse(event.target.value) as Record<string, unknown>;
                  onConfigChange(withField(config, "body", parsed));
                } catch {
                  onDraftJsonChange(JSON.stringify({ ...config, body: event.target.value }, null, 2));
                }
              }}
              rows={5}
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 font-mono text-xs leading-6 outline-none"
            />
          </div>
          <p className="text-xs leading-5 text-stone-500">
            This is the first step toward FlowHolt tool capabilities. You pick the tool shape here,
            and later agent planning plus integrations will build on the same preset registry.
          </p>
        </>
      ) : null}

      {nodeType === "condition" ? (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Value to check</label>
            <input
              value={asString(config.value)}
              onChange={(event) => onConfigChange(withField(config, "value", event.target.value))}
              placeholder="{{previous.status_code}}"
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Equals</label>
            <input
              value={String(config.equals ?? "")}
              onChange={(event) => onConfigChange(withField(config, "equals", event.target.value))}
              placeholder="200"
              className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">If matched</label>
              <input
                value={asString(config.branch_on_match, "true")}
                onChange={(event) => onConfigChange(withField(config, "branch_on_match", event.target.value))}
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">If not matched</label>
              <input
                value={asString(config.branch_on_miss, "false")}
                onChange={(event) => onConfigChange(withField(config, "branch_on_miss", event.target.value))}
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>
        </>
      ) : null}

      {nodeType === "loop" ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Iterations</label>
          <input
            type="number"
            min={1}
            value={String(asNumber(config.iterations, 1))}
            onChange={(event) => onConfigChange(withField(config, "iterations", Number(event.target.value) || 1))}
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      ) : null}

      {nodeType === "memory" ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Source</label>
          <input
            value={asString(config.source, "workflow")}
            onChange={(event) => onConfigChange(withField(config, "source", event.target.value))}
            placeholder="workflow"
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      ) : null}

      {nodeType === "retriever" ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Query</label>
          <textarea
            value={asString(config.query)}
            onChange={(event) => onConfigChange(withField(config, "query", event.target.value))}
            rows={4}
            placeholder="{{workflow.original_prompt}}"
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      ) : null}

      {nodeType === "output" ? (
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Result template</label>
          <textarea
            value={asString(config.result)}
            onChange={(event) => onConfigChange(withField(config, "result", event.target.value))}
            rows={3}
            placeholder="{{previous}}"
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      ) : null}

      <details className="rounded-2xl border border-stone-900/10 bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-stone-700">
          Advanced JSON
        </summary>
        <div className="px-4 pb-4">
          <textarea
            key={`${nodeType}:${asString(config.connection_id)}`}
            defaultValue={JSON.stringify(config, null, 2)}
            onChange={(event) => onDraftJsonChange(event.target.value)}
            rows={9}
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 font-mono text-xs leading-6 outline-none"
          />
          <p className="mt-2 text-xs leading-5 text-stone-500">{configHint(nodeType)}</p>
          {configError ? (
            <p className="mt-2 text-xs font-medium text-amber-700">{configError}</p>
          ) : null}
        </div>
      </details>
    </div>
  );
}

