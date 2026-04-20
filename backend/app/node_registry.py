from __future__ import annotations

from typing import Any

# ── Field type reference ────────────────────────────────────────
# string    – single‑line text input
# textarea  – multi‑line text
# select    – dropdown with predefined options
# number    – numeric input
# password  – masked text (secrets)
# tags      – list of strings, enter‑to‑add
# code      – code editor with syntax highlighting
# boolean   – toggle switch
# credential– dropdown populated from Vault credentials
# messages  – array of {role, content} for AI chat messages
# keyvalue  – array of {key, value} pairs
#
# Extra keys on a field dict:
#   group    – (str) collapsible section header the field belongs to
#   show_when– (dict) {"field": "<key>", "equals": "<value>"} conditional
# ────────────────────────────────────────────────────────────────

NODE_DEFINITIONS: list[dict[str, Any]] = [
    # ── Trigger ─────────────────────────────────────────────────
    {
        "type": "trigger",
        "label": "Trigger",
        "category": "Start",
        "description": "Start a workflow from a manual, chat, webhook, schedule, or event source.",
        "icon": "zap",
        "supports_branches": False,
        "fields": [
            {
                "key": "source",
                "label": "Trigger Source",
                "type": "select",
                "required": True,
                "default": "manual",
                "options": [
                    {"value": "manual", "label": "Manual"},
                    {"value": "chat", "label": "Chat Trigger"},
                    {"value": "webhook", "label": "Webhook"},
                    {"value": "schedule", "label": "Schedule"},
                    {"value": "event", "label": "Event"},
                    {"value": "form", "label": "Form Submission"},
                    {"value": "email", "label": "Email (IMAP)"},
                    {"value": "error", "label": "Error Trigger"},
                    {"value": "execute_workflow", "label": "Execute Workflow Trigger"},
                ],
                "help": "Choose how this workflow starts.",
            },
            # ── Execute Workflow trigger fields ──
            {
                "key": "execute_workflow_source_info",
                "label": "Execute Workflow Trigger",
                "type": "textarea",
                "required": False,
                "readonly": True,
                "default": (
                    "This workflow runs when called by an 'Execute Workflow' step in another workflow.\n\n"
                    "Available via $json (or $input.first().json):\n"
                    "  parent_workflow_id     — ID of the calling workflow\n"
                    "  parent_workflow_name   — name of the calling workflow\n"
                    "  parent_execution_id    — execution ID of the calling run\n"
                    "  input_data             — data passed from the Execute Workflow step\n\n"
                    "The result returned by this workflow is passed back to the caller\n"
                    "as the output of the Execute Workflow step."
                ),
                "help": "Reference the caller's data using the fields listed above.",
                "show_when": {"field": "source", "equals": "execute_workflow"},
            },
            # ── Error trigger fields ──
            {
                "key": "error_source_info",
                "label": "Error Trigger",
                "type": "textarea",
                "required": False,
                "readonly": True,
                "default": (
                    "This workflow runs automatically when another workflow fails.\n\n"
                    "Available via $json (or $input.first().json):\n"
                    "  execution.id          — failed execution ID\n"
                    "  execution.workflow_id — failed workflow ID\n"
                    "  execution.workflow_name\n"
                    "  execution.environment — draft / staging / production\n"
                    "  execution.status      — always 'failed'\n"
                    "  execution.duration_ms\n"
                    "  execution.last_node_executed\n"
                    "  execution.error.message\n"
                    "  workflow.id / workflow.name\n"
                    "  trigger.mode / trigger.payload\n"
                    "  original_payload      — payload that triggered the failed run\n\n"
                    "Configure which workflow(s) use this as their error handler in\n"
                    "Workspace Settings → Error Handler."
                ),
                "help": "Reference the failed execution data using the fields listed above.",
                "show_when": {"field": "source", "equals": "error"},
            },
            # ── Chat trigger fields ──
            {
                "key": "chat_public",
                "label": "Make Chat Publicly Available",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Expose a public chat entry point instead of keeping this trigger editor-only.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_mode",
                "label": "Chat Mode",
                "type": "select",
                "required": False,
                "default": "hosted",
                "options": [
                    {"value": "hosted", "label": "Hosted Chat"},
                    {"value": "embedded", "label": "Embedded Chat"},
                ],
                "help": "Hosted uses the built-in chat surface. Embedded is for your own widget or UI.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_authentication",
                "label": "Authentication",
                "type": "select",
                "required": False,
                "default": "none",
                "options": [
                    {"value": "none", "label": "None"},
                    {"value": "basic_auth", "label": "Basic Auth"},
                    {"value": "user_auth", "label": "Platform User Auth"},
                ],
                "help": "Control whether the chat is open, password protected, or limited to signed-in users.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_basic_username",
                "label": "Basic Auth Username",
                "type": "string",
                "required": False,
                "help": "Required when chat authentication is set to Basic Auth.",
                "show_when": {"field": "chat_authentication", "equals": "basic_auth"},
            },
            {
                "key": "chat_basic_password",
                "label": "Basic Auth Password",
                "type": "password",
                "required": False,
                "help": "Required when chat authentication is set to Basic Auth.",
                "show_when": {"field": "chat_authentication", "equals": "basic_auth"},
            },
            {
                "key": "chat_load_previous_session",
                "label": "Load Previous Session",
                "type": "select",
                "required": False,
                "default": "off",
                "options": [
                    {"value": "off", "label": "Off"},
                    {"value": "from_memory", "label": "From Memory"},
                ],
                "help": "Reuse earlier messages when the chat trigger shares a memory node with the agent.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_response_mode",
                "label": "Response Mode",
                "type": "select",
                "required": False,
                "default": "streaming",
                "options": [
                    {"value": "when_last_node_finishes", "label": "When Last Node Finishes"},
                    {"value": "using_response_nodes", "label": "Using Response Nodes"},
                    {"value": "streaming", "label": "Streaming Response"},
                ],
                "help": "Match n8n chat behavior by finishing normally, using explicit response nodes, or streaming deltas live.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_initial_messages",
                "label": "Initial Message(s)",
                "type": "textarea",
                "required": False,
                "help": "Hosted mode only. Welcome copy shown before the first user message.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_title",
                "label": "Chat Title",
                "type": "string",
                "required": False,
                "help": "Hosted mode only. Title shown above the chat surface.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_subtitle",
                "label": "Chat Subtitle",
                "type": "string",
                "required": False,
                "help": "Hosted mode only. Subtitle shown under the chat title.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_input_placeholder",
                "label": "Input Placeholder",
                "type": "string",
                "required": False,
                "default": "Type your message...",
                "help": "Hosted mode only. Placeholder text inside the chat composer.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_allowed_origins",
                "label": "Allowed Origin (CORS)",
                "type": "string",
                "required": False,
                "default": "*",
                "help": "Comma-separated list of origins allowed to call the chat URL.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            {
                "key": "chat_require_button_click",
                "label": "Require Button Click to Start Chat",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Hosted mode only. Show a New Conversation button before the chat opens.",
                "show_when": {"field": "source", "equals": "chat"},
            },
            # ── Webhook fields ──
            {
                "key": "webhook_path",
                "label": "Webhook Path",
                "type": "string",
                "required": False,
                "help": "Custom URL path for the webhook endpoint, e.g. /my-hook",
                "show_when": {"field": "source", "equals": "webhook"},
            },
            {
                "key": "webhook_method",
                "label": "HTTP Method",
                "type": "select",
                "required": False,
                "default": "POST",
                "options": [
                    {"value": "GET", "label": "GET"},
                    {"value": "POST", "label": "POST"},
                    {"value": "PUT", "label": "PUT"},
                ],
                "show_when": {"field": "source", "equals": "webhook"},
            },
            {
                "key": "webhook_auth",
                "label": "Webhook Authentication",
                "type": "select",
                "required": False,
                "default": "none",
                "options": [
                    {"value": "none", "label": "None"},
                    {"value": "header", "label": "Header Auth"},
                    {"value": "basic", "label": "Basic Auth"},
                    {"value": "jwt", "label": "JWT"},
                ],
                "show_when": {"field": "source", "equals": "webhook"},
            },
            {
                "key": "webhook_secret",
                "label": "Webhook Secret",
                "type": "password",
                "required": False,
                "help": "Secret token to validate incoming webhook requests.",
                "show_when": {"field": "source", "equals": "webhook"},
            },
            {
                "key": "respond_immediately",
                "label": "Respond Immediately",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "Return 200 OK before the workflow finishes.",
                "show_when": {"field": "source", "equals": "webhook"},
            },
            # ── Schedule fields ──
            {
                "key": "frequency",
                "label": "Schedule Frequency",
                "type": "select",
                "required": False,
                "default": "daily",
                "options": [
                    {"value": "every_minute", "label": "Every Minute"},
                    {"value": "every_5_min", "label": "Every 5 Minutes"},
                    {"value": "every_15_min", "label": "Every 15 Minutes"},
                    {"value": "every_30_min", "label": "Every 30 Minutes"},
                    {"value": "hourly", "label": "Hourly"},
                    {"value": "daily", "label": "Daily"},
                    {"value": "weekly", "label": "Weekly"},
                    {"value": "monthly", "label": "Monthly"},
                    {"value": "cron", "label": "Custom (Cron)"},
                ],
                "show_when": {"field": "source", "equals": "schedule"},
            },
            {
                "key": "time",
                "label": "Run Time",
                "type": "string",
                "required": False,
                "default": "09:00",
                "help": "Local time in HH:MM format.",
                "show_when": {"field": "source", "equals": "schedule"},
            },
            {
                "key": "timezone",
                "label": "Timezone",
                "type": "select",
                "required": False,
                "default": "UTC",
                "options": [
                    {"value": "UTC", "label": "UTC"},
                    {"value": "America/New_York", "label": "US Eastern"},
                    {"value": "America/Chicago", "label": "US Central"},
                    {"value": "America/Denver", "label": "US Mountain"},
                    {"value": "America/Los_Angeles", "label": "US Pacific"},
                    {"value": "Europe/London", "label": "London"},
                    {"value": "Europe/Paris", "label": "Paris / Berlin"},
                    {"value": "Asia/Tokyo", "label": "Tokyo"},
                    {"value": "Asia/Kolkata", "label": "India (IST)"},
                    {"value": "Australia/Sydney", "label": "Sydney"},
                ],
                "show_when": {"field": "source", "equals": "schedule"},
            },
            {
                "key": "cron_expression",
                "label": "Cron Expression",
                "type": "string",
                "required": False,
                "help": "Standard cron syntax: minute hour day month weekday (e.g. 0 9 * * 1-5).",
                "show_when": {"field": "frequency", "equals": "cron"},
            },
            {
                "key": "day_of_week",
                "label": "Day of Week",
                "type": "select",
                "required": False,
                "default": "monday",
                "options": [
                    {"value": "monday", "label": "Monday"},
                    {"value": "tuesday", "label": "Tuesday"},
                    {"value": "wednesday", "label": "Wednesday"},
                    {"value": "thursday", "label": "Thursday"},
                    {"value": "friday", "label": "Friday"},
                    {"value": "saturday", "label": "Saturday"},
                    {"value": "sunday", "label": "Sunday"},
                ],
                "show_when": {"field": "frequency", "equals": "weekly"},
            },
            # ── Event fields ──
            {
                "key": "event_source",
                "label": "Event Source",
                "type": "select",
                "required": False,
                "default": "app_event",
                "options": [
                    {"value": "app_event", "label": "Application Event"},
                    {"value": "database_change", "label": "Database Change"},
                    {"value": "file_change", "label": "File Change"},
                    {"value": "queue_message", "label": "Queue Message"},
                ],
                "show_when": {"field": "source", "equals": "event"},
            },
            {
                "key": "event_filter",
                "label": "Event Filter",
                "type": "string",
                "required": False,
                "help": "Filter expression to match specific events.",
                "show_when": {"field": "source", "equals": "event"},
            },
            {
                "key": "form_title",
                "label": "Form Title",
                "type": "string",
                "required": False,
                "help": "Title displayed at the top of the form page.",
                "show_when": {"field": "source", "equals": "form"},
            },
            {
                "key": "form_description",
                "label": "Form Description",
                "type": "textarea",
                "required": False,
                "help": "Instructions or description shown to the person filling out the form.",
                "show_when": {"field": "source", "equals": "form"},
            },
            {
                "key": "form_fields",
                "label": "Form Fields",
                "type": "keyvalue",
                "required": False,
                "help": "Field name → field type pairs. Types: text, email, number, textarea, select, checkbox.",
                "show_when": {"field": "source", "equals": "form"},
            },
            {
                "key": "form_submit_label",
                "label": "Submit Button Label",
                "type": "string",
                "required": False,
                "default": "Submit",
                "show_when": {"field": "source", "equals": "form"},
            },
            {
                "key": "imap_host",
                "label": "IMAP Host",
                "type": "string",
                "required": False,
                "help": "IMAP server address, e.g. imap.gmail.com.",
                "show_when": {"field": "source", "equals": "email"},
            },
            {
                "key": "imap_port",
                "label": "IMAP Port",
                "type": "number",
                "required": False,
                "default": 993,
                "show_when": {"field": "source", "equals": "email"},
            },
            {
                "key": "email_credential",
                "label": "Email Credential",
                "type": "credential",
                "required": False,
                "help": "IMAP login credential stored in the Vault.",
                "show_when": {"field": "source", "equals": "email"},
            },
            {
                "key": "email_folder",
                "label": "Folder",
                "type": "string",
                "required": False,
                "default": "INBOX",
                "show_when": {"field": "source", "equals": "email"},
            },
        ],
    },
    # ── Transform ───────────────────────────────────────────────
    {
        "type": "transform",
        "label": "Transform",
        "category": "Data",
        "description": "Map, reshape, or template payload data into the next step.",
        "icon": "wand",
        "supports_branches": False,
        "fields": [
            {
                "key": "operation",
                "label": "Operation",
                "type": "select",
                "required": True,
                "default": "template",
                "options": [
                    {"value": "template", "label": "Template / Map"},
                    {"value": "set_fields", "label": "Set Fields"},
                    {"value": "rename_fields", "label": "Rename Fields"},
                    {"value": "remove_fields", "label": "Remove Fields"},
                    {"value": "flatten", "label": "Flatten Object"},
                    {"value": "parse_json", "label": "Parse JSON String"},
                ],
            },
            {
                "key": "template",
                "label": "Template",
                "type": "textarea",
                "required": True,
                "help": "Use {{field}} placeholders to reshape incoming payload data.",
                "show_when": {"field": "operation", "equals": "template"},
            },
            {
                "key": "fields_map",
                "label": "Field Mappings",
                "type": "keyvalue",
                "required": False,
                "help": "Map source field names to output field names.",
                "show_when": {"field": "operation", "equals": "set_fields"},
            },
            {
                "key": "rename_map",
                "label": "Rename Mappings",
                "type": "keyvalue",
                "required": False,
                "help": "Old field name → New field name.",
                "show_when": {"field": "operation", "equals": "rename_fields"},
            },
            {
                "key": "remove_keys",
                "label": "Fields to Remove",
                "type": "tags",
                "required": False,
                "help": "List of field names to remove from the payload.",
                "show_when": {"field": "operation", "equals": "remove_fields"},
            },
            {
                "key": "json_field",
                "label": "JSON Source Field",
                "type": "string",
                "required": False,
                "help": "Payload key containing a JSON string to parse.",
                "show_when": {"field": "operation", "equals": "parse_json"},
            },
            {
                "key": "output_key",
                "label": "Store As",
                "type": "string",
                "required": False,
                "help": "Key name for downstream steps. Leave empty to replace the payload.",
            },
            {
                "key": "keep_only_set",
                "label": "Keep Only Set Fields",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Discard all fields except those explicitly set.",
                "group": "Options",
            },
            {
                "key": "dot_notation",
                "label": "Dot Notation Access",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "Allow accessing nested fields via user.name notation.",
                "group": "Options",
            },
        ],
    },
    # ── Condition ───────────────────────────────────────────────
    {
        "type": "condition",
        "label": "Condition",
        "category": "Logic",
        "description": "Branch the workflow based on field comparisons.",
        "icon": "git-branch",
        "supports_branches": True,
        "fields": [
            {
                "key": "field",
                "label": "Field",
                "type": "string",
                "required": True,
                "help": "Payload or context key to inspect. Use dot notation for nested fields.",
            },
            {
                "key": "operator",
                "label": "Operator",
                "type": "select",
                "required": True,
                "default": "equals",
                "options": [
                    {"value": "equals", "label": "Equals"},
                    {"value": "not_equals", "label": "Not Equal"},
                    {"value": "contains", "label": "Contains"},
                    {"value": "not_contains", "label": "Does Not Contain"},
                    {"value": "starts_with", "label": "Starts With"},
                    {"value": "ends_with", "label": "Ends With"},
                    {"value": "regex", "label": "Matches Regex"},
                    {"value": "gt", "label": "Greater Than"},
                    {"value": "gte", "label": "Greater Than or Equal"},
                    {"value": "lt", "label": "Less Than"},
                    {"value": "lte", "label": "Less Than or Equal"},
                    {"value": "is_empty", "label": "Is Empty"},
                    {"value": "is_not_empty", "label": "Is Not Empty"},
                    {"value": "exists", "label": "Exists"},
                    {"value": "not_exists", "label": "Does Not Exist"},
                    {"value": "is_type", "label": "Is Type"},
                ],
            },
            {
                "key": "equals",
                "label": "Compare Value",
                "type": "string",
                "required": False,
                "help": "The value to compare against. Supports {{variable}} expressions.",
            },
            {
                "key": "data_type",
                "label": "Data Type",
                "type": "select",
                "required": False,
                "default": "string",
                "options": [
                    {"value": "string", "label": "String"},
                    {"value": "number", "label": "Number"},
                    {"value": "boolean", "label": "Boolean"},
                ],
                "help": "Cast the field value before comparison.",
                "group": "Options",
            },
            {
                "key": "case_sensitive",
                "label": "Case Sensitive",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Enable case-sensitive string comparison.",
                "group": "Options",
            },
            {
                "key": "combine_conditions",
                "label": "Combine Conditions",
                "type": "select",
                "required": False,
                "default": "and",
                "options": [
                    {"value": "and", "label": "AND – All must match"},
                    {"value": "or", "label": "OR – Any must match"},
                ],
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "matched",
                "help": "Context key for the boolean result of the condition.",
                "group": "Options",
            },
        ],
    },
    # ── LLM / AI Model ─────────────────────────────────────────
    {
        "type": "llm",
        "label": "AI",
        "category": "AI",
        "description": "Send context to a model provider and use the generated output downstream.",
        "icon": "sparkles",
        "supports_branches": False,
        "fields": [
            {
                "key": "credential",
                "label": "Credential",
                "type": "credential",
                "required": False,
                "help": "Select a stored credential from the Vault, or leave as Default for free platform credits.",
            },
            {
                "key": "provider",
                "label": "Provider",
                "type": "select",
                "required": True,
                "default": "openai",
                "options": [
                    {"value": "openai", "label": "OpenAI"},
                    {"value": "anthropic", "label": "Anthropic (Claude)"},
                    {"value": "groq", "label": "Groq"},
                    {"value": "gemini", "label": "Google Gemini"},
                    {"value": "deepseek", "label": "DeepSeek"},
                    {"value": "xai", "label": "xAI (Grok)"},
                    {"value": "ollama", "label": "Ollama (Local)"},
                    {"value": "together", "label": "Together AI"},
                    {"value": "fireworks", "label": "Fireworks AI"},
                    {"value": "mistral", "label": "Mistral AI"},
                    {"value": "perplexity", "label": "Perplexity"},
                    {"value": "cohere", "label": "Cohere"},
                    {"value": "custom", "label": "Custom OpenAI-Compatible"},
                ],
            },
            {
                "key": "operation",
                "label": "Operation",
                "type": "select",
                "required": True,
                "default": "chat_completion",
                "options": [
                    {"value": "chat_completion", "label": "Chat Completion"},
                    {"value": "text_completion", "label": "Text Completion"},
                    {"value": "summarize", "label": "Summarize Text"},
                    {"value": "classify", "label": "Classify / Label"},
                    {"value": "extract", "label": "Extract Structured Data"},
                    {"value": "translate", "label": "Translate"},
                    {"value": "embeddings", "label": "Generate Embeddings"},
                ],
            },
            {
                "key": "model",
                "label": "Model",
                "type": "select",
                "required": True,
                "default": "gpt-4o-mini",
                "options": [
                    {"value": "gpt-4o", "label": "GPT-4o"},
                    {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
                    {"value": "gpt-4-turbo", "label": "GPT-4 Turbo"},
                    {"value": "gpt-3.5-turbo", "label": "GPT-3.5 Turbo"},
                    {"value": "claude-sonnet-4-20250514", "label": "Claude Sonnet 4"},
                    {"value": "claude-3-5-sonnet-20241022", "label": "Claude 3.5 Sonnet"},
                    {"value": "claude-3-haiku-20240307", "label": "Claude 3 Haiku"},
                    {"value": "gemini-1.5-pro", "label": "Gemini 1.5 Pro"},
                    {"value": "gemini-1.5-flash", "label": "Gemini 1.5 Flash"},
                    {"value": "llama-3.1-70b", "label": "Llama 3.1 70B"},
                    {"value": "llama-3.1-8b", "label": "Llama 3.1 8B"},
                    {"value": "mixtral-8x7b", "label": "Mixtral 8x7B"},
                    {"value": "deepseek-chat", "label": "DeepSeek Chat"},
                    {"value": "deepseek-coder", "label": "DeepSeek Coder"},
                    {"value": "custom", "label": "Custom Model ID"},
                ],
                "help": "Select a model. Choose 'Custom Model ID' to enter a specific identifier.",
            },
            {
                "key": "custom_model",
                "label": "Custom Model ID",
                "type": "string",
                "required": False,
                "help": "Enter the exact model identifier for your provider.",
                "show_when": {"field": "model", "equals": "custom"},
            },
            # ── Chat mode ──
            {
                "key": "system_message",
                "label": "System Message",
                "type": "textarea",
                "required": False,
                "help": "Set the behavior and personality of the AI assistant.",
                "show_when": {"field": "operation", "equals": "chat_completion"},
            },
            {
                "key": "messages",
                "label": "Messages",
                "type": "messages",
                "required": False,
                "help": "Build a conversation with role-based messages. If empty, uses the Prompt field.",
                "show_when": {"field": "operation", "equals": "chat_completion"},
            },
            {
                "key": "prompt",
                "label": "Prompt",
                "type": "textarea",
                "required": True,
                "help": "Instructions sent to the model. Use {{field}} to reference payload values.",
            },
            # ── Model parameters ──
            {
                "key": "temperature",
                "label": "Temperature",
                "type": "number",
                "required": False,
                "default": 0.7,
                "help": "Controls randomness. 0 = deterministic, 1 = creative. Range: 0–2.",
                "group": "Model Parameters",
            },
            {
                "key": "max_tokens",
                "label": "Max Output Tokens",
                "type": "number",
                "required": False,
                "default": 1024,
                "help": "Maximum number of tokens in the response.",
                "group": "Model Parameters",
            },
            {
                "key": "top_p",
                "label": "Top P (Nucleus Sampling)",
                "type": "number",
                "required": False,
                "default": 1.0,
                "help": "Alternative to temperature. 0.1 = only top 10% probability tokens.",
                "group": "Model Parameters",
            },
            {
                "key": "frequency_penalty",
                "label": "Frequency Penalty",
                "type": "number",
                "required": False,
                "default": 0,
                "help": "Reduces repetition of frequent tokens. Range: -2 to 2.",
                "group": "Model Parameters",
            },
            {
                "key": "presence_penalty",
                "label": "Presence Penalty",
                "type": "number",
                "required": False,
                "default": 0,
                "help": "Encourages new topics. Range: -2 to 2.",
                "group": "Model Parameters",
            },
            {
                "key": "stop_sequences",
                "label": "Stop Sequences",
                "type": "tags",
                "required": False,
                "help": "Sequences where the model stops generating. Up to 4.",
                "group": "Model Parameters",
            },
            {
                "key": "top_k",
                "label": "Top K",
                "type": "number",
                "required": False,
                "default": 40,
                "help": "Only sample from the top K tokens. Used by Anthropic, Gemini, and Ollama models.",
                "group": "Model Parameters",
            },
            {
                "key": "max_retries",
                "label": "Max Retries",
                "type": "number",
                "required": False,
                "default": 2,
                "help": "Maximum number of retries if the API call fails.",
                "group": "Model Parameters",
            },
            {
                "key": "timeout_ms",
                "label": "Timeout (ms)",
                "type": "number",
                "required": False,
                "default": 60000,
                "help": "Maximum time in milliseconds to wait for the model to respond.",
                "group": "Model Parameters",
            },
            {
                "key": "safety_settings",
                "label": "Safety Settings",
                "type": "select",
                "required": False,
                "default": "none",
                "options": [
                    {"value": "none", "label": "None"},
                    {"value": "block_low_and_above", "label": "Block Low and Above"},
                    {"value": "block_medium_and_above", "label": "Block Medium and Above"},
                    {"value": "block_only_high", "label": "Block Only High"},
                    {"value": "block_none", "label": "Block None"},
                ],
                "help": "Safety filter threshold for Gemini models. Controls content filtering.",
                "group": "Model Parameters",
            },
            # ── Output options ──
            {
                "key": "response_format",
                "label": "Response Format",
                "type": "select",
                "required": False,
                "default": "text",
                "options": [
                    {"value": "text", "label": "Text"},
                    {"value": "json_object", "label": "JSON Object"},
                    {"value": "markdown", "label": "Markdown"},
                ],
                "group": "Output Options",
            },
            {
                "key": "output_key",
                "label": "Store Response As",
                "type": "string",
                "required": False,
                "default": "ai_response",
                "help": "Context key for the model's response.",
                "group": "Output Options",
            },
            {
                "key": "include_usage",
                "label": "Include Token Usage",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Include token usage statistics in output.",
                "group": "Output Options",
            },
            # ── Advanced ──
            {
                "key": "streaming",
                "label": "Enable Streaming",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Stream the response token by token.",
                "group": "Advanced",
            },
            {
                "key": "timeout",
                "label": "Timeout (seconds)",
                "type": "number",
                "required": False,
                "default": 120,
                "help": "Maximum time to wait for model response.",
                "group": "Advanced",
            },
            {
                "key": "base_url",
                "label": "Base URL",
                "type": "string",
                "required": False,
                "help": "Custom API endpoint for OpenAI-compatible providers.",
                "show_when": {"field": "provider", "equals": "custom"},
                "group": "Advanced",
            },
            {
                "key": "api_key",
                "label": "API Key (override)",
                "type": "password",
                "required": False,
                "help": "Override the credential with a direct API key. Not recommended — use Vault credentials.",
                "group": "Advanced",
            },
            {
                "key": "metadata",
                "label": "Request Metadata",
                "type": "keyvalue",
                "required": False,
                "help": "Additional metadata to pass with the request.",
                "group": "Advanced",
            },
        ],
    },
    # ── Output ──────────────────────────────────────────────────
    {
        "type": "output",
        "label": "Output",
        "category": "Action",
        "description": "Send the final or intermediate result to a channel, endpoint, or queue.",
        "icon": "send",
        "supports_branches": False,
        "fields": [
            {
                "key": "destination",
                "label": "Destination",
                "type": "select",
                "required": True,
                "default": "webhook",
                "options": [
                    {"value": "webhook", "label": "Webhook / HTTP"},
                    {"value": "email", "label": "Email"},
                    {"value": "slack", "label": "Slack"},
                    {"value": "database", "label": "Database"},
                    {"value": "file", "label": "File Storage"},
                    {"value": "queue", "label": "Message Queue"},
                    {"value": "log", "label": "Log / Console"},
                ],
            },
            {
                "key": "credential",
                "label": "Credential",
                "type": "credential",
                "required": False,
                "help": "Credential for the selected destination.",
            },
            {
                "key": "channel",
                "label": "Channel / Destination Key",
                "type": "string",
                "required": True,
                "help": "Target channel, queue name, table, or destination identifier.",
            },
            {
                "key": "message",
                "label": "Message Body",
                "type": "textarea",
                "required": False,
                "help": "Template for the output message. Use {{field}} for dynamic values.",
            },
            {
                "key": "webhook_url",
                "label": "Webhook URL",
                "type": "string",
                "required": False,
                "help": "Endpoint URL for outbound delivery.",
                "show_when": {"field": "destination", "equals": "webhook"},
            },
            {
                "key": "format",
                "label": "Output Format",
                "type": "select",
                "required": False,
                "default": "json",
                "options": [
                    {"value": "json", "label": "JSON"},
                    {"value": "text", "label": "Plain Text"},
                    {"value": "html", "label": "HTML"},
                    {"value": "csv", "label": "CSV"},
                    {"value": "xml", "label": "XML"},
                ],
                "group": "Options",
            },
            {
                "key": "headers",
                "label": "Custom Headers",
                "type": "keyvalue",
                "required": False,
                "help": "Additional headers for webhook delivery.",
                "show_when": {"field": "destination", "equals": "webhook"},
                "group": "Options",
            },
            {
                "key": "include_metadata",
                "label": "Include Execution Metadata",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Attach workflow run ID, timestamps, and step info to the output.",
                "group": "Options",
            },
        ],
    },
    # ── Delay ───────────────────────────────────────────────────
    {
        "type": "delay",
        "label": "Delay",
        "category": "Control Flow",
        "description": "Pause execution and resume later without blocking the worker.",
        "icon": "clock-3",
        "supports_branches": False,
        "fields": [
            {
                "key": "delay_type",
                "label": "Delay Type",
                "type": "select",
                "required": True,
                "default": "fixed",
                "options": [
                    {"value": "fixed", "label": "Fixed Duration"},
                    {"value": "until_time", "label": "Until Specific Time"},
                    {"value": "expression", "label": "Dynamic Expression"},
                ],
            },
            {
                "key": "hours",
                "label": "Hours",
                "type": "number",
                "required": False,
                "default": 0,
                "show_when": {"field": "delay_type", "equals": "fixed"},
            },
            {
                "key": "minutes",
                "label": "Minutes",
                "type": "number",
                "required": False,
                "default": 0,
                "show_when": {"field": "delay_type", "equals": "fixed"},
            },
            {
                "key": "seconds",
                "label": "Seconds",
                "type": "number",
                "required": False,
                "default": 0,
                "show_when": {"field": "delay_type", "equals": "fixed"},
            },
            {
                "key": "resume_at",
                "label": "Resume At (ISO 8601)",
                "type": "string",
                "required": False,
                "help": "ISO 8601 datetime, e.g. 2025-01-15T14:30:00Z or {{payload.scheduled_time}}.",
                "show_when": {"field": "delay_type", "equals": "until_time"},
            },
            {
                "key": "delay_expression",
                "label": "Duration Expression",
                "type": "string",
                "required": False,
                "help": "Dynamic expression resolving to seconds, e.g. {{payload.wait_seconds}}.",
                "show_when": {"field": "delay_type", "equals": "expression"},
            },
            {
                "key": "webhook_resume",
                "label": "Allow Webhook Resume",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Let an external webhook call resume the workflow before the timer expires.",
                "group": "Options",
            },
            {
                "key": "resume_url",
                "label": "Resume Webhook URL",
                "type": "string",
                "required": False,
                "help": "Auto-generated URL that resumes this execution.",
                "show_when": {"field": "webhook_resume", "equals": True},
                "group": "Options",
            },
            {
                "key": "timeout_action",
                "label": "On Timeout",
                "type": "select",
                "required": False,
                "default": "continue",
                "options": [
                    {"value": "continue", "label": "Continue execution"},
                    {"value": "fail", "label": "Fail the workflow"},
                    {"value": "skip", "label": "Skip remaining steps"},
                ],
                "group": "Options",
            },
        ],
    },
    # ── Human Task ──────────────────────────────────────────────
    {
        "type": "human",
        "label": "Human Task",
        "category": "Approvals",
        "description": "Create a task for a human reviewer and resume when they respond.",
        "icon": "users",
        "supports_branches": True,
        "fields": [
            {"key": "title", "label": "Task Title", "type": "string", "required": True},
            {"key": "instructions", "label": "Instructions", "type": "textarea", "required": True,
             "help": "Detailed instructions for the reviewer. Supports {{field}} placeholders."},
            {
                "key": "choices",
                "label": "Decision Choices",
                "type": "tags",
                "required": True,
                "default": ["approved", "rejected"],
                "help": "Available decision paths. Each creates a workflow branch.",
            },
            {
                "key": "priority",
                "label": "Priority",
                "type": "select",
                "required": False,
                "default": "normal",
                "options": [
                    {"value": "urgent", "label": "Urgent"},
                    {"value": "high", "label": "High"},
                    {"value": "normal", "label": "Normal"},
                    {"value": "low", "label": "Low"},
                ],
            },
            {
                "key": "assignee_email",
                "label": "Assignee Email",
                "type": "string",
                "required": False,
                "help": "Email of the person to assign this task to.",
            },
            {
                "key": "assignee_role",
                "label": "Assignee Role",
                "type": "select",
                "required": False,
                "options": [
                    {"value": "owner", "label": "Owner"},
                    {"value": "admin", "label": "Admin"},
                    {"value": "builder", "label": "Builder"},
                    {"value": "reviewer", "label": "Reviewer"},
                ],
            },
            {
                "key": "due_hours",
                "label": "Due In (hours)",
                "type": "number",
                "required": False,
                "help": "Hours until this task is due. 0 = no deadline.",
            },
            {
                "key": "require_comment",
                "label": "Require Comment",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Reviewer must provide a comment with their decision.",
                "group": "Options",
            },
            {
                "key": "escalation_email",
                "label": "Escalation Email",
                "type": "string",
                "required": False,
                "help": "Email to notify if the task is not completed before the deadline.",
                "group": "Options",
            },
            {
                "key": "show_context",
                "label": "Show Workflow Context",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "Display current workflow data to the reviewer.",
                "group": "Options",
            },
            {
                "key": "auto_approve_hours",
                "label": "Auto-Approve After (hours)",
                "type": "number",
                "required": False,
                "help": "Automatically approve if no response within this time. 0 = never.",
                "group": "Options",
            },
        ],
    },
    # ── Callback Wait ───────────────────────────────────────────
    {
        "type": "callback",
        "label": "Callback Wait",
        "category": "Integrations",
        "description": "Pause until an external system calls back with payload or a decision.",
        "icon": "link",
        "supports_branches": False,
        "fields": [
            {"key": "instructions", "label": "Instructions", "type": "textarea", "required": True,
             "help": "Describe what external action is needed and what data to expect."},
            {"key": "expected_fields", "label": "Expected Payload Fields", "type": "tags", "required": False,
             "help": "Fields the callback payload should contain for validation."},
            {
                "key": "mode",
                "label": "Resume Mode",
                "type": "select",
                "required": False,
                "default": "payload",
                "options": [
                    {"value": "payload", "label": "Payload – Accept any data"},
                    {"value": "decision", "label": "Decision – Pick from choices"},
                    {"value": "approval", "label": "Approval – Approve/Reject"},
                ],
            },
            {"key": "choices", "label": "Decision Choices", "type": "tags", "required": False,
             "show_when": {"field": "mode", "equals": "decision"}},
            {
                "key": "timeout_hours",
                "label": "Timeout (hours)",
                "type": "number",
                "required": False,
                "default": 72,
                "help": "Hours to wait before timing out. 0 = wait indefinitely.",
                "group": "Options",
            },
            {
                "key": "timeout_action",
                "label": "On Timeout",
                "type": "select",
                "required": False,
                "default": "fail",
                "options": [
                    {"value": "fail", "label": "Fail the workflow"},
                    {"value": "continue", "label": "Continue with empty data"},
                    {"value": "default_value", "label": "Continue with default"},
                ],
                "group": "Options",
            },
            {
                "key": "validate_payload",
                "label": "Validate Payload Schema",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Reject callbacks that don't match the expected fields.",
                "group": "Options",
            },
        ],
    },
    # ── Wait (Webhook Resume) ────────────────────────────────────
    {
        "type": "wait",
        "label": "Wait",
        "category": "Control Flow",
        "description": "Pause execution and resume via a unique webhook URL. Optionally add a timeout fallback.",
        "icon": "hourglass",
        "supports_branches": False,
        "fields": [
            {
                "key": "resume_webhook_info",
                "label": "Resume Webhook",
                "type": "readonly_text",
                "required": False,
                "help": (
                    "When this step is reached, execution pauses and a unique resume URL is generated. "
                    "POST to that URL (with optional JSON body) to continue the workflow. "
                    "The posted body is available as $json in the next step."
                ),
            },
            {
                "key": "timeout_hours",
                "label": "Timeout (hours)",
                "type": "number",
                "required": False,
                "default": 0,
                "help": "Maximum hours to wait before the timeout action fires. 0 = wait indefinitely.",
                "group": "Options",
            },
            {
                "key": "timeout_action",
                "label": "On Timeout",
                "type": "select",
                "required": False,
                "default": "fail",
                "options": [
                    {"value": "fail", "label": "Fail the workflow"},
                    {"value": "continue", "label": "Continue with empty data"},
                ],
                "group": "Options",
            },
            {
                "key": "auth_mode",
                "label": "Resume Auth",
                "type": "select",
                "required": False,
                "default": "token",
                "options": [
                    {"value": "token", "label": "Token in URL (default)"},
                    {"value": "none", "label": "No auth (public URL)"},
                    {"value": "jwt", "label": "Require Bearer JWT"},
                ],
                "group": "Options",
            },
        ],
    },
    # ── Loop / Iterator ─────────────────────────────────────────
    {
        "type": "loop",
        "label": "Loop / Iterator",
        "category": "Control Flow",
        "description": "Iterate over an array of items, processing each one through a sub-prompt, template, or downstream steps.",
        "icon": "repeat",
        "supports_branches": False,
        "fields": [
            {
                "key": "items",
                "label": "Items Source",
                "type": "string",
                "required": True,
                "help": "Context key holding an array, or a JSON array literal e.g. [\"a\",\"b\",\"c\"].",
            },
            {
                "key": "item_variable",
                "label": "Item Variable Name",
                "type": "string",
                "required": False,
                "default": "item",
                "help": "Variable name for the current item. Use {{item}} in prompts/templates.",
            },
            {
                "key": "index_variable",
                "label": "Index Variable Name",
                "type": "string",
                "required": False,
                "default": "index",
            },
            {
                "key": "sub_prompt",
                "label": "LLM Prompt Per Item",
                "type": "textarea",
                "required": False,
                "help": "If set, runs an LLM call per item. Use {{item}} for the current value.",
            },
            {
                "key": "sub_template",
                "label": "Template Per Item",
                "type": "textarea",
                "required": False,
                "help": "Non-LLM template applied per item.",
            },
            {
                "key": "max_iterations",
                "label": "Max Iterations",
                "type": "number",
                "required": False,
                "default": 1000,
                "help": "Safety limit to prevent infinite loops.",
            },
            {
                "key": "batch_size",
                "label": "Batch Size",
                "type": "number",
                "required": False,
                "default": 1,
                "help": "Process items in batches of this size. 1 = one at a time.",
                "group": "Options",
            },
            {
                "key": "continue_on_error",
                "label": "Continue on Item Error",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Skip failed items and continue with the rest.",
                "group": "Options",
            },
            {
                "key": "collect_results",
                "label": "Collect Results",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "Gather all item outputs into a single array.",
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "loop_results",
                "help": "Context key for the collected output array.",
                "group": "Options",
            },
        ],
    },
    # ── Code / Script ───────────────────────────────────────────
    {
        "type": "code",
        "label": "Code / Script",
        "category": "Logic",
        "description": "Execute custom code for data transformations, calculations, or complex logic.",
        "icon": "code",
        "supports_branches": False,
        "fields": [
            {
                "key": "language",
                "label": "Language",
                "type": "select",
                "required": True,
                "default": "python",
                "options": [
                    {"value": "python", "label": "Python 3"},
                    {"value": "javascript", "label": "JavaScript (Node.js)"},
                ],
            },
            {
                "key": "mode",
                "label": "Mode",
                "type": "select",
                "required": True,
                "default": "run_once",
                "options": [
                    {"value": "run_once", "label": "Run Once – All Items"},
                    {"value": "run_per_item", "label": "Run Per Item"},
                ],
            },
            {
                "key": "script",
                "label": "Script",
                "type": "code",
                "required": True,
                "help": "Access payload via `payload` dict. Set `result` to pass output downstream.",
            },
            {
                "key": "timeout",
                "label": "Timeout (seconds)",
                "type": "number",
                "required": False,
                "default": 30,
                "help": "Maximum execution time. Capped at 60s.",
            },
            {
                "key": "allowed_modules",
                "label": "Allowed Modules",
                "type": "tags",
                "required": False,
                "help": "Additional Python/Node modules the script may import.",
                "group": "Options",
            },
            {
                "key": "memory_limit_mb",
                "label": "Memory Limit (MB)",
                "type": "number",
                "required": False,
                "default": 128,
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "result",
                "help": "Context key for the script output.",
                "group": "Options",
            },
        ],
    },
    # ── HTTP Request ────────────────────────────────────────────
    {
        "type": "http_request",
        "label": "HTTP Request",
        "category": "Integrations",
        "description": "Make HTTP requests to any API — REST, GraphQL, webhooks. Supports all methods and auth types.",
        "icon": "globe",
        "supports_branches": False,
        "fields": [
            {
                "key": "credential",
                "label": "Credential",
                "type": "credential",
                "required": False,
                "help": "Select a stored credential for authentication. Overrides manual auth settings.",
            },
            {
                "key": "method",
                "label": "Method",
                "type": "select",
                "required": True,
                "default": "GET",
                "options": [
                    {"value": "GET", "label": "GET"},
                    {"value": "POST", "label": "POST"},
                    {"value": "PUT", "label": "PUT"},
                    {"value": "PATCH", "label": "PATCH"},
                    {"value": "DELETE", "label": "DELETE"},
                    {"value": "HEAD", "label": "HEAD"},
                    {"value": "OPTIONS", "label": "OPTIONS"},
                ],
            },
            {
                "key": "url",
                "label": "URL",
                "type": "string",
                "required": True,
                "help": "Full endpoint URL. Use {{field}} for dynamic values.",
            },
            # ── Headers ──
            {
                "key": "send_headers",
                "label": "Send Headers",
                "type": "boolean",
                "required": False,
                "default": False,
            },
            {
                "key": "headers",
                "label": "Headers",
                "type": "keyvalue",
                "required": False,
                "help": "Request headers as key-value pairs.",
                "show_when": {"field": "send_headers", "equals": True},
            },
            # ── Body ──
            {
                "key": "send_body",
                "label": "Send Body",
                "type": "boolean",
                "required": False,
                "default": False,
            },
            {
                "key": "body_content_type",
                "label": "Body Content Type",
                "type": "select",
                "required": False,
                "default": "json",
                "options": [
                    {"value": "json", "label": "JSON"},
                    {"value": "form", "label": "Form URL-Encoded"},
                    {"value": "multipart", "label": "Multipart Form Data"},
                    {"value": "raw", "label": "Raw Text"},
                    {"value": "binary", "label": "Binary / File"},
                ],
                "show_when": {"field": "send_body", "equals": True},
            },
            {
                "key": "body",
                "label": "Request Body",
                "type": "textarea",
                "required": False,
                "help": "JSON body for POST/PUT/PATCH. Use {{field}} for dynamic values.",
                "show_when": {"field": "send_body", "equals": True},
            },
            # ── Query params ──
            {
                "key": "send_query",
                "label": "Send Query Parameters",
                "type": "boolean",
                "required": False,
                "default": False,
            },
            {
                "key": "query_params",
                "label": "Query Parameters",
                "type": "keyvalue",
                "required": False,
                "help": "URL query parameters as key-value pairs.",
                "show_when": {"field": "send_query", "equals": True},
            },
            # ── Auth (manual) ──
            {
                "key": "auth_type",
                "label": "Authentication Type",
                "type": "select",
                "required": False,
                "default": "",
                "options": [
                    {"value": "", "label": "None (or use Credential above)"},
                    {"value": "bearer", "label": "Bearer Token"},
                    {"value": "basic", "label": "Basic Auth"},
                    {"value": "api_key", "label": "API Key Header"},
                    {"value": "digest", "label": "Digest Auth"},
                    {"value": "oauth2", "label": "OAuth2"},
                ],
                "group": "Authentication",
            },
            {
                "key": "token",
                "label": "Bearer Token",
                "type": "password",
                "required": False,
                "show_when": {"field": "auth_type", "equals": "bearer"},
                "group": "Authentication",
            },
            {
                "key": "basic_user",
                "label": "Username",
                "type": "string",
                "required": False,
                "show_when": {"field": "auth_type", "equals": "basic"},
                "group": "Authentication",
            },
            {
                "key": "basic_password",
                "label": "Password",
                "type": "password",
                "required": False,
                "show_when": {"field": "auth_type", "equals": "basic"},
                "group": "Authentication",
            },
            {
                "key": "api_key_header",
                "label": "API Key Header Name",
                "type": "string",
                "required": False,
                "help": "e.g. X-API-Key, Authorization",
                "show_when": {"field": "auth_type", "equals": "api_key"},
                "group": "Authentication",
            },
            {
                "key": "api_key_value",
                "label": "API Key Value",
                "type": "password",
                "required": False,
                "show_when": {"field": "auth_type", "equals": "api_key"},
                "group": "Authentication",
            },
            # ── Response ──
            {
                "key": "response_format",
                "label": "Response Format",
                "type": "select",
                "required": False,
                "default": "auto",
                "options": [
                    {"value": "auto", "label": "Auto-detect"},
                    {"value": "json", "label": "JSON"},
                    {"value": "text", "label": "Text"},
                    {"value": "binary", "label": "Binary / File"},
                ],
                "group": "Response",
            },
            {
                "key": "output_key",
                "label": "Store Response As",
                "type": "string",
                "required": False,
                "default": "response",
                "group": "Response",
            },
            {
                "key": "timeout",
                "label": "Timeout (seconds)",
                "type": "number",
                "required": False,
                "default": 30,
                "group": "Options",
            },
            {
                "key": "follow_redirects",
                "label": "Follow Redirects",
                "type": "boolean",
                "required": False,
                "default": True,
                "group": "Options",
            },
            {
                "key": "ignore_ssl",
                "label": "Ignore SSL Errors",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Skip SSL certificate verification. Use only for testing.",
                "group": "Options",
            },
            {
                "key": "proxy_url",
                "label": "Proxy URL",
                "type": "string",
                "required": False,
                "help": "HTTP proxy to route the request through.",
                "group": "Options",
            },
            {
                "key": "retry_on_fail",
                "label": "Retry on Fail",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Automatically retry the request on HTTP errors (5xx) or timeouts.",
                "group": "Options",
            },
            {
                "key": "max_retries",
                "label": "Max Retries",
                "type": "number",
                "required": False,
                "default": 3,
                "help": "Maximum number of retry attempts.",
                "show_when": {"field": "retry_on_fail", "equals": True},
                "group": "Options",
            },
            {
                "key": "retry_wait_ms",
                "label": "Retry Wait (ms)",
                "type": "number",
                "required": False,
                "default": 1000,
                "help": "Wait time between retries in milliseconds.",
                "show_when": {"field": "retry_on_fail", "equals": True},
                "group": "Options",
            },
        ],
    },
    # ── Filter ──────────────────────────────────────────────────
    {
        "type": "filter",
        "label": "Filter",
        "category": "Data",
        "description": "Filter an array of items based on field conditions.",
        "icon": "filter",
        "supports_branches": False,
        "fields": [
            {
                "key": "items",
                "label": "Items Source",
                "type": "string",
                "required": True,
                "help": "Context/payload key holding an array to filter.",
            },
            {
                "key": "field",
                "label": "Field",
                "type": "string",
                "required": True,
                "help": "Object field to compare. Use dot notation for nested fields.",
            },
            {
                "key": "operator",
                "label": "Operator",
                "type": "select",
                "required": True,
                "default": "equals",
                "options": [
                    {"value": "equals", "label": "Equals"},
                    {"value": "not_equals", "label": "Not Equal"},
                    {"value": "contains", "label": "Contains"},
                    {"value": "not_contains", "label": "Does Not Contain"},
                    {"value": "gt", "label": "Greater Than"},
                    {"value": "gte", "label": "Greater Than or Equal"},
                    {"value": "lt", "label": "Less Than"},
                    {"value": "lte", "label": "Less Than or Equal"},
                    {"value": "regex", "label": "Matches Regex"},
                    {"value": "exists", "label": "Field Exists"},
                    {"value": "not_exists", "label": "Field Missing"},
                    {"value": "is_empty", "label": "Is Empty"},
                    {"value": "is_not_empty", "label": "Is Not Empty"},
                ],
            },
            {
                "key": "value",
                "label": "Compare Value",
                "type": "string",
                "required": False,
                "help": "Value to compare against. Supports {{expressions}}.",
            },
            {
                "key": "keep_matches",
                "label": "Keep Matched Items",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "TRUE = keep matching items. FALSE = remove matching items.",
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "filtered",
                "group": "Options",
            },
        ],
    },
    # ── Merge ───────────────────────────────────────────────────
    {
        "type": "merge",
        "label": "Merge",
        "category": "Data",
        "description": "Combine data from multiple context sources into a single output.",
        "icon": "merge",
        "supports_branches": False,
        "fields": [
            {
                "key": "mode",
                "label": "Merge Mode",
                "type": "select",
                "required": True,
                "default": "append",
                "options": [
                    {"value": "append", "label": "Append – Combine arrays"},
                    {"value": "object", "label": "Merge – Combine objects"},
                    {"value": "zip", "label": "Zip – Pair items by index"},
                    {"value": "combine_by_field", "label": "Join – Match by field"},
                    {"value": "multiplex", "label": "Multiplex – Cross product"},
                ],
            },
            {
                "key": "sources",
                "label": "Source Keys",
                "type": "tags",
                "required": True,
                "help": "Context or payload keys to combine.",
            },
            {
                "key": "join_field",
                "label": "Join Field",
                "type": "string",
                "required": False,
                "help": "Field to match items between sources.",
                "show_when": {"field": "mode", "equals": "combine_by_field"},
            },
            {
                "key": "prefer_source",
                "label": "On Conflict, Prefer",
                "type": "select",
                "required": False,
                "default": "last",
                "options": [
                    {"value": "first", "label": "First Source"},
                    {"value": "last", "label": "Last Source"},
                ],
                "show_when": {"field": "mode", "equals": "object"},
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "merged",
                "group": "Options",
            },
        ],
    },
    # ── Aggregate ───────────────────────────────────────────────
    {
        "type": "aggregate",
        "label": "Aggregate",
        "category": "Data",
        "description": "Combine many items into one item with an array field.",
        "icon": "package",
        "supports_branches": False,
        "fields": [
            {
                "key": "items",
                "label": "Items Source",
                "type": "string",
                "required": True,
                "help": "Context or payload key holding the list to aggregate.",
            },
            {
                "key": "value_field",
                "label": "Value Field",
                "type": "string",
                "required": False,
                "help": "Optional field to extract from each item before aggregating. Supports dot notation.",
            },
            {
                "key": "aggregate_field",
                "label": "Array Field Name",
                "type": "string",
                "required": False,
                "default": "items",
                "help": "Field name that will hold the aggregated array in the output item.",
            },
            {
                "key": "include_count",
                "label": "Include Count",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "Attach the total number of aggregated values.",
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "aggregated",
                "help": "Context key that stores the full aggregate result object.",
                "group": "Options",
            },
        ],
    },
    # ── Split Out ────────────────────────────────────────────────
    {
        "type": "split_out",
        "label": "Split Out",
        "category": "Data",
        "description": "Expand an array into separate items for downstream processing.",
        "icon": "rows-3",
        "supports_branches": False,
        "fields": [
            {
                "key": "items",
                "label": "Source",
                "type": "string",
                "required": True,
                "help": "Context or payload key holding a list, or holding objects that contain the array field to split.",
            },
            {
                "key": "field",
                "label": "Array Field",
                "type": "string",
                "required": False,
                "help": "Optional dot-notation field path to the array inside each source item.",
            },
            {
                "key": "output_field",
                "label": "Output Field",
                "type": "string",
                "required": False,
                "default": "item",
                "help": "Field name to use when split elements are primitives instead of objects.",
            },
            {
                "key": "include_parent_fields",
                "label": "Include Parent Fields",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Keep the parent object's sibling fields on each emitted item.",
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "split_items",
                "help": "Context key that stores the full split result object.",
                "group": "Options",
            },
        ],
    },
    # ── Execute Workflow ─────────────────────────────────────────
    {
        "type": "execute_workflow",
        "label": "Execute Workflow",
        "category": "Control Flow",
        "description": "Call another workflow and optionally wait for its result (sync) or fire-and-forget (async).",
        "icon": "workflow",
        "supports_branches": False,
        "fields": [
            {
                "key": "workflow_id",
                "label": "Workflow",
                "type": "string",
                "required": True,
                "help": "ID of the workflow to call. The target workflow must have an 'Execute Workflow Trigger' node.",
            },
            {
                "key": "mode",
                "label": "Execution Mode",
                "type": "select",
                "required": False,
                "default": "sync",
                "options": [
                    {"value": "sync", "label": "Wait for result (synchronous)"},
                    {"value": "async", "label": "Fire and forget (asynchronous)"},
                ],
                "help": "Sync mode returns the sub-workflow result as this step's output. Async mode queues it and continues immediately.",
            },
            {
                "key": "input_data",
                "label": "Input Data",
                "type": "textarea",
                "required": False,
                "help": "JSON object to pass as payload to the sub-workflow. Supports expressions, e.g. {{ $json }}. Leave empty to pass the current item's data.",
            },
            {
                "key": "timeout_seconds",
                "label": "Timeout (seconds)",
                "type": "number",
                "required": False,
                "default": 60,
                "help": "Maximum seconds to wait for a sync sub-workflow to complete before failing.",
                "show_when": {"field": "mode", "equals": "sync"},
                "group": "Options",
            },
            {
                "key": "on_error",
                "label": "On Sub-Workflow Error",
                "type": "select",
                "required": False,
                "default": "fail",
                "options": [
                    {"value": "fail", "label": "Fail this workflow"},
                    {"value": "continue", "label": "Continue with error info"},
                ],
                "group": "Options",
            },
        ],
    },
    # ── AI Agent ─────────────────────────────────────────────────
    {
        "type": "ai_agent",
        "label": "AI Agent",
        "category": "AI",
        "description": "Autonomous AI agent that reasons, plans, and uses tools to accomplish tasks.",
        "icon": "bot",
        "supports_branches": False,
        "fields": [
            {
                "key": "agent_type",
                "label": "Agent Type",
                "type": "select",
                "required": True,
                "default": "tools_agent",
                "options": [
                    {"value": "tools_agent", "label": "Tools Agent"},
                    {"value": "conversational", "label": "Conversational Agent"},
                    {"value": "openai_functions", "label": "OpenAI Functions Agent"},
                    {"value": "plan_and_execute", "label": "Plan and Execute Agent"},
                    {"value": "react", "label": "ReAct Agent"},
                    {"value": "sql", "label": "SQL Agent"},
                ],
                "help": "The reasoning strategy the agent uses to solve tasks.",
            },
            # ── n8n‑style "Source for Prompt (User Message)" ──
            {
                "key": "prompt_source",
                "label": "Source for Prompt (User Message)",
                "type": "select",
                "required": True,
                "default": "define_below",
                "options": [
                    {"value": "chat_trigger", "label": "Connected Chat Trigger Node"},
                    {"value": "define_below", "label": "Define below"},
                ],
                "help": "Where to get the user message from.",
            },
            {
                "key": "prompt",
                "label": "Text",
                "type": "textarea",
                "required": True,
                "help": "The user message for the agent. Use {{variable}} to reference data from previous steps.",
                "show_when": {"field": "prompt_source", "equals": "define_below"},
            },
            {
                "key": "require_specific_output",
                "label": "Require Specific Output Format",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Whether the agent must output in a specific format using an output parser.",
            },
            {
                "key": "provider",
                "label": "Chat Model Provider",
                "type": "select",
                "required": False,
                "default": "openai",
                "options": [
                    {"value": "openai", "label": "OpenAI"},
                    {"value": "anthropic", "label": "Anthropic"},
                    {"value": "gemini", "label": "Google Gemini"},
                    {"value": "groq", "label": "Groq"},
                    {"value": "deepseek", "label": "DeepSeek"},
                    {"value": "ollama", "label": "Ollama (Local)"},
                    {"value": "custom", "label": "Custom OpenAI-Compatible"},
                ],
                "help": "Provider for the chat model used by the agent.",
            },
            {
                "key": "credential_id",
                "label": "Credential",
                "type": "credential",
                "required": False,
                "help": "API key / credential for the underlying LLM.",
            },
            {
                "key": "model",
                "label": "Model",
                "type": "select",
                "required": True,
                "default": "gpt-4o",
                "options": [
                    {"value": "gpt-4o", "label": "GPT-4o"},
                    {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
                    {"value": "gpt-4-turbo", "label": "GPT-4 Turbo"},
                    {"value": "claude-sonnet-4-20250514", "label": "Claude Sonnet 4"},
                    {"value": "claude-3-5-haiku-20241022", "label": "Claude 3.5 Haiku"},
                    {"value": "gemini-2.0-flash", "label": "Gemini 2.0 Flash"},
                ],
                "help": "The LLM model the agent uses for reasoning.",
            },
            {
                "key": "system_message",
                "label": "System Message",
                "type": "textarea",
                "required": False,
                "default": "You are a helpful AI assistant.",
                "help": "System prompt that defines the agent's personality and instructions.",
            },
            # ── Tools ──
            {
                "key": "tools",
                "label": "Available Tools",
                "type": "tags",
                "required": False,
                "help": "Names of tools/functions the agent can call (e.g. web_search, calculator, code_interpreter).",
                "group": "Tools",
            },
            {
                "key": "allow_code_execution",
                "label": "Code Interpreter",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Allow the agent to write and execute code.",
                "group": "Tools",
            },
            {
                "key": "allow_web_search",
                "label": "Web Search",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Allow the agent to search the web for information.",
                "group": "Tools",
            },
            {
                "key": "allow_file_access",
                "label": "File Search",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Allow the agent to read and search uploaded files.",
                "group": "Tools",
            },
            {
                "key": "allow_api_calls",
                "label": "HTTP Request Tool",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "Allow the agent to make HTTP requests to external APIs.",
                "group": "Tools",
            },
            # ── Options (n8n‑style collapsible) ──
            {
                "key": "max_iterations",
                "label": "Max Iterations",
                "type": "number",
                "required": False,
                "default": 10,
                "help": "Maximum number of reasoning/tool-use loops before the agent must return a final answer.",
                "group": "Options",
            },
            {
                "key": "return_intermediate_steps",
                "label": "Return Intermediate Steps",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Returns the results of the intermediate steps the agent took as part of the output.",
                "group": "Options",
            },
            {
                "key": "temperature",
                "label": "Sampling Temperature",
                "type": "number",
                "required": False,
                "default": 0.7,
                "help": "Controls randomness. Lower values (e.g., 0.2) make the output more deterministic, higher values (e.g., 0.8) make it more creative. Range: 0–2.",
                "group": "Options",
            },
            {
                "key": "max_tokens",
                "label": "Maximum Number of Tokens",
                "type": "number",
                "required": False,
                "default": 4096,
                "help": "The maximum number of tokens to generate in the chat completion.",
                "group": "Options",
            },
            {
                "key": "top_p",
                "label": "Top P",
                "type": "number",
                "required": False,
                "default": 1.0,
                "help": "An alternative to sampling with temperature, called nucleus sampling. The model considers the tokens with top_p probability mass.",
                "group": "Options",
            },
            # ── Memory ──
            {
                "key": "memory_enabled",
                "label": "Enable Memory",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Whether the agent retains conversation history across executions.",
                "group": "Memory",
            },
            {
                "key": "memory_type",
                "label": "Memory Type",
                "type": "select",
                "required": False,
                "default": "buffer_window",
                "options": [
                    {"value": "buffer_window", "label": "Window Buffer Memory"},
                    {"value": "buffer", "label": "Buffer Memory"},
                    {"value": "summary", "label": "Token Buffer Memory"},
                    {"value": "zep", "label": "Zep Memory"},
                    {"value": "motorhead", "label": "Motorhead Memory"},
                    {"value": "redis", "label": "Redis Chat Memory"},
                    {"value": "xata", "label": "Xata Memory"},
                    {"value": "postgres", "label": "Postgres Chat Memory"},
                ],
                "help": "How conversation history is stored and retrieved.",
                "show_when": {"field": "memory_enabled", "equals": True},
                "group": "Memory",
            },
            {
                "key": "memory_window",
                "label": "Context Window Length",
                "type": "number",
                "required": False,
                "default": 5,
                "help": "The number of previous interactions to consider for context.",
                "show_when": {"field": "memory_enabled", "equals": True},
                "group": "Memory",
            },
            {
                "key": "memory_session_key",
                "label": "Session ID",
                "type": "string",
                "required": False,
                "default": "",
                "help": "The key used to store the memory for each session. Leave empty to use the workflow execution ID.",
                "show_when": {"field": "memory_enabled", "equals": True},
                "group": "Memory",
            },
            # ── Cluster ──
            {
                "key": "sub_agents_json",
                "label": "Sub-Agents (JSON)",
                "type": "json",
                "required": False,
                "default": [],
                "help": "Optional cooperating agents with role instructions and model settings.",
                "group": "Cluster",
            },
            {
                "key": "delegation_strategy",
                "label": "Delegation Strategy",
                "type": "select",
                "required": False,
                "default": "auto",
                "options": [
                    {"value": "auto", "label": "Auto"},
                    {"value": "parallel", "label": "Parallel"},
                    {"value": "sequential", "label": "Sequential"},
                    {"value": "round_robin", "label": "Round Robin"},
                ],
                "group": "Cluster",
            },
            # ── Output ──
            {
                "key": "output_format",
                "label": "Output Format",
                "type": "select",
                "required": False,
                "default": "text",
                "options": [
                    {"value": "text", "label": "Plain Text"},
                    {"value": "json", "label": "JSON Object"},
                    {"value": "markdown", "label": "Markdown"},
                ],
                "help": "Format of the agent's final output.",
                "group": "Output",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "agent_response",
                "help": "Context key where the agent output is stored.",
                "group": "Output",
            },
        ],
    },
    # ── Summarization Chain ──────────────────────────────────────
    {
        "type": "ai_summarize",
        "label": "Summarization Chain",
        "category": "AI",
        "description": "Summarize text or documents. Supports Map Reduce, Refine, and Stuff summarization methods.",
        "icon": "file-text",
        "supports_branches": False,
        "fields": [
            {
                "key": "data_source",
                "label": "Data to Summarize",
                "type": "select",
                "required": True,
                "default": "node_input_json",
                "options": [
                    {"value": "node_input_json", "label": "Node Input (JSON)"},
                    {"value": "node_input_binary", "label": "Node Input (Binary)"},
                    {"value": "document_loader", "label": "Use Document Loader"},
                ],
                "help": "Where to get the text data to summarize.",
            },
            {
                "key": "text",
                "label": "Text",
                "type": "textarea",
                "required": False,
                "help": "Paste or reference text to summarize using {{variable}}.",
                "show_when": {"field": "data_source", "equals": "node_input_json"},
            },
            {
                "key": "provider",
                "label": "Chat Model Provider",
                "type": "select",
                "required": False,
                "default": "openai",
                "options": [
                    {"value": "openai", "label": "OpenAI"},
                    {"value": "anthropic", "label": "Anthropic"},
                    {"value": "gemini", "label": "Google Gemini"},
                    {"value": "groq", "label": "Groq"},
                    {"value": "deepseek", "label": "DeepSeek"},
                    {"value": "ollama", "label": "Ollama (Local)"},
                    {"value": "custom", "label": "Custom OpenAI-Compatible"},
                ],
            },
            {
                "key": "credential",
                "label": "Credential",
                "type": "credential",
                "required": False,
                "help": "Credential for the chat model provider.",
            },
            {
                "key": "model",
                "label": "Model",
                "type": "select",
                "required": True,
                "default": "gpt-4o-mini",
                "options": [
                    {"value": "gpt-4o", "label": "GPT-4o"},
                    {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
                ],
                "help": "The model to use for summarization.",
            },
            # ── Chunking Strategy ──
            {
                "key": "chunking_strategy",
                "label": "Chunking Strategy",
                "type": "select",
                "required": False,
                "default": "simple",
                "options": [
                    {"value": "simple", "label": "Simple (Define Below)"},
                    {"value": "advanced", "label": "Advanced (Connect Text Splitter)"},
                ],
                "help": "How to split long documents into chunks.",
                "group": "Chunking",
            },
            {
                "key": "characters_per_chunk",
                "label": "Characters Per Chunk",
                "type": "number",
                "required": False,
                "default": 1000,
                "help": "The maximum number of characters per text chunk.",
                "show_when": {"field": "chunking_strategy", "equals": "simple"},
                "group": "Chunking",
            },
            {
                "key": "chunk_overlap",
                "label": "Chunk Overlap",
                "type": "number",
                "required": False,
                "default": 200,
                "help": "How many characters to overlap between adjacent chunks.",
                "show_when": {"field": "chunking_strategy", "equals": "simple"},
                "group": "Chunking",
            },
            # ── Options ──
            {
                "key": "summarization_method",
                "label": "Summarization Method & Prompts",
                "type": "select",
                "required": False,
                "default": "map_reduce",
                "options": [
                    {"value": "map_reduce", "label": "Map Reduce"},
                    {"value": "refine", "label": "Refine"},
                    {"value": "stuff", "label": "Stuff"},
                ],
                "help": "The technique used to generate the summary.",
                "group": "Options",
            },
            {
                "key": "individual_summary_prompt",
                "label": "Individual Summary Prompt",
                "type": "textarea",
                "required": False,
                "help": "Custom prompt for summarizing each individual chunk.",
                "show_when": {"field": "summarization_method", "equals": "map_reduce"},
                "group": "Options",
            },
            {
                "key": "final_combine_prompt",
                "label": "Final Prompt to Combine",
                "type": "textarea",
                "required": False,
                "help": "Custom prompt for combining individual summaries into one final summary.",
                "show_when": {"field": "summarization_method", "equals": "map_reduce"},
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "summary",
                "help": "Context key where the summary is stored.",
                "group": "Options",
            },
        ],
    },
    # ── Information Extractor ────────────────────────────────────
    {
        "type": "ai_extract",
        "label": "Information Extractor",
        "category": "AI",
        "description": "Extract structured information from text using an LLM. Define the schema for what you want to extract.",
        "icon": "scan-text",
        "supports_branches": False,
        "fields": [
            {
                "key": "text",
                "label": "Text",
                "type": "textarea",
                "required": True,
                "help": "The text to extract information from. Use {{variable}} to reference data from previous steps.",
            },
            {
                "key": "extraction_type",
                "label": "Extraction Type",
                "type": "select",
                "required": True,
                "default": "define_below",
                "options": [
                    {"value": "define_below", "label": "Define below"},
                    {"value": "json_schema", "label": "JSON Schema"},
                ],
                "help": "How to define the data you want to extract.",
            },
            {
                "key": "attributes",
                "label": "Attributes to Extract",
                "type": "json",
                "required": False,
                "default": [{"name": "name", "description": "The name of the person", "type": "string", "required": True}],
                "help": "Define fields to extract. Each needs a name, description, type (string/number/boolean/date), and whether it's required.",
                "show_when": {"field": "extraction_type", "equals": "define_below"},
            },
            {
                "key": "json_schema",
                "label": "JSON Schema",
                "type": "code",
                "required": False,
                "help": "JSON Schema defining the structure of data to extract.",
                "show_when": {"field": "extraction_type", "equals": "json_schema"},
            },
            {
                "key": "provider",
                "label": "Chat Model Provider",
                "type": "select",
                "required": False,
                "default": "openai",
                "options": [
                    {"value": "openai", "label": "OpenAI"},
                    {"value": "anthropic", "label": "Anthropic"},
                    {"value": "gemini", "label": "Google Gemini"},
                    {"value": "groq", "label": "Groq"},
                    {"value": "deepseek", "label": "DeepSeek"},
                    {"value": "ollama", "label": "Ollama (Local)"},
                    {"value": "custom", "label": "Custom OpenAI-Compatible"},
                ],
            },
            {
                "key": "credential",
                "label": "Credential",
                "type": "credential",
                "required": False,
            },
            {
                "key": "model",
                "label": "Model",
                "type": "select",
                "required": True,
                "default": "gpt-4o-mini",
                "options": [
                    {"value": "gpt-4o", "label": "GPT-4o"},
                    {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
                ],
            },
            {
                "key": "system_prompt",
                "label": "System Prompt",
                "type": "textarea",
                "required": False,
                "help": "Additional instructions for the LLM on how to extract data.",
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "extracted",
                "help": "Context key where extracted data is stored.",
                "group": "Options",
            },
        ],
    },
    # ── Text Classifier ──────────────────────────────────────────
    {
        "type": "ai_classify",
        "label": "Text Classifier",
        "category": "AI",
        "description": "Classify text into predefined categories using an LLM. Each category produces a separate output.",
        "icon": "tags",
        "supports_branches": True,
        "fields": [
            {
                "key": "text",
                "label": "Text",
                "type": "textarea",
                "required": True,
                "help": "The text to classify. Use {{variable}} to reference data from previous steps.",
            },
            {
                "key": "categories",
                "label": "Categories",
                "type": "json",
                "required": True,
                "default": [
                    {"name": "Positive", "description": "The text has a positive sentiment"},
                    {"name": "Negative", "description": "The text has a negative sentiment"},
                    {"name": "Neutral", "description": "The text has a neutral sentiment"},
                ],
                "help": "Define the categories for classification. Each needs a name and description.",
            },
            {
                "key": "provider",
                "label": "Chat Model Provider",
                "type": "select",
                "required": False,
                "default": "openai",
                "options": [
                    {"value": "openai", "label": "OpenAI"},
                    {"value": "anthropic", "label": "Anthropic"},
                    {"value": "gemini", "label": "Google Gemini"},
                    {"value": "groq", "label": "Groq"},
                    {"value": "deepseek", "label": "DeepSeek"},
                    {"value": "ollama", "label": "Ollama (Local)"},
                    {"value": "custom", "label": "Custom OpenAI-Compatible"},
                ],
            },
            {
                "key": "credential",
                "label": "Credential",
                "type": "credential",
                "required": False,
            },
            {
                "key": "model",
                "label": "Model",
                "type": "select",
                "required": True,
                "default": "gpt-4o-mini",
                "options": [
                    {"value": "gpt-4o", "label": "GPT-4o"},
                    {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
                ],
            },
            {
                "key": "system_prompt",
                "label": "System Prompt",
                "type": "textarea",
                "required": False,
                "help": "Additional instructions for the classification task.",
                "group": "Options",
            },
            {
                "key": "allow_multiple",
                "label": "Allow Multiple Categories",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Allow the text to be classified into multiple categories.",
                "group": "Options",
            },
            {
                "key": "enable_autorouting",
                "label": "Enable Auto-Routing",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "Automatically route items to different outputs based on their category.",
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "classification",
                "help": "Context key where the classification result is stored.",
                "group": "Options",
            },
        ],
    },
    # ── Sentiment Analysis ───────────────────────────────────────
    {
        "type": "ai_sentiment",
        "label": "Sentiment Analysis",
        "category": "AI",
        "description": "Analyze the sentiment of text and output a sentiment score with detailed breakdown.",
        "icon": "smile",
        "supports_branches": False,
        "fields": [
            {
                "key": "text",
                "label": "Text",
                "type": "textarea",
                "required": True,
                "help": "The text to analyze. Use {{variable}} to reference data.",
            },
            {
                "key": "provider",
                "label": "Chat Model Provider",
                "type": "select",
                "required": False,
                "default": "openai",
                "options": [
                    {"value": "openai", "label": "OpenAI"},
                    {"value": "anthropic", "label": "Anthropic"},
                    {"value": "gemini", "label": "Google Gemini"},
                    {"value": "groq", "label": "Groq"},
                    {"value": "deepseek", "label": "DeepSeek"},
                    {"value": "ollama", "label": "Ollama (Local)"},
                    {"value": "custom", "label": "Custom OpenAI-Compatible"},
                ],
            },
            {
                "key": "credential",
                "label": "Credential",
                "type": "credential",
                "required": False,
            },
            {
                "key": "model",
                "label": "Model",
                "type": "select",
                "required": True,
                "default": "gpt-4o-mini",
                "options": [
                    {"value": "gpt-4o", "label": "GPT-4o"},
                    {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
                ],
            },
            {
                "key": "include_explanation",
                "label": "Include Explanation",
                "type": "boolean",
                "required": False,
                "default": True,
                "help": "Include a detailed explanation of the sentiment analysis.",
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Store Result As",
                "type": "string",
                "required": False,
                "default": "sentiment",
                "group": "Options",
            },
        ],
    },
    {
        "type": "ai_chat_model",
        "label": "AI Chat Model",
        "category": "AI",
        "description": "Cluster sub-node that supplies the model configuration for a parent AI node.",
        "icon": "cpu",
        "supports_branches": False,
        "fields": [
            {
                "key": "provider",
                "label": "Provider",
                "type": "select",
                "required": True,
                "default": "openai",
                "options": [
                    {"value": "openai", "label": "OpenAI"},
                    {"value": "anthropic", "label": "Anthropic"},
                    {"value": "gemini", "label": "Google Gemini"},
                    {"value": "groq", "label": "Groq"},
                    {"value": "deepseek", "label": "DeepSeek"},
                    {"value": "ollama", "label": "Ollama (Local)"},
                    {"value": "custom", "label": "Custom OpenAI-Compatible"},
                ],
            },
            {
                "key": "credential_name",
                "label": "Credential",
                "type": "credential",
                "required": False,
            },
            {
                "key": "model",
                "label": "Model",
                "type": "select",
                "required": True,
                "default": "gpt-4o",
                "options": [
                    {"value": "gpt-4o", "label": "GPT-4o"},
                    {"value": "gpt-4o-mini", "label": "GPT-4o Mini"},
                    {"value": "claude-sonnet-4-20250514", "label": "Claude Sonnet 4"},
                    {"value": "gemini-2.5-flash", "label": "Gemini 2.5 Flash"},
                ],
            },
            {
                "key": "temperature",
                "label": "Temperature",
                "type": "number",
                "required": False,
                "default": 0.7,
                "group": "Options",
            },
            {
                "key": "max_tokens",
                "label": "Max Tokens",
                "type": "number",
                "required": False,
                "default": 4096,
                "group": "Options",
            },
        ],
    },
    {
        "type": "ai_memory",
        "label": "AI Memory",
        "category": "AI",
        "description": "Cluster sub-node that provides reusable conversational memory to an AI node.",
        "icon": "database",
        "supports_branches": False,
        "fields": [
            {
                "key": "memory_type",
                "label": "Memory Type",
                "type": "select",
                "required": True,
                "default": "buffer_window",
                "options": [
                    {"value": "buffer_window", "label": "Window Buffer"},
                    {"value": "buffer", "label": "Buffer"},
                    {"value": "summary", "label": "Summary"},
                    {"value": "postgres", "label": "Postgres"},
                    {"value": "redis", "label": "Redis"},
                ],
            },
            {
                "key": "session_key",
                "label": "Session Key",
                "type": "string",
                "required": False,
                "default": "{{execution_id}}",
            },
            {
                "key": "context_window",
                "label": "Context Window",
                "type": "number",
                "required": False,
                "default": 5,
            },
            {
                "key": "persist_history",
                "label": "Persist History",
                "type": "boolean",
                "required": False,
                "default": True,
            },
        ],
    },
    {
        "type": "ai_tool",
        "label": "AI Tool",
        "category": "AI",
        "description": "Cluster sub-node that registers a tool an AI node can call.",
        "icon": "wrench",
        "supports_branches": False,
        "fields": [
            {
                "key": "tool_name",
                "label": "Tool Name",
                "type": "string",
                "required": True,
                "default": "tool",
            },
            {
                "key": "tool_type",
                "label": "Tool Type",
                "type": "select",
                "required": True,
                "default": "http_request",
                "options": [
                    {"value": "http_request", "label": "HTTP Request"},
                    {"value": "workflow", "label": "Workflow"},
                    {"value": "code", "label": "Code"},
                    {"value": "search", "label": "Search"},
                ],
            },
            {
                "key": "description",
                "label": "Description",
                "type": "textarea",
                "required": False,
                "default": "Describe when the agent should call this tool.",
            },
            {
                "key": "endpoint_url",
                "label": "Endpoint URL",
                "type": "string",
                "required": False,
                "show_when": {"field": "tool_type", "equals": "http_request"},
            },
            {
                "key": "method",
                "label": "Method",
                "type": "select",
                "required": False,
                "default": "GET",
                "options": [
                    {"value": "GET", "label": "GET"},
                    {"value": "POST", "label": "POST"},
                    {"value": "PUT", "label": "PUT"},
                    {"value": "DELETE", "label": "DELETE"},
                ],
                "show_when": {"field": "tool_type", "equals": "http_request"},
            },
        ],
    },
    {
        "type": "ai_output_parser",
        "label": "AI Output Parser",
        "category": "AI",
        "description": "Cluster sub-node that constrains the structured output returned by an AI node.",
        "icon": "file-output",
        "supports_branches": False,
        "fields": [
            {
                "key": "parser_type",
                "label": "Parser Type",
                "type": "select",
                "required": True,
                "default": "json",
                "options": [
                    {"value": "json", "label": "JSON"},
                    {"value": "markdown", "label": "Markdown"},
                    {"value": "regex", "label": "Regex"},
                ],
            },
            {
                "key": "schema_json",
                "label": "Schema",
                "type": "code",
                "required": False,
                "default": "{\n  \"type\": \"object\",\n  \"properties\": {}\n}",
                "show_when": {"field": "parser_type", "equals": "json"},
            },
            {
                "key": "pattern",
                "label": "Pattern",
                "type": "string",
                "required": False,
                "show_when": {"field": "parser_type", "equals": "regex"},
            },
            {
                "key": "strict_mode",
                "label": "Strict Mode",
                "type": "boolean",
                "required": False,
                "default": True,
            },
        ],
    },
    # ── Switch Node ──────────────────────────────────────────────────
    {
        "type": "switch",
        "label": "Switch",
        "category": "Flow",
        "description": "Route items to different branches based on rules or an expression value.",
        "icon": "git-branch",
        "color": "#3b82f6",
        "supports_branches": True,
        "max_branches": 10,
        "fields": [
            {
                "key": "routing_mode",
                "label": "Mode",
                "type": "select",
                "required": True,
                "default": "rules",
                "options": [
                    {"value": "rules", "label": "Rules — define conditions per branch"},
                    {"value": "expression", "label": "Expression — route by return value"},
                ],
                "group": "Routing",
            },
            {
                "key": "expression",
                "label": "Routing Expression",
                "type": "expression",
                "required": True,
                "default": "{{ $json.status }}",
                "help": "The expression result is matched against branch names to decide routing.",
                "show_when": {"field": "routing_mode", "equals": "expression"},
                "group": "Routing",
            },
            {
                "key": "branches",
                "label": "Branches",
                "type": "branch_list",
                "required": True,
                "default": [
                    {"name": "Branch 1", "condition": {"field": "", "operator": "equals", "value": ""}},
                    {"name": "Branch 2", "condition": {"field": "", "operator": "equals", "value": ""}},
                ],
                "help": "Define one or more output branches. Items matching no branch go to the fallback.",
                "show_when": {"field": "routing_mode", "equals": "rules"},
                "group": "Routing",
            },
            {
                "key": "fallback_output",
                "label": "Fallback Output",
                "type": "select",
                "required": False,
                "default": "none",
                "options": [
                    {"value": "none", "label": "Discard unmatched items"},
                    {"value": "extra_output", "label": "Send to extra output"},
                ],
                "group": "Routing",
            },
        ],
    },
    # ── Sort Node ────────────────────────────────────────────────────
    {
        "type": "sort",
        "label": "Sort",
        "category": "Data",
        "description": "Sort items by one or more fields in ascending or descending order.",
        "icon": "arrow-up-down",
        "color": "#6366f1",
        "fields": [
            {
                "key": "items",
                "label": "Items Source",
                "type": "string",
                "required": False,
                "default": "",
                "help": "Context key containing items array. Leave blank for auto-detect.",
                "group": "Input",
            },
            {
                "key": "sort_keys",
                "label": "Sort Fields",
                "type": "sort_key_list",
                "required": True,
                "default": [{"field": "", "order": "asc"}],
                "help": "Add one or more sort keys. Items are sorted by the first key, then ties broken by subsequent keys.",
                "group": "Sorting",
            },
            {
                "key": "case_sensitive",
                "label": "Case Sensitive",
                "type": "boolean",
                "required": False,
                "default": False,
                "group": "Options",
            },
            {
                "key": "nulls_position",
                "label": "Null Values",
                "type": "select",
                "required": False,
                "default": "last",
                "options": [
                    {"value": "last", "label": "Nulls Last"},
                    {"value": "first", "label": "Nulls First"},
                ],
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Output Key",
                "type": "string",
                "required": False,
                "default": "sorted",
                "group": "Output",
            },
        ],
    },
    # ── Summarize Node ───────────────────────────────────────────────
    {
        "type": "summarize",
        "label": "Summarize",
        "category": "Data",
        "description": "Group items by key fields and compute aggregate values (sum, average, min, max, count, etc.).",
        "icon": "calculator",
        "color": "#8b5cf6",
        "fields": [
            {
                "key": "items",
                "label": "Items Source",
                "type": "string",
                "required": False,
                "default": "",
                "help": "Context key containing items array.",
                "group": "Input",
            },
            {
                "key": "group_by",
                "label": "Group By Fields",
                "type": "tag_list",
                "required": False,
                "default": [],
                "help": "Fields to group items by. Leave empty to summarize all items as one group.",
                "group": "Grouping",
            },
            {
                "key": "aggregations",
                "label": "Aggregations",
                "type": "aggregation_list",
                "required": True,
                "default": [{"field": "", "operation": "count", "alias": "count"}],
                "help": "Define aggregation operations on fields.",
                "group": "Aggregations",
            },
            {
                "key": "output_key",
                "label": "Output Key",
                "type": "string",
                "required": False,
                "default": "summary",
                "group": "Output",
            },
        ],
    },
    # ── Compare Datasets Node ────────────────────────────────────────
    {
        "type": "compare_datasets",
        "label": "Compare Datasets",
        "category": "Data",
        "description": "Compare two datasets and find added, removed, changed, or unchanged items.",
        "icon": "diff",
        "color": "#ec4899",
        "fields": [
            {
                "key": "dataset_a",
                "label": "Dataset A (Source)",
                "type": "string",
                "required": True,
                "default": "",
                "help": "Context key for the first dataset (e.g. 'items', 'source_data').",
                "group": "Input",
            },
            {
                "key": "dataset_b",
                "label": "Dataset B (Target)",
                "type": "string",
                "required": True,
                "default": "",
                "help": "Context key for the second dataset.",
                "group": "Input",
            },
            {
                "key": "match_field",
                "label": "Match By Field",
                "type": "string",
                "required": True,
                "default": "id",
                "help": "The unique field used to match items between datasets (e.g. 'id', 'email').",
                "group": "Matching",
            },
            {
                "key": "compare_mode",
                "label": "Output Mode",
                "type": "select",
                "required": True,
                "default": "full_diff",
                "options": [
                    {"value": "full_diff", "label": "Full diff — all categories"},
                    {"value": "added", "label": "Added items only"},
                    {"value": "removed", "label": "Removed items only"},
                    {"value": "changed", "label": "Changed items only"},
                    {"value": "unchanged", "label": "Unchanged items only"},
                ],
                "group": "Options",
            },
            {
                "key": "compare_fields",
                "label": "Compare Fields",
                "type": "tag_list",
                "required": False,
                "default": [],
                "help": "Specific fields to compare for changes. Leave empty to compare all fields.",
                "group": "Options",
            },
            {
                "key": "output_key",
                "label": "Output Key",
                "type": "string",
                "required": False,
                "default": "diff_result",
                "group": "Output",
            },
        ],
    },
    # ── Wait Node (enhanced from delay) ──────────────────────────────
    {
        "type": "wait",
        "label": "Wait",
        "category": "Flow",
        "description": "Pause execution and resume after a duration, at a specific time, on webhook call, or on form submission.",
        "icon": "clock",
        "color": "#f59e0b",
        "fields": [
            {
                "key": "resume_mode",
                "label": "Resume",
                "type": "select",
                "required": True,
                "default": "time_interval",
                "options": [
                    {"value": "time_interval", "label": "After Time Interval"},
                    {"value": "exact_time", "label": "At Specified Time"},
                    {"value": "webhook", "label": "On Webhook Call"},
                    {"value": "form_submission", "label": "On Form Submission"},
                ],
                "group": "Resume Condition",
            },
            {
                "key": "duration_value",
                "label": "Duration",
                "type": "number",
                "required": True,
                "default": 5,
                "show_when": {"field": "resume_mode", "equals": "time_interval"},
                "group": "Resume Condition",
            },
            {
                "key": "duration_unit",
                "label": "Unit",
                "type": "select",
                "required": True,
                "default": "seconds",
                "options": [
                    {"value": "seconds", "label": "Seconds"},
                    {"value": "minutes", "label": "Minutes"},
                    {"value": "hours", "label": "Hours"},
                    {"value": "days", "label": "Days"},
                ],
                "show_when": {"field": "resume_mode", "equals": "time_interval"},
                "group": "Resume Condition",
            },
            {
                "key": "resume_at",
                "label": "Resume At",
                "type": "string",
                "required": True,
                "default": "",
                "help": "ISO 8601 datetime string (e.g. 2025-01-15T09:00:00Z). Supports expressions.",
                "show_when": {"field": "resume_mode", "equals": "exact_time"},
                "group": "Resume Condition",
            },
            {
                "key": "webhook_auth",
                "label": "Authentication",
                "type": "select",
                "required": False,
                "default": "none",
                "options": [
                    {"value": "none", "label": "None"},
                    {"value": "jwt", "label": "JWT token"},
                    {"value": "header_auth", "label": "Header Auth"},
                ],
                "show_when": {"field": "resume_mode", "equals": "webhook"},
                "group": "Webhook Options",
            },
            {
                "key": "webhook_suffix",
                "label": "Webhook Path Suffix",
                "type": "string",
                "required": False,
                "default": "",
                "help": "Optional custom path suffix for the resume URL.",
                "show_when": {"field": "resume_mode", "equals": "webhook"},
                "group": "Webhook Options",
            },
            {
                "key": "timeout_hours",
                "label": "Timeout (hours)",
                "type": "number",
                "required": False,
                "default": 168,
                "help": "Auto-resume or fail after this many hours. Default 7 days.",
                "group": "Timeout",
            },
            {
                "key": "timeout_action",
                "label": "On Timeout",
                "type": "select",
                "required": False,
                "default": "continue",
                "options": [
                    {"value": "continue", "label": "Continue with empty data"},
                    {"value": "fail", "label": "Fail execution"},
                ],
                "group": "Timeout",
            },
        ],
    },
    # ── Execute Workflow Trigger ──────────────────────────────────────
    {
        "type": "execute_workflow_trigger",
        "label": "Execute Workflow Trigger",
        "category": "Triggers",
        "description": "Entry point for workflows called by the Execute Workflow node. Define the input schema accepted by this workflow.",
        "icon": "play-circle",
        "color": "#22c55e",
        "is_trigger": True,
        "fields": [
            {
                "key": "input_source",
                "label": "Input Source",
                "type": "select",
                "required": True,
                "default": "passthrough",
                "options": [
                    {"value": "passthrough", "label": "Accept all data (passthrough)"},
                    {"value": "define_below", "label": "Define input fields below"},
                    {"value": "json_schema", "label": "JSON Schema"},
                ],
                "group": "Input Definition",
            },
            {
                "key": "input_fields",
                "label": "Input Fields",
                "type": "field_list",
                "required": False,
                "default": [],
                "help": "Define expected input fields. Each field has a name, type, and required flag.",
                "show_when": {"field": "input_source", "equals": "define_below"},
                "group": "Input Definition",
            },
            {
                "key": "json_schema",
                "label": "JSON Schema",
                "type": "code",
                "required": False,
                "default": "{}",
                "language": "json",
                "show_when": {"field": "input_source", "equals": "json_schema"},
                "group": "Input Definition",
            },
            {
                "key": "caller_policy",
                "label": "Caller Policy",
                "type": "select",
                "required": False,
                "default": "any",
                "options": [
                    {"value": "any", "label": "Any workflow in workspace"},
                    {"value": "whitelist", "label": "Only whitelisted workflows"},
                    {"value": "none", "label": "No external callers (test only)"},
                ],
                "group": "Security",
            },
        ],
    },
    # ── Form Trigger ─────────────────────────────────────────────────
    {
        "type": "form_trigger",
        "label": "Form Trigger",
        "category": "Triggers",
        "family": "triggers",
        "description": "Start a workflow when a user submits a form. Generates a public form page.",
        "icon": "FileText",
        "color": "#7c3aed",
        "supports_branches": False,
        "fields": [
            {
                "key": "form_title",
                "label": "Form Title",
                "type": "string",
                "required": True,
                "default": "My Form",
                "help": "Displayed as the page heading.",
            },
            {
                "key": "form_description",
                "label": "Form Description",
                "type": "textarea",
                "required": False,
                "default": "",
                "help": "Subtitle below the title. Supports HTML.",
            },
            {
                "key": "form_path",
                "label": "Form Path",
                "type": "string",
                "required": False,
                "default": "",
                "help": "Custom slug (e.g. 'contact-us'). Auto-generated if empty.",
            },
            {
                "key": "form_fields",
                "label": "Form Fields",
                "type": "field_list",
                "required": True,
                "default": [{"field_label": "Name", "field_type": "text", "required": True}],
                "help": "Define form fields: label, type (text, email, number, textarea, date, dropdown, checkbox, radio, file, hidden), required.",
            },
            {
                "key": "authentication",
                "label": "Authentication",
                "type": "select",
                "required": False,
                "default": "none",
                "options": [
                    {"value": "none", "label": "None"},
                    {"value": "basic_auth", "label": "Basic Auth"},
                ],
            },
            {
                "key": "button_label",
                "label": "Submit Button Label",
                "type": "string",
                "required": False,
                "default": "Submit",
            },
            {
                "key": "redirect_url",
                "label": "Redirect URL After Submit",
                "type": "string",
                "required": False,
                "default": "",
                "help": "URL to redirect after form submission. Shows thank-you page if empty.",
            },
        ],
    },
    # ── Chat Trigger ─────────────────────────────────────────────────
    {
        "type": "chat_trigger",
        "label": "Chat Trigger",
        "category": "Triggers",
        "family": "triggers",
        "description": "Start a workflow from a chat message. Powers chatbot and AI agent interfaces.",
        "icon": "MessageSquare",
        "color": "#7c3aed",
        "supports_branches": False,
        "fields": [
            {
                "key": "chat_mode",
                "label": "Chat Mode",
                "type": "select",
                "required": True,
                "default": "hosted",
                "options": [
                    {"value": "hosted", "label": "Hosted Chat (built-in UI)"},
                    {"value": "embedded", "label": "Embedded Chat (your own UI)"},
                    {"value": "api", "label": "API Only"},
                ],
            },
            {
                "key": "public",
                "label": "Make Chat Publicly Available",
                "type": "boolean",
                "required": False,
                "default": False,
                "help": "Turn on when ready for production. Keep off during development.",
            },
            {
                "key": "authentication",
                "label": "Authentication",
                "type": "select",
                "required": False,
                "default": "none",
                "options": [
                    {"value": "none", "label": "None"},
                    {"value": "basic_auth", "label": "Basic Auth"},
                    {"value": "user_auth", "label": "User Auth (logged-in users only)"},
                ],
                "show_when": {"field": "public", "equals": True},
            },
            {
                "key": "initial_messages",
                "label": "Initial Message(s)",
                "type": "textarea",
                "required": False,
                "default": "Hi there! How can I help you today?",
                "help": "Welcome message shown when the chat opens. One message per line.",
                "show_when": {"field": "chat_mode", "equals": "hosted"},
            },
            {
                "key": "title",
                "label": "Chat Title",
                "type": "string",
                "required": False,
                "default": "Chat",
            },
            {
                "key": "subtitle",
                "label": "Chat Subtitle",
                "type": "string",
                "required": False,
                "default": "",
            },
            {
                "key": "input_placeholder",
                "label": "Input Placeholder",
                "type": "string",
                "required": False,
                "default": "Type a message…",
            },
            {
                "key": "load_previous_session",
                "label": "Load Previous Session",
                "type": "select",
                "required": False,
                "default": "off",
                "options": [
                    {"value": "off", "label": "Off"},
                    {"value": "from_memory", "label": "From Memory"},
                ],
            },
            {
                "key": "response_mode",
                "label": "Response Mode",
                "type": "select",
                "required": False,
                "default": "last_node",
                "options": [
                    {"value": "last_node", "label": "When Last Node Finishes"},
                    {"value": "response_nodes", "label": "Using Response Nodes"},
                    {"value": "streaming", "label": "Streaming Response"},
                ],
            },
            {
                "key": "allowed_origins",
                "label": "Allowed Origins (CORS)",
                "type": "string",
                "required": False,
                "default": "*",
                "help": "Comma-separated origins. Use * to allow all.",
            },
        ],
    },
    # ── Error Trigger ────────────────────────────────────────────────
    {
        "type": "error_trigger",
        "label": "Error Trigger",
        "category": "Triggers",
        "family": "triggers",
        "description": "Catch execution errors from linked workflows. Receives error details when a workflow fails.",
        "icon": "AlertTriangle",
        "color": "#ef4444",
        "supports_branches": False,
        "fields": [
            {
                "key": "info",
                "label": "How It Works",
                "type": "string",
                "required": False,
                "default": "This node triggers when a linked workflow fails. Set this workflow as the Error Workflow in another workflow's settings.",
                "help": "Error data includes: execution ID, URL, error message, stack trace, last node executed, workflow name.",
            },
        ],
    },
    # ── RSS Trigger ──────────────────────────────────────────────────
    {
        "type": "rss_trigger",
        "label": "RSS Feed Trigger",
        "category": "Triggers",
        "family": "triggers",
        "description": "Poll an RSS/Atom feed and trigger on new items.",
        "icon": "Rss",
        "color": "#f97316",
        "supports_branches": False,
        "fields": [
            {
                "key": "feed_url",
                "label": "Feed URL",
                "type": "string",
                "required": True,
                "default": "",
                "help": "The RSS or Atom feed URL to poll.",
            },
            {
                "key": "poll_interval",
                "label": "Poll Interval",
                "type": "select",
                "required": True,
                "default": "5m",
                "options": [
                    {"value": "1m", "label": "Every 1 minute"},
                    {"value": "5m", "label": "Every 5 minutes"},
                    {"value": "15m", "label": "Every 15 minutes"},
                    {"value": "30m", "label": "Every 30 minutes"},
                    {"value": "1h", "label": "Every 1 hour"},
                    {"value": "6h", "label": "Every 6 hours"},
                    {"value": "12h", "label": "Every 12 hours"},
                    {"value": "24h", "label": "Every 24 hours"},
                ],
            },
            {
                "key": "max_items",
                "label": "Max Items Per Poll",
                "type": "number",
                "required": False,
                "default": 10,
                "help": "Maximum number of new items to process per poll cycle.",
            },
            {
                "key": "output_fields",
                "label": "Output Fields",
                "type": "select",
                "required": False,
                "default": "all",
                "options": [
                    {"value": "all", "label": "All fields"},
                    {"value": "title_link", "label": "Title + Link only"},
                    {"value": "custom", "label": "Custom selection"},
                ],
            },
        ],
    },
    # ── Form Node (mid-flow) ─────────────────────────────────────────
    {
        "type": "form_node",
        "label": "Form",
        "category": "Utility",
        "family": "utility",
        "description": "Show a form page mid-workflow to collect additional user input. Requires Form Trigger as the workflow entry.",
        "icon": "ClipboardList",
        "color": "#7c3aed",
        "supports_branches": False,
        "fields": [
            {
                "key": "page_title",
                "label": "Page Title",
                "type": "string",
                "required": False,
                "default": "",
                "help": "Title for this form page.",
            },
            {
                "key": "page_description",
                "label": "Page Description",
                "type": "textarea",
                "required": False,
                "default": "",
            },
            {
                "key": "form_fields",
                "label": "Form Fields",
                "type": "field_list",
                "required": True,
                "default": [{"field_label": "Response", "field_type": "textarea", "required": True}],
                "help": "Fields for this form page.",
            },
            {
                "key": "page_type",
                "label": "Page Type",
                "type": "select",
                "required": False,
                "default": "form_page",
                "options": [
                    {"value": "form_page", "label": "Form Page"},
                    {"value": "form_ending", "label": "Form Ending (final page)"},
                ],
            },
            {
                "key": "completion_message",
                "label": "Completion Message",
                "type": "textarea",
                "required": False,
                "default": "Thank you for your submission!",
                "show_when": {"field": "page_type", "equals": "form_ending"},
                "help": "Message shown on the final page.",
            },
            {
                "key": "button_label",
                "label": "Button Label",
                "type": "string",
                "required": False,
                "default": "Next",
            },
        ],
    },

    # ── Knowledge & Memory Nodes ──

    {
        "type": "vector_store",
        "label": "Vector Store",
        "category": "AI / Knowledge",
        "description": "Store and retrieve document embeddings. Supports insert, search, and delete operations on a vector store.",
        "icon": "database",
        "color": "#8B5CF6",
        "supports_branches": False,
        "fields": [
            {"key": "operation", "label": "Operation", "type": "select", "required": True, "default": "search",
             "options": [
                 {"label": "Insert Documents", "value": "insert"},
                 {"label": "Search (Get Many)", "value": "search"},
                 {"label": "Delete", "value": "delete"},
             ]},
            {"key": "knowledge_base_id", "label": "Knowledge Base", "type": "string", "required": True,
             "help": "ID of the knowledge base to operate on"},
            {"key": "query", "label": "Search Query", "type": "expression", "required": False,
             "show_when": {"field": "operation", "equals": "search"},
             "help": "Text query for similarity search"},
            {"key": "top_k", "label": "Top K Results", "type": "number", "required": False, "default": 5,
             "show_when": {"field": "operation", "equals": "search"}},
            {"key": "content_field", "label": "Content Field", "type": "string", "required": False, "default": "content",
             "show_when": {"field": "operation", "equals": "insert"},
             "help": "Field name containing text to embed"},
            {"key": "metadata_fields", "label": "Metadata Fields", "type": "string", "required": False,
             "show_when": {"field": "operation", "equals": "insert"},
             "help": "Comma-separated field names to store as metadata"},
        ],
    },
    {
        "type": "document_loader",
        "label": "Document Loader",
        "category": "AI / Knowledge",
        "description": "Load documents from various sources: text input, file upload, or URL. Prepares content for chunking and embedding.",
        "icon": "file-text",
        "color": "#6366F1",
        "supports_branches": False,
        "fields": [
            {"key": "source_type", "label": "Source Type", "type": "select", "required": True, "default": "text",
             "options": [
                 {"label": "Text Input", "value": "text"},
                 {"label": "Binary File", "value": "binary"},
                 {"label": "URL", "value": "url"},
                 {"label": "JSON Data", "value": "json"},
             ]},
            {"key": "text_content", "label": "Text Content", "type": "expression", "required": False,
             "show_when": {"field": "source_type", "equals": "text"}},
            {"key": "url", "label": "URL", "type": "string", "required": False,
             "show_when": {"field": "source_type", "equals": "url"}},
            {"key": "json_field", "label": "JSON Field", "type": "string", "required": False, "default": "content",
             "show_when": {"field": "source_type", "equals": "json"},
             "help": "Field containing text to extract"},
            {"key": "metadata_mode", "label": "Metadata Mode", "type": "select", "required": False, "default": "auto",
             "options": [
                 {"label": "Auto-detect", "value": "auto"},
                 {"label": "Custom fields", "value": "custom"},
                 {"label": "None", "value": "none"},
             ]},
        ],
    },
    {
        "type": "text_splitter",
        "label": "Text Splitter",
        "category": "AI / Knowledge",
        "description": "Split documents into smaller chunks for embedding. Supports character, recursive, and token-based splitting strategies.",
        "icon": "scissors",
        "color": "#A855F7",
        "supports_branches": False,
        "fields": [
            {"key": "strategy", "label": "Splitting Strategy", "type": "select", "required": True, "default": "recursive",
             "options": [
                 {"label": "Recursive Character", "value": "recursive"},
                 {"label": "Character", "value": "character"},
                 {"label": "Token", "value": "token"},
             ]},
            {"key": "chunk_size", "label": "Chunk Size", "type": "number", "required": True, "default": 500,
             "help": "Maximum characters per chunk"},
            {"key": "chunk_overlap", "label": "Chunk Overlap", "type": "number", "required": True, "default": 50,
             "help": "Characters of overlap between chunks"},
            {"key": "separator", "label": "Separator", "type": "string", "required": False,
             "show_when": {"field": "strategy", "equals": "character"},
             "help": "Character to split on (e.g. \\n\\n)"},
        ],
    },
    {
        "type": "embedding",
        "label": "Embeddings",
        "category": "AI / Knowledge",
        "description": "Generate vector embeddings from text using various providers: OpenAI, Ollama, Gemini, or mock embeddings for testing.",
        "icon": "cpu",
        "color": "#EC4899",
        "supports_branches": False,
        "fields": [
            {"key": "provider", "label": "Provider", "type": "select", "required": True, "default": "mock",
             "options": [
                 {"label": "Mock (Testing)", "value": "mock"},
                 {"label": "OpenAI", "value": "openai"},
                 {"label": "Ollama", "value": "ollama"},
                 {"label": "Google Gemini", "value": "gemini"},
             ]},
            {"key": "model", "label": "Model", "type": "string", "required": False,
             "help": "Embedding model name (e.g. text-embedding-3-small)"},
            {"key": "dimensions", "label": "Dimensions", "type": "number", "required": False, "default": 384,
             "help": "Vector dimension size"},
        ],
    },
    {
        "type": "retriever",
        "label": "Retriever",
        "category": "AI / Knowledge",
        "description": "Retrieve relevant documents from a knowledge base. Supports simple similarity search, multi-query, and contextual compression.",
        "icon": "search",
        "color": "#F59E0B",
        "supports_branches": False,
        "fields": [
            {"key": "retriever_type", "label": "Retriever Type", "type": "select", "required": True, "default": "simple",
             "options": [
                 {"label": "Simple Similarity", "value": "simple"},
                 {"label": "Multi-Query", "value": "multi_query"},
                 {"label": "Contextual Compression", "value": "contextual"},
             ]},
            {"key": "knowledge_base_id", "label": "Knowledge Base", "type": "string", "required": True},
            {"key": "top_k", "label": "Top K Results", "type": "number", "required": False, "default": 5},
            {"key": "score_threshold", "label": "Min Score", "type": "number", "required": False, "default": 0.0,
             "help": "Minimum similarity score (0-1) to include results"},
            {"key": "include_metadata", "label": "Include Metadata", "type": "boolean", "required": False, "default": True},
        ],
    },
    {
        "type": "knowledge_search",
        "label": "Knowledge Search",
        "category": "AI / Knowledge",
        "description": "Search a knowledge base and return relevant text chunks. Combines document retrieval with optional LLM summarization.",
        "icon": "book-open",
        "color": "#10B981",
        "supports_branches": False,
        "fields": [
            {"key": "knowledge_base_id", "label": "Knowledge Base", "type": "string", "required": True},
            {"key": "query", "label": "Query", "type": "expression", "required": True,
             "help": "Search query (supports expressions)"},
            {"key": "top_k", "label": "Max Results", "type": "number", "required": False, "default": 5},
            {"key": "summarize", "label": "Summarize Results", "type": "boolean", "required": False, "default": False,
             "help": "Use LLM to summarize retrieved chunks into a single answer"},
            {"key": "output_format", "label": "Output Format", "type": "select", "required": False, "default": "chunks",
             "options": [
                 {"label": "Individual Chunks", "value": "chunks"},
                 {"label": "Combined Text", "value": "combined"},
                 {"label": "JSON with Metadata", "value": "json"},
             ]},
        ],
    },
]


NODE_REGISTRY = {item["type"]: item for item in NODE_DEFINITIONS}


WORKFLOW_SETTINGS_DEFAULTS: dict[str, Any] = {
    "execution_order": "v1",
    "error_workflow_id": None,
    "caller_policy": "inherit",
    "timezone": "UTC",
    "save_failed_executions": "all",
    "save_successful_executions": "all",
    "save_manual_executions": True,
    "save_execution_progress": True,
    "timeout_seconds": 3600,
    "time_saved_minutes": 0,
}


def list_node_definitions() -> list[dict[str, Any]]:
    return NODE_DEFINITIONS


def get_node_definition(node_type: str) -> dict[str, Any] | None:
    return NODE_REGISTRY.get(node_type)


def get_node_error_settings_fields() -> list[dict[str, Any]]:
    """
    Return the standard per-node error-handling fields that appear in the
    inspector Settings tab for every node (except Trigger nodes).
    These fields map to config keys read by the executor via errors.py.
    """
    return [
        {
            "key": "_on_error",
            "label": "On Error",
            "type": "select",
            "group": "Error Handling",
            "default": "stop",
            "options": [
                {"value": "stop", "label": "Stop workflow"},
                {"value": "continue", "label": "Continue (ignore error)"},
                {"value": "continue_with_error", "label": "Continue with error data"},
            ],
            "help": (
                "What happens when this step fails. "
                "'Continue with error data' passes the error object to the next step."
            ),
        },
        {
            "key": "_error_handler",
            "label": "Error Handler",
            "type": "select",
            "group": "Error Handling",
            "default": None,
            "options": [
                {"value": None, "label": "None (use On Error setting)"},
                {"value": "ignore", "label": "Ignore — skip and continue"},
                {"value": "resume", "label": "Resume — use fallback value"},
                {"value": "commit", "label": "Commit — save progress and stop"},
                {"value": "rollback", "label": "Rollback — undo and stop"},
                {"value": "break", "label": "Break — store as incomplete"},
            ],
            "help": "Override On Error with a specific Make-style error handler.",
        },
        {
            "key": "_retry_on_fail",
            "label": "Retry on Fail",
            "type": "boolean",
            "group": "Error Handling",
            "default": False,
        },
        {
            "key": "_retry_count",
            "label": "Retry Count",
            "type": "number",
            "group": "Error Handling",
            "default": 3,
            "min": 1,
            "max": 10,
            "show_when": {"field": "_retry_on_fail", "equals": True},
        },
        {
            "key": "_retry_wait_ms",
            "label": "Retry Wait (ms)",
            "type": "number",
            "group": "Error Handling",
            "default": 1000,
            "min": 100,
            "max": 60000,
            "show_when": {"field": "_retry_on_fail", "equals": True},
        },
        {
            "key": "_retry_backoff",
            "label": "Retry Backoff",
            "type": "select",
            "group": "Error Handling",
            "default": "fixed",
            "options": [
                {"value": "fixed", "label": "Fixed"},
                {"value": "exponential", "label": "Exponential"},
                {"value": "exponential_jitter", "label": "Exponential + Jitter"},
            ],
            "show_when": {"field": "_retry_on_fail", "equals": True},
        },
        {
            "key": "_timeout_seconds",
            "label": "Timeout (seconds)",
            "type": "number",
            "group": "Error Handling",
            "default": None,
            "min": 1,
            "max": 3600,
            "help": "Maximum time this step may run before a StepTimeoutError is raised.",
        },
    ]


def normalize_workflow_settings(settings: dict[str, Any] | None) -> dict[str, Any]:
    incoming = dict(settings or {})
    return {
        key: incoming.get(key, default)
        for key, default in WORKFLOW_SETTINGS_DEFAULTS.items()
    }


def _infer_field_default(
    step: dict[str, Any],
    field: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
) -> Any | None:
    node_type = str(step.get("type") or "")
    key = str(field.get("key") or "")
    step_name = str(step.get("name") or "").strip()

    if node_type == "trigger" and key == "source":
        return workflow_trigger_type or "manual"
    if node_type == "transform" and key == "template":
        return f"Transform the workflow payload for {step_name or 'the next step'}."
    if node_type == "condition" and key == "field":
        return "status"
    if node_type == "llm" and key == "prompt":
        return f"Complete the '{step_name or 'AI'}' step using the current workflow context."
    if node_type == "output" and key == "channel":
        return "default"
    if node_type == "human" and key == "title":
        return step_name or "Review task"
    if node_type == "human" and key == "instructions":
        return "Review this item and choose the next path."
    if node_type == "callback" and key == "instructions":
        return "Resume this workflow when the external callback arrives."
    if node_type == "loop" and key == "items":
        return "items"
    if node_type == "code" and key == "script":
        return "result = payload"
    if node_type == "http_request" and key == "url":
        return "https://api.example.com"
    if node_type == "filter" and key == "items":
        return "items"
    if node_type == "aggregate" and key == "items":
        return "items"
    if node_type == "split_out" and key == "items":
        return "items"
    return None


def normalize_workflow_definition(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
) -> dict[str, Any]:
    normalized_steps: list[dict[str, Any]] = []

    for step in definition.get("steps", []):
        node_type = str(step.get("type") or "")
        node_definition = get_node_definition(node_type)
        config = dict(step.get("config") or {})

        if node_definition is not None:
            for field in node_definition["fields"]:
                key = field["key"]
                if key not in config and "default" in field:
                    default_value = field.get("default")
                    if isinstance(default_value, list):
                        config[key] = list(default_value)
                    elif isinstance(default_value, dict):
                        config[key] = dict(default_value)
                    else:
                        config[key] = default_value
                if key not in config:
                    inferred_default = _infer_field_default(step, field, workflow_trigger_type=workflow_trigger_type)
                    if inferred_default is not None:
                        config[key] = inferred_default

        if node_type == "trigger" and not config.get("source") and workflow_trigger_type:
            config["source"] = workflow_trigger_type
        if node_type == "condition" and "operator" not in config:
            config["operator"] = "equals"
        if node_type == "human" and not config.get("choices"):
            config["choices"] = ["approved", "rejected"]
        if node_type == "callback" and config.get("mode") == "decision" and not config.get("choices"):
            config["choices"] = ["approved", "rejected"]

        normalized_steps.append(
            {
                **step,
                "config": config,
            }
        )

    return {
        "steps": normalized_steps,
        "edges": list(definition.get("edges") or []),
        "settings": normalize_workflow_settings(definition.get("settings")),
    }


def _build_linear_edges(steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "id": f"edge-{steps[index]['id']}-{steps[index + 1]['id']}",
            "source": steps[index]["id"],
            "target": steps[index + 1]["id"],
            "label": None,
        }
        for index in range(len(steps) - 1)
    ]


def repair_workflow_definition(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
    template_definition: dict[str, Any] | None = None,
) -> tuple[dict[str, Any], list[str]]:
    actions: list[str] = []
    repaired = normalize_workflow_definition(definition, workflow_trigger_type=workflow_trigger_type)
    steps = list(repaired.get("steps") or [])
    edges = list(repaired.get("edges") or [])

    if not steps and template_definition and template_definition.get("steps"):
        repaired = normalize_workflow_definition(template_definition, workflow_trigger_type=workflow_trigger_type)
        steps = list(repaired.get("steps") or [])
        edges = list(repaired.get("edges") or [])
        actions.append("hydrated_from_template")

    if not steps:
        starter_trigger = {
            "id": "trigger-1",
            "type": "trigger",
            "name": "Start workflow",
            "config": {"source": workflow_trigger_type or "manual"},
        }
        starter_output = {
            "id": "output-1",
            "type": "output",
            "name": "Complete workflow",
            "config": {"channel": "default"},
        }
        steps = [starter_trigger, starter_output]
        edges = _build_linear_edges(steps)
        actions.append("seeded_starter_flow")

    trigger_steps = [step for step in steps if str(step.get("type")) == "trigger"]
    if not trigger_steps:
        trigger_id = "trigger-auto"
        trigger_step = {
            "id": trigger_id,
            "type": "trigger",
            "name": "Workflow trigger",
            "config": {"source": workflow_trigger_type or "manual"},
        }
        first_step_id = steps[0]["id"]
        steps = [trigger_step, *steps]
        edges = [{"id": f"edge-{trigger_id}-{first_step_id}", "source": trigger_id, "target": first_step_id, "label": None}, *edges]
        actions.append("inserted_trigger_step")
        trigger_steps = [steps[0]]

    if len(trigger_steps) > 1:
        primary_trigger_id = str(trigger_steps[0]["id"])
        rewritten_steps: list[dict[str, Any]] = []
        for step in steps:
            if str(step.get("type")) == "trigger" and str(step.get("id")) != primary_trigger_id:
                rewritten_steps.append(
                    {
                        **step,
                        "type": "transform",
                        "name": f"{step.get('name') or 'Trigger'} follow-up",
                        "config": {
                            **dict(step.get("config") or {}),
                            "template": f"Continue the workflow after {step.get('name') or 'the previous step'}.",
                        },
                    }
                )
            else:
                rewritten_steps.append(step)
        steps = rewritten_steps
        actions.append("demoted_extra_triggers")

    if workflow_trigger_type:
        rewritten_steps = []
        trigger_source_fixed = False
        for step in steps:
            if str(step.get("type")) == "trigger":
                config = dict(step.get("config") or {})
                if config.get("source") != workflow_trigger_type:
                    config["source"] = workflow_trigger_type
                    trigger_source_fixed = True
                rewritten_steps.append({**step, "config": config})
            else:
                rewritten_steps.append(step)
        if trigger_source_fixed:
            steps = rewritten_steps
            actions.append("aligned_trigger_source")

    if len(steps) > 1 and not edges:
        edges = _build_linear_edges(steps)
        actions.append("rebuilt_linear_edges")

    repaired = normalize_workflow_definition(
        {
            "steps": steps,
            "edges": edges,
            "settings": repaired.get("settings") or definition.get("settings") or {},
        },
        workflow_trigger_type=workflow_trigger_type,
    )
    return repaired, actions


def validate_workflow_definition(
    definition: dict[str, Any],
    *,
    workflow_trigger_type: str | None = None,
) -> dict[str, Any]:
    definition = normalize_workflow_definition(definition, workflow_trigger_type=workflow_trigger_type)
    issues: list[dict[str, Any]] = []
    steps = definition.get("steps", [])
    edges = definition.get("edges", [])

    step_ids = [step.get("id") for step in steps]
    edge_ids = [edge.get("id") for edge in edges]
    step_lookup = {step.get("id"): step for step in steps if step.get("id")}
    outgoing: dict[str, list[dict[str, Any]]] = {}
    incoming_count: dict[str, int] = {}

    if len(step_ids) != len({item for item in step_ids if item}):
        issues.append({"level": "error", "code": "duplicate_step_id", "message": "Workflow step ids must be unique."})
    if len(edge_ids) != len({item for item in edge_ids if item}):
        issues.append({"level": "error", "code": "duplicate_edge_id", "message": "Workflow edge ids must be unique."})
    if not steps:
        issues.append({"level": "error", "code": "missing_steps", "message": "Workflow must contain at least one node."})

    for edge in edges:
        source = edge.get("source")
        target = edge.get("target")
        if source not in step_lookup:
            issues.append({"level": "error", "code": "missing_edge_source", "message": f"Edge source '{source}' does not exist.", "edge_id": edge.get("id")})
        if target not in step_lookup:
            issues.append({"level": "error", "code": "missing_edge_target", "message": f"Edge target '{target}' does not exist.", "edge_id": edge.get("id")})
        outgoing.setdefault(str(source), []).append(edge)
        incoming_count[str(target)] = incoming_count.get(str(target), 0) + 1

    trigger_steps = [step for step in steps if step.get("type") == "trigger"]
    if len(trigger_steps) == 0:
        issues.append({"level": "warning", "code": "missing_trigger", "message": "Workflows usually start with a trigger node."})
    elif len(trigger_steps) > 1:
        issues.append({"level": "warning", "code": "multiple_triggers", "message": "Multiple trigger nodes were found. Most workflow tools use one primary trigger."})

    if workflow_trigger_type and trigger_steps:
        trigger_source = str(trigger_steps[0].get("config", {}).get("source") or workflow_trigger_type)
        if workflow_trigger_type != trigger_source and trigger_source not in {"manual", "event"}:
            issues.append({
                "level": "warning",
                "code": "trigger_type_mismatch",
                "message": f"Workflow trigger_type '{workflow_trigger_type}' does not match trigger node source '{trigger_source}'.",
                "step_id": trigger_steps[0].get("id"),
            })

    entry_steps = [step for step in steps if incoming_count.get(str(step.get("id")), 0) == 0]
    if not entry_steps and steps:
        issues.append({"level": "warning", "code": "no_entry_step", "message": "No clear entry node was found. The graph may contain a cycle."})

    for step in steps:
        step_id = str(step.get("id") or "")
        node_type = str(step.get("type") or "")
        config = step.get("config", {}) or {}
        node_definition = get_node_definition(node_type)
        if node_definition is None:
            issues.append({"level": "error", "code": "unknown_node_type", "message": f"Unsupported node type '{node_type}'.", "step_id": step_id})
            continue

        for field in node_definition["fields"]:
            key = field["key"]
            required = bool(field.get("required"))
            field_type = field["type"]
            value = config.get(key)
            if required and (value is None or value == "" or value == []):
                issues.append({"level": "error", "code": "missing_required_field", "message": f"{node_definition['label']} requires '{key}'.", "step_id": step_id, "field": key})
                continue
            if value is None:
                continue
            if field_type in {"string", "textarea", "select"} and not isinstance(value, str):
                issues.append({"level": "error", "code": "invalid_field_type", "message": f"Field '{key}' must be a string.", "step_id": step_id, "field": key})
            elif field_type == "number" and not isinstance(value, (int, float)):
                issues.append({"level": "error", "code": "invalid_field_type", "message": f"Field '{key}' must be numeric.", "step_id": step_id, "field": key})
            elif field_type == "tags" and not isinstance(value, list):
                issues.append({"level": "error", "code": "invalid_field_type", "message": f"Field '{key}' must be a list.", "step_id": step_id, "field": key})

        if node_type == "condition":
            labels = {str(edge.get("label") or "").lower() for edge in outgoing.get(step_id, [])}
            if labels and not {"true", "false"}.issuperset(labels):
                issues.append({"level": "warning", "code": "condition_branch_labels", "message": "Condition branches should usually use 'true' and 'false' labels.", "step_id": step_id})
        if node_type == "human":
            choices = config.get("choices") or []
            if len(choices) < 2:
                issues.append({"level": "warning", "code": "human_choices_short", "message": "Human task nodes usually define at least two choices.", "step_id": step_id})
        if node_type == "delay":
            total = int(config.get("seconds") or 0) + int(config.get("minutes") or 0) + int(config.get("hours") or 0)
            if total <= 0:
                issues.append({"level": "error", "code": "delay_duration_missing", "message": "Delay nodes require a positive duration.", "step_id": step_id})
        if node_type == "callback":
            mode = str(config.get("mode") or "payload")
            if mode == "decision" and not config.get("choices"):
                issues.append({"level": "warning", "code": "callback_choices_missing", "message": "Decision-mode callback nodes should define choices.", "step_id": step_id})

    valid = not any(issue["level"] == "error" for issue in issues)
    return {
        "valid": valid,
        "issues": issues,
        "stats": {
            "steps_count": len(steps),
            "edges_count": len(edges),
            "entry_steps_count": len(entry_steps),
            "trigger_steps_count": len(trigger_steps),
        },
    }
