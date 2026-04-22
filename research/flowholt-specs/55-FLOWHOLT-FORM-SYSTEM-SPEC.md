# FlowHolt Form System Specification

> **Status:** New file created 2026-04-17  
> **Direction:** FlowHolt adopts n8n's Form Trigger + Form node multi-step pattern, enriched with Make's mature scheduling and webhook infrastructure.  
> **Vault:** [[wiki/concepts/webhook-trigger-system]], [[wiki/concepts/studio-anatomy]]  
> **Raw sources:**  
> - n8n Form Trigger: `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.formtrigger/`  
> - n8n Form node: `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.form/`  
> - n8n Wait node (form resume): `research/n8n-docs-export/pages_markdown/integrations/builtin/core-nodes/n8n-nodes-base.wait/`  
> - Make form handling: `research/make-help-center-export/pages_markdown/webhooks.md` (webhook-as-form)  
> **See also:** `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md` | `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`  

---

## 1. Overview: Why Forms Matter

Forms are the bridge between human input and automated workflows. Three use cases:

1. **Form Trigger** — A standalone form that kicks off a workflow when submitted
2. **Mid-flow Form** — Pause execution, collect additional data from a user, resume
3. **Wait + Form Resume** — Pause for external approval with an embedded form

These cover: intake forms, approval flows, multi-step wizards, HITL review gates, data collection before processing.

---

## 2. Form Trigger Node

### Purpose

Creates a hosted form at a unique URL. Submitting the form triggers the workflow with form data as input.

### Node Configuration

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| Form title | string | Page heading | Workflow name |
| Form description | string (rich text) | Instructions above fields | Empty |
| Form fields | array of FieldDefinition | The form fields (see §3) | Empty |
| Submit button text | string | Custom button label | "Submit" |
| Respond when | enum | "Workflow receives form" / "Workflow finishes" | Receives |
| Response type | enum | "Form ending" / "Redirect URL" / "Text message" | Form ending |
| Form ending title | string | Shown after submit | "Thanks for submitting" |
| Form ending description | string | Additional text | Empty |
| Form ending redirect URL | string (expression) | Redirect after submit | None |
| Authentication | enum | "None" / "Basic Auth" / "Header Auth" / "n8n User Auth" | None |
| Allowed origins | string[] | CORS origins | `*` |
| Custom CSS | code | Override form styling | Empty |

### Form URL

```
https://app.flowholt.com/form/<workflow_id>/<form_trigger_node_id>
```

In test mode (Studio):
```
https://app.flowholt.com/form/test/<workflow_id>/<form_trigger_node_id>
```

### Output Schema

```typescript
type FormTriggerOutput = {
    json: {
        formMode: "test" | "production";
        submittedAt: string;           // ISO timestamp
        [fieldName: string]: any;       // all field values keyed by field name
    }
}
```

### Authentication Options

| Method | Config | Behavior |
|--------|--------|----------|
| None | — | Public form |
| Basic Auth | username + password | HTTP Basic Auth prompt before form loads |
| Header Auth | header name + value | Require custom header (API access) |
| FlowHolt User Auth | — | Require logged-in FlowHolt user (team/workspace member) |

---

## 3. Field Types (13+ types)

### Core Field Types

| Type | HTML Mapping | Value Type | Validation |
|------|-------------|------------|------------|
| `text` | `<input type="text">` | string | min/max length, regex pattern |
| `email` | `<input type="email">` | string | RFC 5322 |
| `number` | `<input type="number">` | number | min, max, step |
| `password` | `<input type="password">` | string | min length |
| `textarea` | `<textarea>` | string | min/max length |
| `date` | `<input type="date">` | string (ISO date) | min/max date |
| `time` | `<input type="time">` | string (HH:mm) | — |
| `datetime` | `<input type="datetime-local">` | string (ISO) | min/max datetime |
| `dropdown` | `<select>` | string | Options list |
| `file` | `<input type="file">` | BinaryData | Max size, allowed MIME types |

### Advanced Field Types

| Type | HTML Mapping | Value Type | Validation |
|------|-------------|------------|------------|
| `checkbox` | `<input type="checkbox">` | boolean | — |
| `multi_select` | `<select multiple>` (checkboxes UI) | string[] | Min/max selections |
| `url` | `<input type="url">` | string | Valid URL |
| `phone` | `<input type="tel">` | string | Phone pattern |
| `color` | `<input type="color">` | string (#hex) | — |
| `range` | `<input type="range">` | number | min, max, step |
| `hidden` | `<input type="hidden">` | string | Pre-filled, not shown |

### Field Definition Schema

```typescript
type FormFieldDefinition = {
    name: string;                   // machine-readable key
    label: string;                  // display label
    type: FieldType;                // from enum above
    required: boolean;              // validation
    placeholder?: string;           // hint text
    description?: string;           // help text below field
    default_value?: any;            // pre-filled value (supports expressions)
    options?: Array<{               // for dropdown, multi_select
        label: string;
        value: string;
    }>;
    validation?: {
        min_length?: number;
        max_length?: number;
        min?: number;
        max?: number;
        pattern?: string;           // regex
        allowed_file_types?: string[]; // MIME types for file fields
        max_file_size_mb?: number;
    };
    conditional?: {                 // show/hide based on another field
        field: string;              // name of controlling field
        operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
        value?: any;
    };
};
```

### Field UI in Studio Node Inspector

The Form Trigger node's inspector shows a visual field builder:
- Drag-and-drop to reorder fields
- Click field to expand config panel (label, type, validation, conditional logic)
- "Add field" button at bottom
- Preview button → opens form in new tab
- "Import from JSON Schema" → auto-create fields from JSON Schema

---

## 4. Form Node (Mid-Flow)

### Purpose

Pauses a running workflow, presents a form to a user, waits for submission, then continues with form data.

### How It Works

1. Workflow reaches Form node
2. Execution pauses → status: `waiting_for_form`
3. Form URL is generated and delivered to target user (via previous node: email, Slack, etc.)
4. User opens URL → sees the form with input data pre-filled where configured
5. User submits → execution resumes with form data merged into item

### Node Configuration

| Field | Type | Description |
|-------|------|-------------|
| Form fields | array of FieldDefinition | Same field types as Form Trigger |
| Form title | string | Page heading |
| Form description | string | Instructions |
| Pre-fill from input | boolean | Auto-fill fields from incoming `$json` |
| Respond when | "Form submitted" / "Workflow finishes" | When to show completion page |
| Completion message | string | Shown after form submission |
| Timeout | duration | How long to wait before expiring (default: 7 days) |
| On timeout | "Stop" / "Continue with empty" | What to do when form times out |

### Multi-Step Forms (Wizard Pattern)

Chain multiple Form nodes in sequence:

```
Form Trigger → Process Step 1 → Form Node (Step 2) → Process Step 2 → Form Node (Step 3) → Final Processing
```

Each Form node:
- Shows a step indicator (Step 2 of 4)
- Can reference previous form data via `$json`
- Has its own field definitions
- Generates a continuation URL unique to this execution

### Form Continuation URL

```
https://app.flowholt.com/form/continue/<execution_id>/<node_id>?token=<hmac_token>
```

- Token is HMAC-SHA256 signed with execution secret
- Token expires based on timeout setting
- One-time use: submitting invalidates the token

### Output Schema

```typescript
type FormNodeOutput = {
    json: {
        ...previousItemJson,           // all previous data preserved
        [fieldName: string]: any,       // new form field values merged in
        _form: {
            submittedAt: string;
            submittedBy?: string;       // user ID if authenticated
            stepNumber: number;
        }
    }
}
```

---

## 5. Wait Node — Form Resume Mode

### Purpose

The Wait node can pause execution and resume via multiple mechanisms. One of those is a form.

### Wait Resume Modes (4 total)

| Mode | Trigger to Resume | Config |
|------|-------------------|--------|
| **After time interval** | Timer expires | Duration (minutes/hours/days) |
| **At specific date/time** | Clock reaches target | DateTime (expression-supported) |
| **On webhook call** | HTTP request to resume URL | Method, auth, response |
| **On form submission** | User submits a form | Form fields (same as Form node) |

### Form Resume Mode Configuration

Same as Form node fields, but additionally:
- Resume URL is generated automatically
- Can be embedded in emails/Slack via `{{ $execution.resumeUrl }}`
- Supports authentication (Basic, Header, FlowHolt user)

---

## 6. Form Rendering Engine

### Architecture

Forms are server-rendered HTML pages hosted by the FlowHolt backend.

```
User visits form URL → Backend generates HTML → User fills form → POST to backend → Resume execution
```

### Form Page Structure

```html
<!DOCTYPE html>
<html>
<head>
    <title>{form.title} — FlowHolt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>/* FlowHolt form base styles + user custom CSS */</style>
</head>
<body>
    <div class="flowholt-form-container">
        <div class="flowholt-form-header">
            <h1>{form.title}</h1>
            <p>{form.description}</p>
            {step_indicator if multi-step}
        </div>
        <form method="POST" action="{submit_url}" enctype="multipart/form-data">
            {rendered_fields}
            <button type="submit">{submit_button_text}</button>
        </form>
        <div class="flowholt-form-footer">
            <span>Powered by FlowHolt</span>
        </div>
    </div>
    <script>/* Client-side validation + conditional field logic */</script>
</body>
</html>
```

### Custom CSS Support

Users can inject custom CSS to brand their forms:

```css
/* Example custom CSS */
.flowholt-form-container { max-width: 600px; font-family: 'Inter', sans-serif; }
.flowholt-form-header h1 { color: #1a1a2e; }
button[type="submit"] { background: #e94560; border-radius: 8px; }
```

### Responsive Design

- Forms are mobile-responsive by default
- Breakpoints: 480px (mobile), 768px (tablet), 1024px+ (desktop)
- File upload fields show drag-and-drop on desktop, file picker on mobile

---

## 7. Form Ending Pages

### Three Response Types After Submission

| Type | Behavior | Config |
|------|----------|--------|
| **Form ending** | Show a thank-you page | Title + description + optional image |
| **Redirect** | Redirect to external URL | URL (supports expressions from form data) |
| **Text message** | Show plain text response | Text string |

### Dynamic Form Ending (when respond_when = "Workflow finishes")

If configured to wait for workflow completion:
1. User submits form
2. "Processing..." loading spinner shown
3. Workflow executes to completion
4. Final node's output can be rendered in the form ending page

This enables use cases like:
- Submit a question → AI processes → show answer on same page
- Upload a file → process → show download link

---

## 8. Form Security

### CSRF Protection

- Each form page includes a CSRF token in a hidden field
- Token validated on POST
- Token tied to session (cookie-based) or form load time

### Rate Limiting

| Limit | Value | Scope |
|-------|-------|-------|
| Form submissions per form | 100/minute | Per form URL |
| File upload size | 10 MB per file (configurable) | Per field |
| Total form payload | 50 MB | Per submission |
| Form loads (GET) | 300/minute | Per form URL |

### Input Sanitization

- All text inputs HTML-escaped before storage
- File uploads scanned for MIME type mismatch (declared vs actual)
- SQL injection: parameterized queries only (standard)
- XSS: form data never rendered as raw HTML in workflow nodes

---

## 9. Form Analytics (Phase 2)

| Metric | Description |
|--------|-------------|
| Form views | Number of times form page loaded |
| Form submissions | Number of successful submissions |
| Conversion rate | Submissions / views |
| Average completion time | Time from page load to submit |
| Drop-off rate per field | Which fields cause abandonment |
| File upload stats | Average size, failure rate |

---

## 10. Database Schema

```sql
-- Form definitions (stored within workflow node parameters, but also cached for URL routing)
CREATE TABLE form_endpoints (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    node_id VARCHAR(100) NOT NULL,          -- node ID within workflow
    form_type VARCHAR(20) NOT NULL,         -- "trigger" | "mid_flow" | "wait_resume"
    url_path VARCHAR(200) UNIQUE NOT NULL,  -- unique form URL path
    authentication_type VARCHAR(20) DEFAULT 'none',
    authentication_config JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_form_endpoints_workflow_node ON form_endpoints(workflow_id, node_id);

-- Form submissions (for analytics and audit)
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY,
    form_endpoint_id UUID NOT NULL REFERENCES form_endpoints(id),
    execution_id UUID,                      -- linked execution (null for failed submissions)
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    field_count INT,
    has_files BOOLEAN DEFAULT FALSE,
    total_file_size_bytes BIGINT DEFAULT 0,
    processing_status VARCHAR(20) DEFAULT 'received'  -- received, processing, completed, failed
);

-- Pending form continuations (for mid-flow forms and wait+form)
CREATE TABLE form_continuations (
    id UUID PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES executions(id),
    node_id VARCHAR(100) NOT NULL,
    form_endpoint_id UUID REFERENCES form_endpoints(id),
    token_hash VARCHAR(64) NOT NULL,        -- HMAC token hash
    fields_schema JSONB NOT NULL,           -- form field definitions
    prefill_data JSONB,                     -- pre-filled values from workflow
    expires_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,               -- null until submitted
    status VARCHAR(20) DEFAULT 'pending'    -- pending, submitted, expired, cancelled
);

CREATE INDEX idx_form_continuations_token ON form_continuations(token_hash) WHERE status = 'pending';
```

---

## 11. Implementation Phases

### Phase 1 — Form Trigger

- [ ] Form Trigger node type in node registry
- [ ] Form field definition schema and validation
- [ ] 10 core field types (text, email, number, password, textarea, date, time, datetime, dropdown, file)
- [ ] Form rendering engine (server-side HTML generation)
- [ ] Form URL routing (`/form/<workflow_id>/<node_id>`)
- [ ] Form POST handler → inject data into workflow trigger
- [ ] Basic form ending page (thank-you message)
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Form test mode in Studio

### Phase 2 — Mid-Flow Forms + Multi-Step

- [ ] Form node (mid-flow pause/resume)
- [ ] Form continuation URL generation and validation
- [ ] Multi-step form wizard (step indicator, back navigation)
- [ ] Wait node form resume mode
- [ ] Pre-fill from input data
- [ ] Conditional field visibility
- [ ] Advanced field types (multi_select, url, phone, color, range, hidden)
- [ ] Custom CSS injection
- [ ] Form authentication (Basic, Header, FlowHolt User)
- [ ] Dynamic form ending (wait for workflow completion)

### Phase 3 — Polish + Analytics

- [ ] Form analytics dashboard
- [ ] Import from JSON Schema
- [ ] Form templates (common patterns)
- [ ] Form embedding (iframe snippet)
- [ ] Redirect with expression data
- [ ] File upload to S3 binary storage
- [ ] "Powered by FlowHolt" branding removal (paid plans)

---

## Related Files

- `42-FLOWHOLT-WEBHOOK-AND-TRIGGER-SYSTEM-SPEC.md` — webhook infrastructure (forms build on this)
- `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` — Form Trigger listed as gap
- `27-FLOWHOLT-NODE-TYPE-FIELD-INVENTORY.md` — node field definitions
- `44-FLOWHOLT-ERROR-HANDLING-AND-RESILIENCE-SPEC.md` — form timeout handling
- [[wiki/concepts/webhook-trigger-system]] — trigger system vault page
- [[wiki/concepts/studio-anatomy]] — inspector UI for form field builder
