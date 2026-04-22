# FlowHolt Template System and Marketplace Specification

> **Status:** New file created 2026-04-17  
> **Direction:** FlowHolt combines Make's guided setup wizard with n8n's template API and community nodes model, adding a creator program and template analytics.  
> **Vault:** [[wiki/concepts/studio-anatomy]], [[wiki/concepts/connections-integrations]]  
> **Raw sources:**  
> - Make templates: `research/make-help-center-export/pages_markdown/scenario-templates.md`, `create-and-manage-scenario-templates.md`  
> - Make PDF: `research/make-pdf-full.txt` §Templates  
> - n8n templates: `research/n8n-docs-export/pages_markdown/workflows__templates.md`  
> - n8n sharing: `research/n8n-docs-export/pages_markdown/workflows__sharing.md`  
> - n8n community nodes: `research/n8n-docs-export/pages_markdown/integrations__community-nodes/` (all pages)  
> **See also:** `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` | `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md`  

---

## 1. Overview: Three Template Systems

FlowHolt's template ecosystem has three layers:

| Layer | What | Who Creates | Who Uses |
|-------|------|-------------|----------|
| **Official Templates** | Curated by FlowHolt team | FlowHolt staff | All users |
| **Community Templates** | Published by users | Any user (Pro+) | All users |
| **Team Templates** | Private to a team | Team members | Team members |

Additionally, a **Community Nodes** system (Phase 3+) allows third-party node packages.

---

## 2. Template Data Model

### Template Definition

```python
class WorkflowTemplate:
    id: str                             # UUID
    name: str                           # "Sync Shopify Orders to Google Sheets"
    slug: str                           # URL-friendly: "sync-shopify-orders-google-sheets"
    description: str                    # Rich text, max 2000 chars
    short_description: str              # Max 240 chars, for cards/previews
    category_id: str                    # Primary category
    tags: list[str]                     # ["e-commerce", "sync", "shopify", "sheets"]
    
    # Content
    workflow_definition: dict           # Full workflow JSON (nodes, connections, settings)
    setup_wizard: list[WizardStep]      # Guided setup steps (see §4)
    thumbnail_url: str                  # Preview image
    screenshots: list[str]             # Additional screenshots
    
    # Metadata
    author_id: str                      # Creator user ID
    author_name: str                    # Display name
    author_verified: bool               # Verified creator badge
    template_type: str                  # "official" | "community" | "team"
    visibility: str                     # "public" | "team" | "draft"
    
    # Stats
    total_uses: int                     # How many times instantiated
    total_views: int                    # Page views
    recent_uses_30d: int                # Uses in last 30 days
    rating_average: float               # 1-5 star rating
    rating_count: int                   # Number of ratings
    
    # Integration metadata
    node_types_used: list[str]          # ["http_request", "google_sheets", "shopify"]
    integration_count: int              # Number of distinct integrations
    node_count: int                     # Total nodes in workflow
    
    # Lifecycle
    version: int                        # Increments on update
    published_at: datetime
    updated_at: datetime
    created_at: datetime
    review_status: str                  # "draft" | "pending_review" | "approved" | "rejected"
    review_notes: str                   # Feedback from reviewers
```

### Template Categories

| Category | Description | Example Templates |
|----------|-------------|-------------------|
| Sales & CRM | Lead management, pipeline sync | "Sync HubSpot contacts to Salesforce" |
| Marketing | Campaign automation, social posting | "Auto-post blog to Twitter + LinkedIn" |
| E-commerce | Order processing, inventory sync | "Sync Shopify orders to Airtable" |
| IT & DevOps | Monitoring, deployment, alerting | "Slack alert on GitHub PR review requested" |
| HR & Recruiting | Onboarding, candidate tracking | "New employee onboarding workflow" |
| Finance | Invoicing, expense tracking | "Auto-generate QuickBooks invoice from form" |
| Productivity | Task management, email automation | "Gmail attachment → Google Drive + Slack" |
| Data & Analytics | ETL, reporting, data sync | "Daily report from PostgreSQL to Slack" |
| AI & Automation | LLM workflows, AI agents | "Customer support chatbot with RAG" |
| Custom | User-defined categories | — |

### Template Collections

Curated groups of templates for specific use cases:

```python
class TemplateCollection:
    id: str
    name: str                   # "Getting Started with FlowHolt"
    description: str
    template_ids: list[str]     # Ordered list of templates
    rank: int                   # Display order
    image_url: str              # Collection cover image
    created_at: datetime
```

---

## 3. Template Discovery

### Template Library Page

```
Route: /templates
```

**Layout:**
- Search bar with auto-suggest (by name, integration, category)
- Category filter sidebar (or horizontal tabs on mobile)
- Sort: Popular / Recent / Highest Rated / Most Used
- Template cards in grid layout

**Template Card:**
```
┌─────────────────────────────────┐
│  [Thumbnail / Integration Icons] │
│                                  │
│  Sync Shopify → Google Sheets    │
│  ★★★★☆ (4.2)  •  1,234 uses     │
│                                  │
│  Auto-sync new Shopify orders    │
│  to a Google Sheets spreadsheet  │
│                                  │
│  [Shopify icon] [Sheets icon]    │
│  [Use Template]                  │
└─────────────────────────────────┘
```

### Template Detail Page

```
Route: /templates/:slug
```

**Sections:**
1. Header: name, author (with verified badge), rating, use count, category
2. Description (rich text with screenshots)
3. Workflow preview (read-only canvas rendering)
4. Node list with integration icons
5. Setup requirements (what connections needed)
6. "Use this template" CTA button
7. Related templates
8. Reviews/ratings section

### Search API

```
GET /api/v1/templates/search
    ?q=shopify+sheets
    &category=e-commerce
    &sort=popular
    &page=1
    &per_page=20
```

Response includes template cards with metadata, paginated.

### Template Library in Studio

Templates also accessible from Studio:
- "Start from template" button on new workflow creation
- Template browser modal inside Studio
- Search and filter without leaving the editor

---

## 4. Setup Wizard (from Make patterns)

### Purpose

When a user instantiates a template, a guided wizard walks them through configuration — connecting accounts, setting parameters, customizing values.

### Wizard Step Definition

```python
class WizardStep:
    step_number: int
    title: str                      # "Connect your Shopify store"
    description: str                # Instructions for this step
    fields: list[WizardField]       # Fields to configure
    
class WizardField:
    node_id: str                    # Which node this field belongs to
    field_name: str                 # Parameter name in node config
    label: str                      # Display label
    help_text: str                  # Description shown in wizard
    field_type: str                 # "connection" | "text" | "number" | "dropdown" | "expression"
    required: bool
    default_value: any              # Suggested value (user can override)
    show_in_wizard: bool            # Template creator controls visibility
```

### Wizard Flow

1. User clicks "Use this template"
2. Workflow created in draft state with template definition
3. Wizard opens with Step 1 (typically: connect required accounts)
4. User completes each step → field values saved to workflow
5. Status indicators per field:
   - ✅ Configured and saved
   - ⭐ Configured but unsaved
   - ❗ Invalid or missing required value
   - ⚪ Not yet opened
6. "Skip wizard" option → go straight to Studio editor
7. On completion → workflow opens in Studio, ready to activate

### What Templates Include vs Exclude

| Included | Excluded (user must provide) |
|----------|------------------------------|
| All nodes and connections (graph) | Credentials / API keys |
| Node configurations and mappings | Connection authentication |
| Expressions and data transforms | Environment-specific values |
| Error handlers | Data store references |
| Notes and documentation | Sub-workflow references |
| Pinned test data (optional) | Secrets and passwords |

---

## 5. Template Creation

### Who Can Create Templates

| Plan | Team Templates | Community Templates |
|------|---------------|-------------------|
| Free | ❌ | ❌ |
| Core | ✅ (up to 5) | ❌ |
| Pro | ✅ (unlimited) | ✅ (submit for review) |
| Teams | ✅ (unlimited) | ✅ (submit for review) |
| Enterprise | ✅ (unlimited) | ✅ (submit for review) |

### Creation Flow

1. Build and test the workflow in Studio
2. Click "Save as Template" in workflow menu
3. Template editor opens:
   - Edit name, description, short description
   - Select category and tags
   - Upload thumbnail and screenshots
   - Configure wizard steps (mark fields as "show in wizard", set defaults, add help text)
   - Set visibility: Team (private) or Draft (preparing for community)
4. Save → template created

### Template Editor UI

```
Route: /workspace/:id/templates/:template_id/edit
```

**Sections:**
- **Info tab:** Name, description, category, tags, images
- **Wizard tab:** Drag-and-drop step builder. For each node, toggle which fields appear in wizard.
- **Preview tab:** See what users will experience (wizard + detail page)
- **Settings tab:** Visibility, version notes

### Template from Existing Workflow

The template inherits the workflow definition at save time. Subsequent edits to the source workflow do NOT auto-update the template. The template is a snapshot.

To update: edit the template's workflow definition in the template editor, or "Re-import from workflow" to snapshot the latest version.

---

## 6. Publishing and Review

### Publishing Lifecycle

```
Draft → Published (team-only) → Submitted for Review → Approved (public) / Rejected
```

| State | Visibility | Actions Available |
|-------|-----------|-------------------|
| Draft | Only creator | Edit, delete, preview |
| Published (team) | Team members | Share via link, edit, unpublish, submit for review |
| Pending Review | Team members (no public) | View status, withdraw submission |
| Approved (public) | All users | View stats, edit (requires re-review), unpublish |
| Rejected | Only creator | View review notes, edit, resubmit |

### Review Process

1. Creator clicks "Submit for public review"
2. Template enters review queue
3. FlowHolt reviewers check:
   - Quality: does it work? Are connections properly configured?
   - Completeness: wizard steps, description, screenshots
   - Naming: clear, descriptive, no spam
   - Originality: not a duplicate of existing public template
   - Security: no hardcoded secrets, no malicious patterns
4. Approved → appears in public template library
5. Rejected → creator gets feedback notes, can edit and resubmit

### Public Link Sharing

Published templates (team or public) get a shareable link:

```
https://app.flowholt.com/templates/:slug
```

- Anyone with the link can view the template detail page
- "Use this template" requires login (prompts signup if not logged in)
- Template is cloned into user's workspace as a new draft workflow
- Unpublishing deactivates the link (returns 404)

---

## 7. Template Versioning

### Version Model

```python
class TemplateVersion:
    template_id: str
    version: int                # Auto-incremented
    workflow_definition: dict   # Snapshot at this version
    wizard_steps: list[dict]    # Wizard config at this version
    changelog: str              # What changed
    created_at: datetime
    published: bool             # Whether this version was ever public
```

### Version Rules

- Every save creates a new version
- Public templates show the latest approved version
- Users who previously used an older version are NOT auto-updated (their workflow is independent)
- Version history viewable by template creator
- Rollback to previous version available

---

## 8. Template Analytics (Creator Dashboard)

### Route: `/workspace/:id/templates/:template_id/analytics`

| Metric | Description |
|--------|-------------|
| Total views | Detail page views |
| Total uses | "Use this template" clicks |
| Conversion rate | Uses / Views |
| Active workflows | How many created workflows are currently active |
| Average rating | 1-5 stars |
| Rating distribution | Histogram |
| Geographic breakdown | Country-level |
| Trend charts | Views and uses over time (30d, 90d, 1y) |
| Referral sources | Where users found the template (search, category, direct link, collection) |

### Global Analytics (FlowHolt Admin)

- Most popular templates (by uses, views, rating)
- Category popularity trends
- Template quality scores (automated: has wizard, has screenshots, has description > 100 chars)
- Review queue size and average review time
- Creator leaderboard

---

## 9. Ratings and Reviews

### Rating System

- 1-5 star rating (required to submit review)
- Text review (optional, max 500 chars)
- Only users who have used the template can rate
- One rating per user per template (editable)
- Reviews visible on template detail page
- Creator can respond to reviews

### Review Moderation

- Automated: flag reviews with profanity or spam patterns
- Manual: FlowHolt team reviews flagged content
- Creator can report inappropriate reviews

---

## 10. Community Nodes (Phase 3+)

### Purpose

Allow third-party developers to create custom node types installable by FlowHolt users.

### Community Node Package Structure

```
flowholt-nodes-<package-name>/
├── package.json          # name, version, flowholt.nodes, flowholt.credentials
├── nodes/
│   ├── MyNode/
│   │   ├── MyNode.node.ts     # Node implementation
│   │   ├── MyNode.icon.svg    # Node icon
│   │   └── MyNode.json        # Node description/schema
│   └── ...
├── credentials/
│   ├── MyApi.credentials.ts   # Credential type
│   └── ...
├── README.md
└── LICENSE
```

### Package Requirements

| Requirement | Detail |
|-------------|--------|
| Naming convention | `flowholt-nodes-*` or `@scope/flowholt-nodes-*` |
| npm keyword | `flowholt-community-node-package` |
| Scaffold tool | `npx create-flowholt-node` (CLI tool) |
| Publishing | Must use GitHub Actions with provenance statement |
| Icon | SVG, 60x60px, within brand guidelines |
| Documentation | README with setup instructions, example use cases |
| License | MIT or Apache 2.0 required |

### Verification Program

| Tier | Badge | Requirements | Discovery |
|------|-------|-------------|-----------|
| **Unverified** | None | Published on npm | Manual install only (self-hosted) |
| **Verified** | ✅ badge | Submitted via Creator Portal, passes review | Visible in Studio node panel |
| **Featured** | ⭐ badge | High quality, popular, actively maintained | Promoted in node discovery |

### Verification Review Criteria

1. **Security:** No filesystem access, no network calls outside declared integrations, no credential leaks
2. **Quality:** Proper error handling, input validation, TypeScript types
3. **UX:** Follows FlowHolt node design guidelines (icon, field layout, descriptions)
4. **Documentation:** README, parameter descriptions, example workflows
5. **Maintenance:** Responsive to issues, regular updates

### Community Node Installation

**Cloud users (Pro+):**
- Browse verified nodes in Studio → Node Panel → "Community" tab
- Click "Install" → node available immediately
- Workspace admin permission required

**Self-hosted users:**
- Settings → Community Nodes → Install
- Enter npm package name (+ optional version)
- Or: CLI installation via `flowholt-cli install-node <package>`

### Community Node Security Model

| Risk | Mitigation |
|------|-----------|
| Malicious code execution | Verification program + sandbox (community nodes run in isolated context) |
| Credential theft | Nodes cannot access raw credential values, only authenticated API clients |
| Data exfiltration | Network allowlist: community nodes can only call declared API endpoints |
| Supply chain attack | Provenance requirement (GitHub Actions only), npm package signing |
| Abandonment | Auto-flag nodes with no update in 12 months, warn users on install |

### Creator Portal

```
Route: https://creators.flowholt.com
```

- Submit nodes for verification
- View submission status
- Access developer documentation
- View install analytics
- Manage published nodes (update, deprecate)

---

## 11. Database Schema

```sql
-- Templates
CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(240),
    category_id UUID REFERENCES template_categories(id),
    tags TEXT[],
    
    -- Content
    workflow_definition JSONB NOT NULL,
    setup_wizard JSONB,                     -- WizardStep[] as JSON
    thumbnail_url TEXT,
    screenshots TEXT[],
    
    -- Author
    author_id UUID NOT NULL REFERENCES users(id),
    template_type VARCHAR(20) NOT NULL,     -- "official", "community", "team"
    visibility VARCHAR(20) DEFAULT 'draft', -- "draft", "team", "public"
    team_id UUID REFERENCES teams(id),      -- for team templates
    
    -- Stats (denormalized for performance)
    total_uses INT DEFAULT 0,
    total_views INT DEFAULT 0,
    rating_average FLOAT DEFAULT 0,
    rating_count INT DEFAULT 0,
    
    -- Integration metadata (denormalized)
    node_types_used TEXT[],
    node_count INT DEFAULT 0,
    
    -- Lifecycle
    version INT DEFAULT 1,
    review_status VARCHAR(20) DEFAULT 'draft',
    review_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_slug ON workflow_templates(slug);
CREATE INDEX idx_templates_category ON workflow_templates(category_id) WHERE visibility = 'public';
CREATE INDEX idx_templates_popular ON workflow_templates(total_uses DESC) WHERE visibility = 'public';
CREATE INDEX idx_templates_team ON workflow_templates(team_id) WHERE template_type = 'team';

-- Template categories
CREATE TABLE template_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),                       -- icon name or emoji
    sort_order INT DEFAULT 0
);

-- Template collections
CREATE TABLE template_collections (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    rank INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE template_collection_items (
    collection_id UUID REFERENCES template_collections(id),
    template_id UUID REFERENCES workflow_templates(id),
    sort_order INT DEFAULT 0,
    PRIMARY KEY (collection_id, template_id)
);

-- Template versions
CREATE TABLE template_versions (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES workflow_templates(id),
    version INT NOT NULL,
    workflow_definition JSONB NOT NULL,
    wizard_steps JSONB,
    changelog TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (template_id, version)
);

-- Template ratings/reviews
CREATE TABLE template_ratings (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES workflow_templates(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    creator_response TEXT,
    flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (template_id, user_id)
);

CREATE INDEX idx_ratings_template ON template_ratings(template_id);

-- Template usage tracking
CREATE TABLE template_usage (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES workflow_templates(id),
    user_id UUID NOT NULL REFERENCES users(id),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    workflow_id UUID REFERENCES workflows(id),  -- the created workflow
    used_at TIMESTAMPTZ DEFAULT NOW(),
    wizard_completed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_template_usage_template ON template_usage(template_id, used_at DESC);

-- Community nodes
CREATE TABLE community_node_packages (
    id UUID PRIMARY KEY,
    npm_package_name VARCHAR(200) UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    author_id UUID REFERENCES users(id),
    author_name TEXT,
    version VARCHAR(50) NOT NULL,           -- current version
    icon_url TEXT,
    readme_html TEXT,
    license VARCHAR(50),
    
    -- Verification
    verification_tier VARCHAR(20) DEFAULT 'unverified',  -- "unverified", "verified", "featured"
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    
    -- Stats
    total_installs INT DEFAULT 0,
    active_installs INT DEFAULT 0,
    
    -- Metadata
    node_types TEXT[],                      -- node type IDs provided by this package
    credential_types TEXT[],                -- credential types provided
    
    -- Lifecycle
    last_updated_at TIMESTAMPTZ,
    deprecated BOOLEAN DEFAULT FALSE,
    deprecation_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace community node installations
CREATE TABLE community_node_installations (
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    package_id UUID NOT NULL REFERENCES community_node_packages(id),
    installed_version VARCHAR(50) NOT NULL,
    installed_by UUID NOT NULL REFERENCES users(id),
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (workspace_id, package_id)
);
```

---

## 12. API Endpoints

### Template API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/templates/search` | Search public templates | Optional |
| GET | `/api/v1/templates/categories` | List categories | Public |
| GET | `/api/v1/templates/collections` | List collections | Public |
| GET | `/api/v1/templates/:slug` | Template detail (metadata + preview) | Optional |
| GET | `/api/v1/templates/:slug/workflow` | Template workflow definition (for import) | Required |
| POST | `/api/v1/templates/:slug/use` | Instantiate template as workflow | Required |
| POST | `/api/v1/templates` | Create template | Required (Pro+) |
| PUT | `/api/v1/templates/:id` | Update template | Required (owner) |
| DELETE | `/api/v1/templates/:id` | Delete template | Required (owner) |
| POST | `/api/v1/templates/:id/publish` | Publish (team visibility) | Required (owner) |
| POST | `/api/v1/templates/:id/unpublish` | Unpublish | Required (owner) |
| POST | `/api/v1/templates/:id/submit-review` | Submit for public review | Required (owner) |
| POST | `/api/v1/templates/:id/rate` | Rate/review | Required (used it) |
| GET | `/api/v1/templates/:id/analytics` | Creator analytics | Required (owner) |

### Community Node API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/community-nodes/search` | Search verified nodes | Required |
| GET | `/api/v1/community-nodes/:package` | Package detail | Required |
| POST | `/api/v1/community-nodes/install` | Install in workspace | Required (admin) |
| DELETE | `/api/v1/community-nodes/:package` | Uninstall from workspace | Required (admin) |
| PUT | `/api/v1/community-nodes/:package/update` | Update to latest version | Required (admin) |

---

## 13. Implementation Phases

### Phase 1 — Team Templates

- [ ] Template data model and database schema
- [ ] "Save as template" from workflow menu
- [ ] Template editor (info, wizard builder, preview)
- [ ] Team template library page
- [ ] Template instantiation (clone to new workflow)
- [ ] Basic setup wizard (connection fields + text fields)
- [ ] Template search (name, integration)

### Phase 2 — Public Templates + Marketplace

- [ ] Template categories and collections
- [ ] Public template library page (`/templates`)
- [ ] Template detail page with canvas preview
- [ ] Publishing and review workflow
- [ ] Review queue admin interface
- [ ] Template rating and review system
- [ ] Template sharing via public link
- [ ] Template analytics (creator dashboard)
- [ ] Official templates (created by FlowHolt team)
- [ ] Template search API (public)

### Phase 3 — Community Nodes

- [ ] Community node package specification
- [ ] `npx create-flowholt-node` CLI scaffold tool
- [ ] Community node installation (admin UI)
- [ ] Node sandbox for community nodes (isolated execution context)
- [ ] Creator Portal (submit, manage, analytics)
- [ ] Verification program and review process
- [ ] Community nodes in Studio node panel
- [ ] Version management and update notifications
- [ ] Security: network allowlist, credential isolation, provenance verification

### Phase 4 — Advanced

- [ ] Template versioning and version history
- [ ] "Inspired by" / fork tracking
- [ ] Creator program (revenue sharing for popular templates)
- [ ] Template A/B testing (different wizards)
- [ ] Auto-generated templates from AI ("describe what you want to automate")
- [ ] Template embedding (iframe for partner sites)
- [ ] Featured template program with promotion

---

## Related Files

- `40-FLOWHOLT-FRONTEND-ROUTE-AND-PAGE-INVENTORY.md` — template library routes
- `51-FLOWHOLT-NODE-TYPE-INVENTORY-AND-GAPS.md` — node types used in templates
- `46-FLOWHOLT-INTEGRATION-AND-CONNECTION-MANAGEMENT-SPEC.md` — connection handling in wizard
- `49-FLOWHOLT-N8N-INTEGRATION-SYNTHESIS.md` — Domain 10: community nodes decision
- `57-FLOWHOLT-BILLING-AND-PLAN-MANAGEMENT-SPEC.md` — plan gates for template creation
- [[wiki/concepts/studio-anatomy]] — Studio integration
- [[wiki/concepts/connections-integrations]] — connection setup in wizard
