---
title: "Scenarios as tools access control | MCP Server  | Make Developer Hub"
url: https://developers.make.com/mcp-server/connect-using-mcp-token/scenarios-as-tools-access-control
scraped_at: 2026-04-21T12:41:09.668002Z
---

1. Connect using MCP token

# Scenarios as tools access control

By default, the mcp:use scope of your MCP token allows AI systems to access all active and on-demand scenarios across all of your Make organizations. If you want to restrict access, append query parameters to the connection URL according to these levels:

```
mcp:use
```

- Organization
- Team
- Scenario

Organization

Team

Scenario

Scenarios must be active with on-demand scheduling to be discoverable as MCP tools.

The following applies only to scenario tools, and excludes management tools and other tool types.

### hashtag Organization level

https://<MAKE_ZONE>/mcp/u/<MCP_TOKEN>/stateless?organizationId=<id>

```
https://<MAKE_ZONE>/mcp/u/<MCP_TOKEN>/stateless?organizationId=<id>
```

The AI system can access all scenarios in any team within the specified organization.

### hashtag Team level

https://<MAKE_ZONE>/mcp/u/<MCP_TOKEN>/stateless?teamId=<id>

```
https://<MAKE_ZONE>/mcp/u/<MCP_TOKEN>/stateless?teamId=<id>
```

The AI system can access all scenarios within the specified team.

### hashtag Scenario level

https://<MAKE_ZONE>/mcp/u/<MCP_TOKEN>/stateless?scenarioId=<id>

```
https://<MAKE_ZONE>/mcp/u/<MCP_TOKEN>/stateless?scenarioId=<id>
```

The AI system can only access the specified scenario.

If you experience connection issues, you can add /stream instead of /stateless in the connection URL. For SSE, add /sse instead.

```
/stream
```

```
/stateless
```

```
/sse
```

You can also specify multiple values for each of the entities above using the following syntax: ?scenarioId[]=<id1>&scenarioId[]=<id2>

```
?scenarioId[]=<id1>&scenarioId[]=<id2>
```

You can't combine multiple levels, as levels are mutually exclusive.

Last updated 4 months ago
