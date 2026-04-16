import type { ApiNodeDataReference } from "@/lib/api";

export const EXPRESSION_TEMPLATE_PATTERN = /\{\{\s*(.+?)\s*\}\}/g;

export interface ExpressionValidationIssue {
  severity: "error" | "warning";
  message: string;
  token?: string;
}

export const normalizeExpressionToken = (expression: string) => `{{${expression.trim()}}}`;

export const stringifyExpressionValue = (value: unknown) => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
};

export const buildExpressionPreview = (template: string, references: ApiNodeDataReference[]) => {
  const referenceMap = new Map(
    references.map((reference) => [normalizeExpressionToken(reference.expression.slice(2, -2)), reference.value]),
  );
  const matches = Array.from(template.matchAll(EXPRESSION_TEMPLATE_PATTERN));
  const unresolved: string[] = [];

  if (matches.length === 1 && matches[0][0] === template) {
    const exactToken = normalizeExpressionToken(matches[0][1]);
    const exactValue = referenceMap.get(exactToken);
    if (typeof exactValue === "undefined") {
      return { exactValue: null, renderedText: template, unresolved: [exactToken] };
    }
    return { exactValue, renderedText: stringifyExpressionValue(exactValue), unresolved };
  }

  const renderedText = template.replace(EXPRESSION_TEMPLATE_PATTERN, (_, expression) => {
    const token = normalizeExpressionToken(expression);
    if (!referenceMap.has(token)) {
      unresolved.push(token);
      return token;
    }
    return stringifyExpressionValue(referenceMap.get(token));
  });

  return { exactValue: null, renderedText, unresolved };
};

export const validateExpressionTemplate = (template: string, references: ApiNodeDataReference[]) => {
  const issues: ExpressionValidationIssue[] = [];
  let openIndex: number | null = null;

  for (let index = 0; index < template.length - 1; index += 1) {
    const pair = template.slice(index, index + 2);
    if (pair === "{{") {
      if (openIndex !== null) {
        issues.push({ severity: "error", message: "Nested expression start found before the previous expression closed." });
      }
      openIndex = index;
      index += 1;
      continue;
    }
    if (pair === "}}") {
      if (openIndex === null) {
        issues.push({ severity: "error", message: "Closing expression token found without a matching opening token." });
      } else {
        const body = template.slice(openIndex + 2, index).trim();
        if (!body) {
          issues.push({ severity: "error", message: "Expression tokens cannot be empty.", token: "{{}}" });
        }
      }
      openIndex = null;
      index += 1;
    }
  }

  if (openIndex !== null) {
    issues.push({ severity: "error", message: "Expression is missing a closing }} token." });
  }

  if (issues.some((issue) => issue.severity === "error")) {
    return issues;
  }

  const preview = buildExpressionPreview(template, references);
  const seenWarnings = new Set<string>();
  preview.unresolved.forEach((token) => {
    if (seenWarnings.has(token)) return;
    seenWarnings.add(token);
    issues.push({
      severity: "warning",
      message: `Reference ${token} is not available in the current mapping context.`,
      token,
    });
  });
  return issues;
};