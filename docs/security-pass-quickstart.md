# Security Pass Quickstart

This adds the first serious deploy and auth hardening layer for FlowHolt.

## What this means

FlowHolt now checks for practical security problems like:

- missing endpoint secrets
- weak placeholder secrets
- endpoint keys reused across multiple protected routes
- service-role key reused where it should never be reused
- missing deploy database URL for backup and migration tooling
- weak or missing active webhook integration keys
- missing baseline response security headers in production config

## What changed

1. Protected backend routes now use stronger shared-secret validation.
2. Webhook trigger auth now uses constant-time secret comparison.
3. Next.js responses now include baseline security headers.
4. Monitoring now shows a richer `Security posture` panel.
5. You can run terminal security checks with npm commands.

## Commands

From `flowholt-web`:

```bash
npm run security:check
```

This checks environment, endpoint keys, and deploy posture.

If you also want dependency audit:

```bash
npm run security:deps
```

## How to see output in UI

1. Restart `flowholt-web`
2. Open `/app/monitoring`
3. Look for the `Security posture` section

You will see:

- how many checks are ok
- how many warnings exist
- how many errors exist
- whether FlowHolt response headers are enabled
- whether active webhook integrations are missing keys or using weak keys
- which exact secret/config issue needs attention

## Easy meaning

- `security:check` = tell me if my FlowHolt secrets and deploy config are risky
- `security:deps` = also check npm packages for serious vulnerabilities
- `Security posture` panel = the same idea, visible inside the app
- webhook key warnings = your webhook URL may be too easy to guess or too open
