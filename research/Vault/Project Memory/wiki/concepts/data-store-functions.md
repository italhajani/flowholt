---
title: Data Stores and Custom Functions
type: concept
tags: [data-stores, variables, custom-functions, expressions, data-structures]
sources: [plan-file-45, make-pdf, make-help-center]
updated: 2026-04-16
---

# Data Stores and Custom Functions

Persistent state management and reusable logic within FlowHolt workflows.

---

## Data Stores

Key-value stores with schema enforcement. Adopted from [[wiki/entities/make]].

| Parameter | Value |
|-----------|-------|
| Storage | 1 MB per 1,000 operations |
| Max record size | 15 MB |
| ACID support | Yes (for data store and DB connector nodes) |
| Module types | 8 (get, set, delete, list, search, count, upsert, aggregate) |

**`supports_acid: bool`** on `NodeTypeDefinition` — only data store and database connector nodes get rollback.

**Environment scoping:** data stores are isolated per environment (shared / staging / production).

### Data Structures
- JSON schema generator (make a structure from a sample)
- Strict mode: reject payloads that don't match schema

---

## Variables (4 Types)

| Type | Scope | Persisted | Encrypted |
|------|-------|-----------|----------|
| System | Platform | — | n/a |
| Workflow | Single run | No | n/a |
| Custom | Org / team / workspace | Yes | Optional (`is_secret`) |
| Incremental | Workflow | Yes (counter) | No |

**FlowHolt improvement over Make:** custom variables support `is_secret: true` → encrypted at rest. Make stores all custom variables in plaintext.

---

## Custom Functions

JavaScript (ES6) functions that can be called from expressions.

| Constraint | Value |
|-----------|-------|
| Timeout | 300ms |
| Max length | 5,000 characters |
| Async/HTTP | Not allowed |
| Plan gate | Teams / Enterprise |
| Debug console | Yes (Teams / Enterprise) |
| Version history | Yes |

---

## Expression Language

Uses `{{ }}` template syntax. 7 built-in function categories:
1. String functions
2. Math functions
3. Date/time functions
4. Array functions
5. Object functions
6. Conversion functions
7. Regex functions

Custom functions extend the expression language at the workflow level.

---

## Related Pages

- [[wiki/concepts/execution-model]] — ACID rollback depends on data store node type
- [[wiki/concepts/backend-architecture]] — vault domain owns data stores
- [[wiki/concepts/connections-integrations]] — variables as a vault asset type
- [[wiki/concepts/expression-language]] — custom functions extend the expression language
- [[wiki/concepts/runtime-operations]] — data store ACID rollback on execution errors
- [[wiki/entities/make]] — source of data store and variable model
- [[wiki/sources/flowholt-plans]] — plan file 45
