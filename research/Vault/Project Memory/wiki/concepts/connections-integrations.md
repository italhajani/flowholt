---
title: Connections and Integrations
type: concept
tags: [connections, integrations, oauth2, vault, credentials, dynamic-connections]
sources: [plan-file-46]
updated: 2026-04-16
---

# Connections and Integrations

How FlowHolt manages credentials, connections, and integration access. Vault-based model with environment scoping.

---

## Connection Model

All connections live in the **Vault** — a scoped asset store:
- Credentials stored encrypted
- Environment-scoped: workspace / staging / production bindings
- Health checks: periodic verification with state tracking
- Access control: visibility levels (private / team / workspace)

---

## OAuth2 Flow

FlowHolt already has OAuth2 infrastructure:
1. User initiates connection from Vault or Studio
2. Redirect to provider OAuth2 endpoint
3. Token exchange handled by `backend/app/oauth2.py`
4. Tokens stored encrypted in vault

**Token refresh:** automatic background refresh before expiry.

---

## Credential Requests (Enterprise)

Enables secure cross-team credential collection without exposing secrets:
1. Builder creates a credential request template
2. Sends request link to credential owner
3. Owner fills in secrets via secure form
4. Builder's workflow uses the credential without ever seeing it

---

## Dynamic Connections (Enterprise)

Per-run connection switching via workflow inputs:
- Connection resolved at run time from input value
- Useful for multi-tenant scenarios (run workflow as user X with user X's credentials)

---

## Integration Registry

Currently 13+ integrations in `backend/app/integration_registry.py`.

**Planned additions:**
- On-premise agent (for connecting to internal systems behind firewall)
- Keys and certificates management (PGP, SSH keys, TLS certs)
- Bulk connection replacement (replace one credential across all workflows)

---

## Circuit Breakers

Per-integration, per-workspace — see [[wiki/concepts/error-handling]].

---

## Related Pages

- [[wiki/concepts/environment-deployment]] — environment-scoped connection bindings
- [[wiki/concepts/error-handling]] — circuit breakers
- [[wiki/concepts/permissions-governance]] — vault asset capabilities
- [[wiki/concepts/settings-catalog]] — connection settings inherit through scope levels
- [[wiki/concepts/ai-agents]] — MCP tool connections
- [[wiki/entities/flowholt]] — current vault implementation
- [[wiki/sources/flowholt-plans]] — plan file 46
