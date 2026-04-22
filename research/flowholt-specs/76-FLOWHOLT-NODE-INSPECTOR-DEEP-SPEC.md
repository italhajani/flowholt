# 76 · FlowHolt: Node Inspector Deep Spec

> **Purpose**: Exhaustive specification for the Node Inspector panel — every field type, every state, every node type's exact parameter form, validation rules, and interaction patterns. This is the reference for `StudioInspector.tsx`.
> **Audience**: Junior AI model implementing node parameter forms. Zero guesswork needed.
> **Sources**: spec 15 (inspector/modal inventory), spec 26 (field catalog), spec 27 (per-node fields), spec 30 (tab states), spec 33 (node exceptions), spec 42 §5 (n8n inspector patterns).

---

## Cross-Reference Map

| Section | Source |
|---------|--------|
| §1 Inspector shell | spec 07 §inspector, spec 42 §5.1 |
| §2 Field components | spec 26, spec 27, spec 42 §5.2 |
| §3 Expression mode | spec 50 (expression spec) |
| §4 Params tab by node type | spec 27, spec 51 (node inventory) |
| §5 Output tab | spec 42 §5.4 |
| §6 Settings tab | spec 15 §error-handling |
| §7 Docs tab | spec 42 §5.5 |
| §8 Special panels | spec 30, spec 33 |
| §9 Validation | spec 15 §validation |

---

## 1. Inspector Shell Architecture

### 1.1 Shell Structure

```tsx
// src/components/studio/StudioInspector.tsx

<aside className="w-[380px] border-l flex flex-col h-full bg-background">
  {/* Header */}
  <InspectorHeader node={selectedNode} onClose={deselect} onRename={rename} />
  
  {/* Tab bar */}
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList>
      <TabsTrigger value="params">Params</TabsTrigger>
      <TabsTrigger value="output">Output</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
      <TabsTrigger value="docs">Docs</TabsTrigger>
    </TabsList>
    
    <TabsContent value="params"><ParamsTab node={selectedNode} /></TabsContent>
    <TabsContent value="output"><OutputTab node={selectedNode} /></TabsContent>
    <TabsContent value="settings"><SettingsTab node={selectedNode} /></TabsContent>
    <TabsContent value="docs"><DocsTab node={selectedNode} /></TabsContent>
  </Tabs>
</aside>
```

### 1.2 Inspector Header

```
┌────────────────────────────────────────────────────┐
│  [node icon 20px]  [Node Name]         [✎] [✕]   │
│  [category label]  •  [node_type_id]              │
└────────────────────────────────────────────────────┘
```

- **Node icon**: App logo or category icon (colored circle background)
- **Node name**: Editable on click of ✎ pencil icon → inline input
- **Rename**: Enter to confirm, Escape to cancel, name limited to 80 chars
- **Close (✕)**: Deselects node, collapses inspector
- **Category label**: Small gray text, e.g., "Action" or "Trigger"
- **Node type**: Monospace small text, e.g., `gmail.send_email`

### 1.3 Tab Availability by Node Type

| Node family | Params | Output | Settings | Docs |
|-------------|--------|--------|---------|------|
| Trigger nodes | ✅ | ✅ | ✅ | ✅ |
| Action nodes | ✅ | ✅ | ✅ | ✅ |
| Flow control (IF, Switch, Merge) | ✅ | ✅ | ✅ | ✅ |
| Code node | ✅ (code editor) | ✅ | ✅ | ✅ |
| Note (sticky) | ✅ (text only) | ❌ | ❌ | ❌ |
| Start/End nodes | ❌ | ✅ | ✅ | ✅ |

---

## 2. Field Components (Complete Catalog)

### 2.1 TextField

**Use when**: Any single-line text input.

```tsx
interface TextFieldProps {
  name: string;
  label: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  help?: string;
  maxLength?: number;
  expressionEnabled?: boolean;  // shows {expr} toggle
  onChange: (v: string) => void;
}
```

**Visual**:
```
Email
[user@example.com                    {]}
```

- `{]}` = expression toggle button (right side of input)
- When expression mode active: input turns pink/teal background, shows expression preview below
- `?` help icon appears when `help` prop is provided — hover shows tooltip

### 2.2 NumberField

Like TextField but:
- `<input type="number">`
- Increment/decrement arrows on right
- Optional min/max/step props
- Expression toggle available

### 2.3 SelectField

```
Output format
[JSON ▼                              ]
```

- Opens Radix `<Select>` dropdown
- Options can be static array or loaded from API (`dynamic: true`)
- When `dynamic: true`: shows loading spinner while fetching, "Load options" if failed

### 2.4 MultiSelectField

```
Scopes
[read ×] [write ×] [+ Add scope]
```

- Tag-style chips for selected values
- Click `×` to remove chip
- Click `+` or focus to open dropdown of remaining options
- Expression toggle NOT available (list values, not expression)

### 2.5 BooleanField (Toggle)

```
Continue on error
                              [●]
```

- Radix `<Switch>` component
- Label on left, toggle on right
- No expression toggle

### 2.6 TextareaField

```
Message body
┌──────────────────────────────┐
│ Hello {{user.name}},         │
│                              │
│ Your order is ready...       │
│                              │
└──────────────────────────────┘  {]} [⤢ Expand]
```

- Multi-line input
- Expression toggle available (enables `{{...}}` syntax everywhere in text)
- Expand button → opens full-screen modal editor

### 2.7 CodeEditorField

```
Code (JavaScript)
┌──────────────────────────────────────────────────┐
│ 1  // Access input data via items                │
│ 2  const data = $input.all();                    │
│ 3  return data.map(item => ({                    │
│ 4    ...item.json,                               │
│ 5    processed: true                             │
│ 6  }));                                          │
└──────────────────────────────────────────────────┘
Language: [JavaScript ▼]  [⤢ Expand]
```

- Monaco Editor (same as VS Code)
- Language selector: JavaScript (default), Python, TypeScript, JSON, HTML, Markdown
- Line numbers, syntax highlighting, autocomplete
- Expression toggle NOT available (it's already code)
- Expand to full-screen modal

### 2.8 JSONEditorField

Like CodeEditorField but always JSON mode, with JSON validation.

### 2.9 CredentialPickerField

```
Connection
[john@gmail.com (Gmail)              ▼]
[+ Create new connection]
```

- Dropdown of existing matching credentials
- Filtered by credential type (only shows Gmail connections for Gmail nodes)
- "+" link opens CreateCredentialModal
- Error state: "No connections found — Create one →"

### 2.10 FileUploadField

```
File
[Choose file or drag & drop]
  Max 50MB • PDF, CSV, XLSX, JSON
```

- Accepts drag-and-drop
- Shows file name + size after selection
- Remove button to clear

### 2.11 DatePickerField

```
Start date
[2024-01-15                          📅]
```

- Opens calendar popover
- Also accepts manual ISO date input
- Time included if `showTime: true`

### 2.12 KeyValueField (Headers, Query Params)

```
Headers
┌──────────────────┬──────────────────┐
│ Content-Type     │ application/json  │  [✕]
│ Authorization    │ Bearer {{token}}  │  [✕]
└──────────────────┴──────────────────┘
[+ Add header]
```

- Each row: key input + value input + delete button
- Value input has expression toggle
- Row reordering via drag handle

### 2.13 FixedCollectionField

```
Attachments
─ Attachment 1 ─────────────────────── [✕]
  File: [Choose file]
  Filename: [report.pdf]
[+ Add attachment]
```

- Groups of related fields that can be repeated
- Each group has its own set of sub-fields
- Delete button per group
- "Add" button adds a new group

### 2.14 ResourceLocatorField

Used for selecting items from an external resource (e.g., Google Sheets spreadsheet):

```
Spreadsheet
● ID  ○ URL  ○ List
[                         ] [🔍 Browse]
```

- Three modes: by ID (enter ID), by URL (paste URL), by List (dropdown from API)
- Browse button: opens modal to pick from list

### 2.15 ColorPickerField

```
Color
[████ #FF5733]  [🎨]
```

- Swatch + hex input
- Click swatch or icon → opens color picker popover

---

## 3. Expression Mode

See spec 50 and spec 78 for full expression engine spec. Summary for inspector:

### 3.1 Expression Toggle

Every text/textarea/number field has a `{]}` button that toggles expression mode:

**Literal mode**: Plain text input, user types static value.
**Expression mode**: 
- Input background: `bg-pink-50` border `border-pink-200`
- Shows expression `{{...}}` syntax highlighting
- Below the input: "Preview" showing resolved value with green background
- Auto-suggestion: Type `{{` to open variable picker dropdown

### 3.2 Variable Picker Dropdown

Appears when user types `{{` or clicks variable insert button:

```
┌─ Insert Variable ─────────────────────────────────────────┐
│ 🔍 [Search variables...]                                  │
│                                                           │
│ TRIGGER INPUT                                             │
│   $json.email          "john@example.com"                │
│   $json.name           "John Smith"                      │
│                                                           │
│ PREVIOUS NODES                                            │
│ ▶ Get User (HTTP Request)                                │
│   $node["Get User"].json.id          42                  │
│   $node["Get User"].json.email       "..."               │
│                                                           │
│ ENVIRONMENT                                               │
│   $env.API_BASE_URL    "https://..."                     │
│   $env.DEBUG           false                             │
│                                                           │
│ BUILT-IN                                                  │
│   $now                 "2024-01-15T14:30:00Z"            │
│   $workflow.id         "abc-123"                         │
│   $execution.id        "def-456"                         │
└───────────────────────────────────────────────────────────┘
```

Clicking inserts `{{$json.email}}` at cursor position.

---

## 4. Params Tab by Node Type

### 4.1 HTTP Request Node

```
Method
[GET ▼]

URL *
[https://api.example.com/endpoint    {]}]

Authentication
[None ▼]
  [+ Create credential]

Headers
[+ Add header]

Query Parameters
[+ Add param]

Request Body
[None ▼] / [JSON] / [Form Data] / [Binary]
  (conditionally shown based on method)
  [JSON body editor...]

Options
  ▶ Advanced options (collapsed by default)
    Response Format: [Auto-detect ▼]
    Timeout: [10000ms]
    Follow redirects: [● On]
    SSL certificate: [● Verify]
```

### 4.2 IF Node

```
Conditions

CONDITION 1
  Value 1 *   [{{$json.status}}                    {]}]
  Operation   [equals ▼]
  Value 2 *   [active                              {]}]

  [+ Add condition to group]

[+ Add condition group]

Combine:  ● AND  ○ OR
```

### 4.3 Switch Node

```
Mode: ● Rules  ○ Expression

Rules:
─ Output 1 ──────────────────────────────── [✕]
  Value 1 [{{$json.priority}}           {]}]
  Equals  [high                         {]}]
  
─ Output 2 ──────────────────────────────── [✕]
  Value 1 [{{$json.priority}}           {|}]
  Equals  [medium                       {|}]

[+ Add rule]

Fallback output:  ● None  ○ Output 3 (default)
```

### 4.4 Code Node

```
Language
[JavaScript ▼]

Code *
[Monaco editor, full height]
// Process input data
const items = $input.all();
return items.map(item => ({
  json: { ...item.json, processed: true }
}));

Execution mode:
  ● Once for all items
  ○ Once per item
```

### 4.5 Set Node (Data Transform)

```
Mode: ● Manual  ○ Expression

Fields to set:
─ Field 1 ──────────────────────────── [✕]
  Name:  [fullName                      ]
  Value: [{{$json.firstName}} {{$json.lastName}} {|}]
  Type:  [String ▼]

[+ Add field]

Include all original fields: [● On]
```

### 4.6 Schedule Trigger Node

```
Trigger at:
  ● Specific interval
    Every [1] [Minutes ▼]
  ○ Cron expression
    [0 9 * * 1-5              ]
    ← Mon-Fri at 9am
  ○ Custom interval

Timezone: [UTC ▼]

Active: [● On]  (activates workflow when set)
```

### 4.7 Webhook Trigger Node

```
HTTP Method: [POST ▼]

Path:
/webhook/[auto-generated-slug]
[Copy URL]

Authentication:
  ○ None
  ● Basic Auth
    Username [_____________]
    Password [_____________]
  ○ Header Auth
    Header name [_____________]
    Header value [_____________]
  ○ HMAC
    Secret [_____________]
    Header: X-Signature

Response mode:
  ○ Respond immediately (200 OK)
  ● Respond when workflow completes
  ○ Use Respond node
```

### 4.8 Send Email (SMTP)

```
Connection *
[john@gmail.com (Gmail)              ▼]
[+ Create new connection]

To *
[{{$json.recipient_email}}           {|}]

Subject *
[Your order is ready                 {|}]

Message type:
  ● HTML  ○ Plain text

Body *
[HTML editor / textarea with {|}]

CC
[                                    {|}]

BCC
[                                    {|}]

Attachments
[+ Add attachment]

Reply-to
[                                    {|}]
```

### 4.9 AI LLM Node (Groq / OpenAI / Gemini)

```
Model *
[groq/llama3-70b-8192               ▼]

System prompt
[You are a helpful assistant...      ]
[⤢ Expand]

User message *
[{{$json.question}}                  {|}]
[⤢ Expand]

Options ▶
  Temperature: [0.7]  (0–2)
  Max tokens:  [2048]
  Top-p:       [1.0]
  Stream:      [○ Off ● On]
  
Memory:
  ○ None
  ● Buffer memory (last N turns): [10]
  ○ External (vector store)
```

### 4.10 Merge Node

```
Mode:
  ● Merge by index (combine item 1+item 1, 2+2...)
  ○ Append (all items from input 1, then input 2)
  ○ Wait for all (wait until both inputs have data)
  ○ Choose branch (pass through first non-empty input)

Number of inputs: [2]  (2–10)
```

### 4.11 Wait Node

```
Wait for:
  ● Time interval
    [5] [Minutes ▼]
  ○ Until specific time
    [2024-01-15 15:00                {|}]
  ○ Until webhook received
    Resume URL: [copy button]
  ○ Until form submitted
    Form URL: [copy button]

On resume:
  Continue workflow with received data: [● On]
```

---

## 5. Output Tab

### 5.1 Layout

```
┌─ Output Tab ──────────────────────────────────────────────┐
│                          [Pin] [Copy] [Schema] [Table] [JSON]│
├───────────────────────────────────────────────────────────┤
│ Item 1 of 3  ← →                                          │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ {                                                     │ │
│ │   "id": 123,                                          │ │
│ │   "email": "john@example.com",                        │ │
│ │   "name": "John Smith",                               │ │
│ │   "created_at": "2024-01-15T..."                      │ │
│ │ }                                                     │ │
│ └───────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### 5.2 View Modes

**JSON view**: Raw JSON tree. Collapsible keys. Copy individual values on click.

**Table view**: Flat key-value table. Each row: key | type | value.
```
id           number   123
email        string   "john@example.com"
name         string   "John Smith"
created_at   string   "2024-01-15T..."
```

**Schema view**: Shows inferred JSON schema (types, required fields).

### 5.3 Multi-Item Navigation

When node outputs multiple items (array):
```
← Item 2 / 7 →
```
Arrow buttons navigate between items. Keyboard: ← → arrow keys when output panel is focused.

### 5.4 Pinned Data Banner

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ Pinned data active — real execution data will differ.   │
│ [Unpin]                                                     │
└─────────────────────────────────────────────────────────────┘
```

When pinned: orange/amber background banner at top of Output tab.

### 5.5 Error State

```
┌─ Error ──────────────────────────────────────────────────┐
│ ✗ NodeExecutionError                                     │
│ HTTP 404: Not Found                                      │
│                                                          │
│ ▶ Details                                               │
│   URL: https://api.example.com/user/999                  │
│   Status: 404                                            │
│   Response: {"error": "User not found"}                  │
│                                                          │
│ ▶ Stack trace (click to expand)                          │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Settings Tab

### 6.1 Full Settings Tab Content

```
ERROR HANDLING
────────────────────────────────────────────────
On error
[Stop workflow ▼]
Options: Stop workflow | Continue | Use error output

Continue on failure
[○ Off]
When on: error is treated as success, workflow continues

Retry on failure
[○ Off]
  Max retries:       [3]
  Delay between:     [1000] ms
  Exponential back:  [○ Off]

────────────────────────────────────────────────
EXECUTION
────────────────────────────────────────────────
Execute once
[○ Off]
When on: runs once regardless of how many input items there are

Always output data
[○ Off]
When on: outputs empty array if no data (prevents downstream null)

Timeout
[10000] ms  (0 = no timeout)

────────────────────────────────────────────────
ERROR WORKFLOW
────────────────────────────────────────────────
Error workflow
[None ▼]
If set: when this node fails, the selected workflow is triggered
with error details as input.

────────────────────────────────────────────────
NOTES
────────────────────────────────────────────────
Note
[                                              ]
[                                              ]
[                                              ]
(Optional developer note about this node)

Show note in flow  [○ Off]
When on: note appears as tooltip bubble on canvas
```

### 6.2 Save Behavior

Settings tab has its own **Save** button (unlike Params which auto-saves):
```
[Save settings]  ✓ Saved
```

Reason: settings changes can affect execution behavior, so explicit save is safer.

---

## 7. Docs Tab

### 7.1 Layout

```
┌─ Docs ─────────────────────────────────────────────────┐
│ HTTP Request                           [Open in docs ↗] │
│                                                         │
│ Make HTTP/HTTPS requests to external services.         │
│                                                         │
│ PARAMETERS                                              │
│ ─────────────────────────────────────────────────────  │
│ Method      The HTTP method to use                     │
│ URL *       The target URL                             │
│ Headers     Optional request headers                   │
│ Body        Optional request body                      │
│                                                         │
│ OUTPUT                                                  │
│ ─────────────────────────────────────────────────────  │
│ body        Response body (parsed JSON or text)        │
│ statusCode  HTTP status code                           │
│ headers     Response headers                           │
│                                                         │
│ EXAMPLES                                                │
│ ─────────────────────────────────────────────────────  │
│ GET request: URL = https://api.example.com/users       │
│                                                         │
│ COMMUNITY RESOURCES                                     │
│ ─────────────────────────────────────────────────────  │
│ ● How to handle API pagination                         │
│ ● Handling authentication with OAuth                   │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Special Inspector Panels

### 8.1 Trigger Node Inspector

Trigger nodes show an additional section at top of Params tab:

```
TRIGGER STATUS
─────────────────────────────────────────────────
Workflow:  [● Active]    [Activate ▼]
Last run:  2 minutes ago  [View execution →]
Next run:  In 58 minutes  (for schedules)
```

### 8.2 AI Agent Node Inspector

Additional "Memory" and "Tools" sub-tabs within Params:

**Tools sub-tab**:
```
Connected tools (3):
● Search Knowledge Base    [Remove]
● HTTP Request             [Remove]
● Code Execution           [Remove]

[+ Add tool]
```

### 8.3 Execute Workflow Node Inspector

Shows workflow selection with preview:
```
Workflow to execute *
[Email Notifications ▼]    [Preview ↗]

Input data
[Pass trigger data ●]
  ○ Pass all data
  ● Pass specific fields
    [+ Add field mapping]

Wait for completion:  [● Yes]
  Timeout: [60] seconds
```

---

## 9. Validation Rules

### 9.1 Required Field Validation

Triggered on:
- Attempting to save workflow
- Attempting to run workflow  
- Leaving a required field empty after filling it

Visual:
```
URL *
[                                    {|}]  ← red border
⚠ URL is required
```

### 9.2 Expression Validation

When expression mode is on:
- Invalid expression syntax → orange border + preview shows "Expression error: ..."
- Missing variable → preview shows "null" (not error)
- Type mismatch → no visual error (flexible by design)

### 9.3 Save-Time Validation

Before save: check all nodes for:
1. Required fields empty → show list of incomplete nodes, highlight them on canvas
2. Credential not selected (when required) → same
3. Code node syntax errors → flag but allow save

On validation error:
```
┌─ Workflow has issues ──────────────────────────────────┐
│ ⚠ 2 nodes have missing required fields                │
│                                                        │
│ ● Send Email — "To" field is required                 │
│ ● HTTP Request — "URL" field is required              │
│                                                        │
│ [Fix later]  [Jump to first error]                     │
└────────────────────────────────────────────────────────┘
```
