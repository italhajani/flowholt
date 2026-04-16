import json
import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(r"D:\My work\flowholt3 - Copy")
MANIFEST_PATH = ROOT / "research" / "make-help-center-export" / "manifest.json"
OUTPUT_DIR = ROOT / "research" / "flowholt-ultimate-plan"


DOMAIN_RULES = [
    (
        "01-tenancy-identity-governance",
        [
            "organization",
            "organizations",
            "teams",
            "team",
            "profile",
            "user",
            "users",
            "email preferences",
            "time zones",
            "two-factor",
            "2fa",
            "api key",
            "single sign-on",
            "saml",
            "okta",
            "azure ad",
            "google saml",
            "domain claim",
            "access management",
            "administration",
            "upgrade to enterprise",
            "feature controls",
            "audit logs",
        ],
    ),
    (
        "02-scenarios-builder-authoring",
        [
            "scenario",
            "scenario builder",
            "builder",
            "modules",
            "module settings",
            "types of modules",
            "filter",
            "filtering",
            "router",
            "aggregator",
            "iterator",
            "subscenario",
            "blueprint",
            "clone a scenario",
            "restore a previous scenario version",
            "scenario notes",
            "scenario settings",
            "scenario sharing",
            "schedule a scenario",
            "run replay",
        ],
    ),
    (
        "03-data-mapping-structures",
        [
            "mapping",
            "bundle",
            "array",
            "collection",
            "data stores",
            "data store",
            "data structures",
            "variables",
            "custom variables",
            "system variables",
            "incremental variables",
            "item data types",
            "type coercion",
            "files",
            "functions",
            "date and time",
            "text and binary",
            "math functions",
            "array functions",
            "regexp",
            "custom functions",
            "use functions",
        ],
    ),
    (
        "04-integrations-connections-webhooks",
        [
            "connect",
            "connection",
            "connections",
            "oauth",
            "webhook",
            "webhooks",
            "http request",
            "google services",
            "google apis",
            "ip addresses",
            "replace connections",
            "apps & modules",
            "introduction to make apps",
            "community apps",
            "legacy modules",
            "custom app",
        ],
    ),
    (
        "05-runtime-executions-observability",
        [
            "execution",
            "executions",
            "incomplete",
            "error",
            "errors",
            "error handling",
            "retry",
            "rollback",
            "commit",
            "sequential processing",
            "operations",
            "credits & operations",
            "scenario execution flow",
            "cycles",
            "phase",
            "history",
            "run replay",
            "rate limit",
            "warning",
            "deactivates",
        ],
    ),
    (
        "06-ai-agents-mcp",
        [
            "ai agent",
            "ai agents",
            "make ai agents",
            "mcp",
            "model context protocol",
            "toolboxes",
            "tool for ai",
            "tools for ai",
            "module tools",
            "run an agent",
            "context modules",
            "testing & training",
            "prompt",
            "openai",
            "claude",
            "chatgpt",
            "cursor",
            "knowledge",
            "reasoning",
        ],
    ),
    (
        "07-templates-reuse-distribution",
        [
            "template",
            "templates",
            "scenario templates",
            "create and manage scenario templates",
            "blueprint",
        ],
    ),
    (
        "08-billing-usage-analytics",
        [
            "credits",
            "pricing",
            "subscription",
            "payment",
            "invoices",
            "sales tax",
            "billing",
            "analytics dashboard",
            "credit dashboard",
            "usage",
            "operations per team",
            "credits per team",
            "program",
            "affiliate",
            "ngo",
        ],
    ),
    (
        "09-make-grid-and-alt-views",
        [
            "make grid",
            "grid",
            "table view",
            "new navigation",
            "navigation",
            "workspace navigation",
        ],
    ),
    (
        "10-release-notes-product-evolution",
        [
            "release notes",
            "update",
            "updates",
            "improvements",
            "new feature",
            "available in make",
            "deprecated",
            "launch",
            "live",
            "beta",
            "public beta",
            "retirement",
            "transition",
            "discontinued",
            "coming soon",
            "introducing",
        ],
    ),
]


def normalize_text(*parts: str) -> str:
    return " ".join(part for part in parts if part).lower()


def classify(page: dict) -> tuple[str, dict[str, int]]:
    haystack = normalize_text(
        page.get("slug", "").replace("-", " "),
        page.get("title", ""),
        page.get("description", ""),
        " ".join(h.get("text", "") for h in page.get("headings", [])),
    )
    scores: dict[str, int] = {}
    for domain, keywords in DOMAIN_RULES:
        score = 0
        for keyword in keywords:
            if keyword in haystack:
                score += 1
        scores[domain] = score
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        best = "99-unclassified-reference-pages"
    return best, scores


def compact_page(page: dict, domain: str, scores: dict[str, int]) -> dict:
    return {
        "domain": domain,
        "score": scores.get(domain, 0),
        "slug": page["slug"],
        "title": page["title"],
        "url": page["url"],
        "description": page.get("description", ""),
        "markdown_path": page["markdown_path"],
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    grouped: dict[str, list[dict]] = defaultdict(list)
    scored_pages: list[dict] = []

    for page in manifest["pages"]:
        domain, scores = classify(page)
        item = compact_page(page, domain, scores)
        grouped[domain].append(item)
        scored_pages.append(item)

    for domain in grouped:
        grouped[domain] = sorted(grouped[domain], key=lambda item: (item["score"], item["title"]), reverse=True)

    index = {
        "source_manifest": str(MANIFEST_PATH),
        "page_count": len(scored_pages),
        "domains": {domain: items for domain, items in sorted(grouped.items())},
    }
    (OUTPUT_DIR / "make-domain-index.json").write_text(
        json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    lines = [
        "# Make Corpus Domain Index",
        "",
        f"Source pages: {len(scored_pages)}",
        "",
        "This index groups the scraped `help.make.com` corpus into planning domains for FlowHolt synthesis.",
        "",
    ]
    for domain, items in sorted(grouped.items()):
        lines.append(f"## {domain}")
        lines.append("")
        lines.append(f"Count: {len(items)}")
        lines.append("")
        for item in items[:20]:
            lines.append(
                f"- `{item['slug']}`: {item['title']} ({item['url']})"
            )
        if len(items) > 20:
            lines.append(f"- ... {len(items) - 20} more")
        lines.append("")

    (OUTPUT_DIR / "make-domain-index.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
