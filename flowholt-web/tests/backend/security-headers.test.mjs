import test from "node:test";
import assert from "node:assert/strict";

import { buildSecurityHeaders } from "../../src/lib/flowholt/security-headers.ts";

test("buildSecurityHeaders includes the baseline deploy protections", () => {
  const headers = new Map(buildSecurityHeaders().map((header) => [header.key, header.value]));

  assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("Permissions-Policy"), "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  assert.equal(headers.get("Cross-Origin-Opener-Policy"), "same-origin");
  assert.equal(headers.get("Cross-Origin-Resource-Policy"), "same-site");
  assert.equal(headers.get("Strict-Transport-Security"), "max-age=63072000; includeSubDomains; preload");
});
