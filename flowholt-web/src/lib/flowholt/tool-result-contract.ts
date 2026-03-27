import { getToolRegistryItem, type ToolCapabilityKind, type ToolResultContractKind } from "./tool-registry.ts";

type NormalizedToolResultInput = {
  toolKey: string;
  capability?: ToolCapabilityKind | string;
  method: string;
  url: string;
  statusCode: number;
  responsePayload: unknown;
  connectionLabel?: string;
};

export type NormalizedToolResult = {
  contract_kind: ToolResultContractKind;
  success: boolean;
  primary_text: string;
  preview: string;
  item_count: number;
  transport: {
    method: string;
    url: string;
    status_code: number;
  };
  data: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  raw: unknown;
  orchestration_hint: string;
  connection_label: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asListOfRecords(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => asRecord(item))
        .filter((item) => Object.keys(item).length > 0)
    : [];
}

function firstNonEmptyString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function toPreview(value: unknown) {
  if (typeof value === "string") {
    return value.trim().slice(0, 180);
  }

  try {
    return JSON.stringify(value).slice(0, 180);
  } catch {
    return String(value).slice(0, 180);
  }
}

function collectDocumentItems(responsePayload: unknown) {
  const payloadRecord = asRecord(responsePayload);
  return [
    ...asListOfRecords(payloadRecord.documents),
    ...asListOfRecords(payloadRecord.matches),
    ...asListOfRecords(payloadRecord.items),
    ...asListOfRecords(responsePayload),
  ];
}

export function normalizeToolResponse({
  toolKey,
  capability,
  method,
  url,
  statusCode,
  responsePayload,
  connectionLabel = "",
}: NormalizedToolResultInput): NormalizedToolResult {
  const preset = getToolRegistryItem(toolKey);
  const resolvedCapability = capability || preset.capability;
  const payloadRecord = asRecord(responsePayload);
  const success = statusCode >= 200 && statusCode < 400;

  if (resolvedCapability === "knowledge_lookup") {
    const items = collectDocumentItems(responsePayload).slice(0, 12);
    const firstItem = items[0] ?? {};
    const primaryText =
      firstNonEmptyString(
        firstItem.title,
        firstItem.name,
        firstItem.summary,
        firstItem.snippet,
      ) || (items.length ? "Knowledge matches found." : "Knowledge search completed.");

    return {
      contract_kind: "document_matches",
      success,
      primary_text: primaryText,
      preview: primaryText,
      item_count: items.length,
      transport: {
        method,
        url,
        status_code: statusCode,
      },
      data: {
        top_match: firstItem,
        source_count: items.length,
      },
      items,
      raw: responsePayload,
      orchestration_hint: preset.orchestrationHint,
      connection_label: connectionLabel,
    };
  }

  if (resolvedCapability === "crm_writeback") {
    const primaryText =
      firstNonEmptyString(
        payloadRecord.message,
        payloadRecord.status,
        payloadRecord.result as string | undefined,
      ) || "CRM writeback completed.";

    return {
      contract_kind: "record_sync",
      success,
      primary_text: primaryText,
      preview: primaryText,
      item_count: 1,
      transport: {
        method,
        url,
        status_code: statusCode,
      },
      data: {
        record_id: firstNonEmptyString(
          payloadRecord.record_id,
          payloadRecord.id,
          asRecord(payloadRecord.data).id,
        ),
        sync_status: firstNonEmptyString(payloadRecord.status, payloadRecord.result) || "synced",
      },
      items: [],
      raw: responsePayload,
      orchestration_hint: preset.orchestrationHint,
      connection_label: connectionLabel,
    };
  }

  if (resolvedCapability === "spreadsheet_row") {
    const primaryText =
      firstNonEmptyString(payloadRecord.message, payloadRecord.status) || "Spreadsheet row written.";

    return {
      contract_kind: "sheet_write",
      success,
      primary_text: primaryText,
      preview: primaryText,
      item_count: 1,
      transport: {
        method,
        url,
        status_code: statusCode,
      },
      data: {
        row_id: firstNonEmptyString(payloadRecord.row_id, payloadRecord.id),
        sheet: firstNonEmptyString(payloadRecord.sheet, asRecord(payloadRecord.data).sheet),
        write_status: firstNonEmptyString(payloadRecord.status) || "written",
      },
      items: [],
      raw: responsePayload,
      orchestration_hint: preset.orchestrationHint,
      connection_label: connectionLabel,
    };
  }

  if (resolvedCapability === "webhook_reply") {
    const primaryText =
      firstNonEmptyString(payloadRecord.message, payloadRecord.status) || "Webhook reply delivered.";

    return {
      contract_kind: "callback_ack",
      success,
      primary_text: primaryText,
      preview: primaryText,
      item_count: 1,
      transport: {
        method,
        url,
        status_code: statusCode,
      },
      data: {
        delivery_status: firstNonEmptyString(payloadRecord.status) || "sent",
      },
      items: [],
      raw: responsePayload,
      orchestration_hint: preset.orchestrationHint,
      connection_label: connectionLabel,
    };
  }

  const primaryText =
    firstNonEmptyString(payloadRecord.message, payloadRecord.status, payloadRecord.result) ||
    `HTTP ${statusCode} response received.`;

  return {
    contract_kind: "raw_response",
    success,
    primary_text: primaryText,
    preview: toPreview(responsePayload),
    item_count: Array.isArray(responsePayload) ? responsePayload.length : 1,
    transport: {
      method,
      url,
      status_code: statusCode,
    },
    data: payloadRecord,
    items: asListOfRecords(responsePayload),
    raw: responsePayload,
    orchestration_hint: preset.orchestrationHint,
    connection_label: connectionLabel,
  };
}

export function summarizeToolResultContract(toolKey: string) {
  const preset = getToolRegistryItem(toolKey);
  return `${preset.resultContract.replaceAll("_", " ")} output`;
}

