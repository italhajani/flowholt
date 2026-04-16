/**
 * Automated Make.com editor crawler.
 *
 * This script is meant for exploratory reverse-engineering of the editor UI:
 * it captures screenshots, DOM summaries, interactive elements, overlays,
 * nested state transitions, and interesting network traffic.
 */

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { chromium } from "@playwright/test";

const DEFAULTS = {
  url: null,
  browser: "chrome",
  outDir: path.resolve("research", "make-ui-exploration"),
  profileDir: path.resolve(".playwright", "make-ui-profile"),
  profileDirectory: null,
  cloneFromBrowserProfile: null,
  cloneFromChromeProfile: null,
  cdpUrl: null,
  replayPath: null,
  replayOnly: false,
  autoStart: false,
  settleMs: 1200,
  maxDepth: 3,
  maxInteractions: 240,
  maxElementsPerState: 40,
  viewport: { width: 1600, height: 1000 },
};

const SAFE_CLOSE_KEYS = ["Escape", "Escape"];
const RESPONSE_PREVIEW_LIMIT = 2500;
const NETWORK_PATTERNS = ["/api/", "/graphql", "/v2/", "/rpc/", "/socket", "/ws"];
const SKIP_PATTERNS = [
  /delete/i,
  /remove/i,
  /erase/i,
  /clear all/i,
  /disconnect/i,
  /deactivate/i,
  /disable/i,
  /reset/i,
  /revoke/i,
  /unlink/i,
  /logout/i,
  /log out/i,
  /sign out/i,
  /permanently/i,
  /discard/i,
  /cancel subscription/i,
  /stop scenario/i,
  /turn off/i,
];

function printHelp() {
  console.log(`Automated Make.com editor crawler

Usage:
  node scripts/explore-make-editor-v2.mjs --url <editor-url> [options]

Options:
  --url <url>                        Make scenario editor URL (required)
  --browser <chrome|edge>            Browser profile family to use
  --out <dir>                        Output directory
  --profile-dir <dir>                Playwright profile directory
  --profile-directory <name>         Browser profile name such as "Profile 2"
  --clone-from-browser-profile <n>   Clone a real browser profile for auth
  --clone-from-chrome-profile <n>    Alias for --browser chrome --clone-from-browser-profile
  --clone-from-edge-profile <n>      Alias for --browser edge --clone-from-browser-profile
  --cdp-url <url>                    Connect to an already-running browser via CDP
  --replay-path <file>               Replay a saved replay-path.json before exploring
  --replay-only                      Replay the path and stop after capturing that state
  --auto-start                       Skip the terminal confirmation prompt
  --settle-ms <ms>                   Delay after interactions (default: 1200)
  --max-depth <n>                    Recursive depth for nested UI states
  --max-interactions <n>             Total click budget
  --max-elements-per-state <n>       Cap interactions per state
  --help                             Show this message
`);
}

function parseArgs(argv) {
  const options = { ...DEFAULTS };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
    if (arg === "--url") {
      options.url = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--browser") {
      options.browser = String(argv[index + 1] || DEFAULTS.browser).toLowerCase();
      index += 1;
      continue;
    }
    if (arg === "--out") {
      options.outDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--profile-dir") {
      options.profileDir = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--profile-directory") {
      options.profileDirectory = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--clone-from-browser-profile") {
      options.cloneFromBrowserProfile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--clone-from-chrome-profile") {
      options.browser = "chrome";
      options.cloneFromBrowserProfile = argv[index + 1];
      options.cloneFromChromeProfile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--clone-from-edge-profile") {
      options.browser = "edge";
      options.cloneFromBrowserProfile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--cdp-url") {
      options.cdpUrl = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--replay-path") {
      options.replayPath = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--replay-only") {
      options.replayOnly = true;
      continue;
    }
    if (arg === "--auto-start") {
      options.autoStart = true;
      continue;
    }
    if (arg === "--settle-ms") {
      options.settleMs = Number(argv[index + 1]) || DEFAULTS.settleMs;
      index += 1;
      continue;
    }
    if (arg === "--max-depth") {
      options.maxDepth = Number(argv[index + 1]) || DEFAULTS.maxDepth;
      index += 1;
      continue;
    }
    if (arg === "--max-interactions") {
      options.maxInteractions = Number(argv[index + 1]) || DEFAULTS.maxInteractions;
      index += 1;
      continue;
    }
    if (arg === "--max-elements-per-state") {
      options.maxElementsPerState = Number(argv[index + 1]) || DEFAULTS.maxElementsPerState;
      index += 1;
    }
  }
  return options;
}

async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(targetPath, value) {
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slug(value) {
  return normalizeText(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function hashValue(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 16);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function getBrowserPaths(browser) {
  const localAppData = process.env.LOCALAPPDATA || "";
  if (browser === "edge") {
    return {
      displayName: "Edge",
      userDataDir: path.join(localAppData, "Microsoft", "Edge", "User Data"),
    };
  }
  return {
    displayName: "Chrome",
    userDataDir: path.join(localAppData, "Google", "Chrome", "User Data"),
  };
}

function getPlaywrightLaunchOptions(browser) {
  if (browser === "edge") {
    return { channel: "msedge" };
  }
  if (browser === "chrome") {
    return { channel: "chrome" };
  }
  return {};
}

function canonicalizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const pathname = parsed.pathname
      .replace(/\b\d+\b/g, ":id")
      .replace(/[0-9a-f]{8,}/gi, ":token");
    return `${parsed.origin}${pathname}${parsed.search ? "?query" : ""}${parsed.hash ? "#hash" : ""}`;
  } catch {
    return rawUrl;
  }
}

function isInterestingNetworkUrl(url) {
  return NETWORK_PATTERNS.some((pattern) => url.includes(pattern));
}

function isSafeLabel(text) {
  const value = normalizeText(text);
  if (!value) return true;
  return !SKIP_PATTERNS.some((pattern) => pattern.test(value));
}

function looksExternalNavigation(baseUrl, nextUrl) {
  try {
    return new URL(baseUrl).origin !== new URL(nextUrl).origin;
  } catch {
    return false;
  }
}

function elementSignature(element) {
  return [
    element.kind,
    element.label,
    element.domPath,
    element.role,
    element.testId,
    `${element.x},${element.y},${element.width},${element.height}`,
  ].join("|");
}

function meaningfulStateChange(beforeSnapshot, afterSnapshot) {
  if (!beforeSnapshot || !afterSnapshot) return false;
  if (beforeSnapshot.fingerprint !== afterSnapshot.fingerprint) return true;
  if (beforeSnapshot.url !== afterSnapshot.url) return true;
  if (beforeSnapshot.overlays.length !== afterSnapshot.overlays.length) return true;
  if (beforeSnapshot.summary.domNodes !== afterSnapshot.summary.domNodes) return true;
  return false;
}

function diffElements(beforeElements, afterElements) {
  const beforeSet = new Set(beforeElements.map((element) => elementSignature(element)));
  return afterElements.filter((element) => !beforeSet.has(elementSignature(element)));
}

function buildReplayStep(element, action) {
  return {
    action,
    label: element.label,
    kind: element.kind,
    role: element.role,
    tag: element.tag,
    testId: element.testId,
    ariaLabel: element.ariaLabel,
    title: element.title,
    href: element.href,
    domPath: element.domPath,
    region: element.region,
    insideOverlay: element.insideOverlay,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
}

function buildCoordinateReplayStep(target, action = "contextmenu") {
  return {
    action,
    replayTarget: "coordinate",
    label: target.label,
    x: target.x,
    y: target.y,
  };
}

function scoreReplayCandidate(step, candidate) {
  let score = 0;
  const stepLabel = normalizeText(step.label).toLowerCase();
  const candidateLabel = normalizeText(candidate.label).toLowerCase();
  const stepPath = normalizeText(step.domPath).toLowerCase();
  const candidatePath = normalizeText(candidate.domPath).toLowerCase();

  if (step.testId && candidate.testId && step.testId === candidate.testId) score += 180;
  if (step.ariaLabel && candidate.ariaLabel && step.ariaLabel === candidate.ariaLabel) score += 120;
  if (step.title && candidate.title && step.title === candidate.title) score += 80;
  if (step.href && candidate.href && step.href === candidate.href) score += 70;
  if (step.role && candidate.role && step.role === candidate.role) score += 30;
  if (step.kind && candidate.kind === step.kind) score += 35;
  if (step.tag && candidate.tag === step.tag) score += 20;
  if (typeof step.insideOverlay === "boolean" && candidate.insideOverlay === step.insideOverlay) score += 20;
  if (step.region && candidate.region === step.region) score += 15;
  if (stepPath && candidatePath && stepPath === candidatePath) score += 80;
  if (stepPath && candidatePath && (candidatePath.includes(stepPath) || stepPath.includes(candidatePath))) score += 25;
  if (stepLabel && candidateLabel && stepLabel === candidateLabel) score += 110;
  if (stepLabel && candidateLabel && (candidateLabel.includes(stepLabel) || stepLabel.includes(candidateLabel))) score += 35;

  if (Number.isFinite(step.x) && Number.isFinite(step.y)) {
    const dx = Math.abs((candidate.x || 0) - step.x);
    const dy = Math.abs((candidate.y || 0) - step.y);
    score += Math.max(0, 40 - Math.round((dx + dy) / 20));
  }

  return score;
}

function registerReplayPath(runContext, entry) {
  const existing = runContext.pathsByFingerprint.get(entry.stateFingerprint);
  if (!existing || entry.trail.length < existing.trail.length) {
    runContext.pathsByFingerprint.set(entry.stateFingerprint, entry);
  }
}

function mergeTaxonomyIntoAggregate(aggregate, taxonomy) {
  for (const role of taxonomy.roles || []) aggregate.roles.add(role);
  for (const attr of taxonomy.dataAttrs || []) aggregate.dataAttrs.add(attr);
  for (const testId of taxonomy.testIds || []) aggregate.testIds.add(testId);
  for (const classToken of taxonomy.classTokens || []) aggregate.classTokens.add(classToken);
  for (const overlayKind of taxonomy.overlayKinds || []) aggregate.overlayKinds.add(overlayKind);
}

async function cloneBrowserProfile(browser, sourceProfileName, targetUserDataDir) {
  const browserPaths = getBrowserPaths(browser);
  const sourceProfileDir = path.join(browserPaths.userDataDir, sourceProfileName);
  const sourceLocalState = path.join(browserPaths.userDataDir, "Local State");

  if (!(await pathExists(sourceProfileDir))) {
    throw new Error(`${browserPaths.displayName} profile not found: ${sourceProfileDir}`);
  }

  await ensureDir(targetUserDataDir);

  if (await pathExists(sourceLocalState)) {
    await fs.copyFile(sourceLocalState, path.join(targetUserDataDir, "Local State"));
  }

  const targetProfileDir = path.join(targetUserDataDir, sourceProfileName);
  await fs.rm(targetProfileDir, { recursive: true, force: true });
  await fs.cp(sourceProfileDir, targetProfileDir, { recursive: true, force: true });
}

async function safeVisibleText(page) {
  try {
    return await page.evaluate(() => (document.body?.innerText || "").replace(/\r\n/g, "\n"));
  } catch {
    return "";
  }
}

async function discoverInteractiveElements(page) {
  return page.evaluate(() => {
    const selectors = [
      { kind: "button", selector: "button:not([disabled])" },
      { kind: "button", selector: "[role='button']:not([disabled])" },
      { kind: "tab", selector: "[role='tab']" },
      { kind: "menuitem", selector: "[role='menuitem']" },
      { kind: "switch", selector: "[role='switch']" },
      { kind: "checkbox", selector: "[role='checkbox']" },
      { kind: "radio", selector: "[role='radio']" },
      { kind: "option", selector: "[role='option']" },
      { kind: "combobox", selector: "[role='combobox']" },
      { kind: "input", selector: "input:not([disabled]), textarea:not([disabled]), select:not([disabled])" },
      { kind: "link", selector: "a[href]" },
      { kind: "clickable", selector: "[aria-haspopup]" },
      { kind: "clickable", selector: "[data-testid]" },
      { kind: "module", selector: ".imt-module, [class*='module'], [data-testid*='module']" },
      { kind: "clickable", selector: "[class*='dropdown'], [class*='Dropdown']" },
      { kind: "clickable", selector: "[class*='toggle'], [class*='Toggle']" },
      { kind: "clickable", selector: "[class*='menu-item'], [class*='MenuItem']" },
      { kind: "clickable", selector: "[class*='toolbar'] button, [class*='Toolbar'] button" },
    ];

    const overlaySelectors = [
      "[role='dialog']",
      "[role='alertdialog']",
      "[role='menu']",
      "[role='listbox']",
      "[role='tooltip']",
      "[class*='modal']",
      "[class*='Modal']",
      "[class*='popup']",
      "[class*='Popup']",
      "[class*='popover']",
      "[class*='Popover']",
      "[class*='overlay']",
      "[class*='Overlay']",
      "[class*='drawer']",
      "[class*='Drawer']",
      "[class*='panel'][class*='open']",
    ];

    const norm = (value) => (value || "").replace(/\s+/g, " ").trim();
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (!rect.width || !rect.height) return false;
      if (rect.bottom < 0 || rect.right < 0) return false;
      if (style.display === "none" || style.visibility === "hidden") return false;
      if (style.pointerEvents === "none") return false;
      if (Number(style.opacity || "1") === 0) return false;
      return true;
    };

    const domPath = (element) => {
      const parts = [];
      let current = element;
      let depth = 0;
      while (current && current.nodeType === Node.ELEMENT_NODE && depth < 6) {
        const tag = current.tagName.toLowerCase();
        const id = current.id ? `#${current.id}` : "";
        const classPart =
          typeof current.className === "string" && current.className
            ? `.${current.className.split(/\s+/).slice(0, 2).join(".")}`
            : "";
        parts.unshift(`${tag}${id}${classPart}`);
        current = current.parentElement;
        depth += 1;
      }
      return parts.join(" > ");
    };

    const classifyRegion = (rect) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (rect.top < 72) return "toolbar";
      if (rect.left < 280) return "sidebar";
      if (rect.right > width - 360 && rect.top > 72) return "panel";
      if (rect.bottom > height - 60) return "statusbar";
      if (rect.left >= 280 && rect.right <= width - 360) return "canvas";
      return "other";
    };

    const overlayRoots = overlaySelectors.flatMap((selector) =>
      Array.from(document.querySelectorAll(selector)).filter(isVisible),
    );

    const seen = new Set();
    const results = [];

    for (const { kind, selector } of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        if (!isVisible(element)) continue;
        const rect = element.getBoundingClientRect();
        const text = norm(element.innerText || element.textContent || "").slice(0, 200);
        const ariaLabel = element.getAttribute("aria-label") || "";
        const title = element.getAttribute("title") || "";
        const testId = element.getAttribute("data-testid") || "";
        const href = element.getAttribute("href") || "";
        const role = element.getAttribute("role") || "";
        const tag = element.tagName.toLowerCase();
        const className = typeof element.className === "string" ? element.className.slice(0, 300) : "";
        const label = norm(ariaLabel || title || text || testId || tag);
        const overlayParent = overlayRoots.find((root) => root.contains(element));
        const key = `${selector}|${Math.round(rect.x)}|${Math.round(rect.y)}|${Math.round(rect.width)}|${Math.round(rect.height)}|${label}`;
        if (seen.has(key)) continue;
        seen.add(key);

        results.push({
          selector,
          kind,
          tag,
          role,
          id: element.id || "",
          testId,
          ariaLabel,
          title,
          href,
          text,
          className,
          domPath: domPath(element),
          disabled: "disabled" in element ? Boolean(element.disabled) : false,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          centerX: Math.round(rect.x + rect.width / 2),
          centerY: Math.round(rect.y + rect.height / 2),
          label,
          region: classifyRegion(rect),
          insideOverlay: Boolean(overlayParent),
        });
      }
    }

    results.sort((left, right) => left.y - right.y || left.x - right.x);
    return results;
  });
}

async function discoverOverlays(page) {
  return page.evaluate(() => {
    const selectors = [
      "[role='dialog']",
      "[role='alertdialog']",
      "[role='menu']",
      "[role='listbox']",
      "[role='tooltip']",
      "[class*='modal']",
      "[class*='Modal']",
      "[class*='popup']",
      "[class*='Popup']",
      "[class*='popover']",
      "[class*='Popover']",
      "[class*='overlay']",
      "[class*='Overlay']",
      "[class*='drawer']",
      "[class*='Drawer']",
      "[class*='panel'][class*='open']",
    ];

    const norm = (value) => (value || "").replace(/\s+/g, " ").trim();
    const results = [];
    const seen = new Set();

    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        if (!rect.width || !rect.height) continue;
        if (style.display === "none" || style.visibility === "hidden") continue;
        const key = `${selector}|${Math.round(rect.x)}|${Math.round(rect.y)}|${Math.round(rect.width)}|${Math.round(rect.height)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({
          selector,
          tag: element.tagName.toLowerCase(),
          role: element.getAttribute("role") || "",
          className: typeof element.className === "string" ? element.className.slice(0, 300) : "",
          text: norm(element.innerText || element.textContent || "").slice(0, 500),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    }

    return results.sort((left, right) => left.y - right.y || left.x - right.x);
  });
}

async function extractUiTaxonomy(page) {
  return page.evaluate(() => {
    const visibleElements = Array.from(document.querySelectorAll("*")).filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    });

    const roles = new Set();
    const dataAttrs = new Set();
    const testIds = new Set();
    const classTokens = new Set();
    const overlayKinds = new Set();

    for (const element of visibleElements) {
      const role = element.getAttribute("role");
      if (role) roles.add(role);
      const testId = element.getAttribute("data-testid");
      if (testId) testIds.add(testId);
      if (typeof element.className === "string") {
        for (const token of element.className.split(/\s+/).filter(Boolean).slice(0, 8)) {
          classTokens.add(token);
          if (/modal|popup|popover|drawer|tooltip|overlay|dialog|menu/i.test(token)) {
            overlayKinds.add(token);
          }
        }
      }
      for (const attribute of Array.from(element.attributes)) {
        if (attribute.name.startsWith("data-")) {
          dataAttrs.add(attribute.name);
        }
      }
    }

    return {
      roles: Array.from(roles).sort().slice(0, 300),
      dataAttrs: Array.from(dataAttrs).sort().slice(0, 300),
      testIds: Array.from(testIds).sort().slice(0, 300),
      classTokens: Array.from(classTokens).sort().slice(0, 500),
      overlayKinds: Array.from(overlayKinds).sort().slice(0, 200),
    };
  });
}

async function extractDomSummary(page) {
  return page.evaluate(() => {
    const norm = (value) => (value || "").replace(/\s+/g, " ").trim();
    const collect = (selector, limit = 150) =>
      Array.from(document.querySelectorAll(selector))
        .slice(0, limit)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            role: element.getAttribute("role"),
            ariaLabel: element.getAttribute("aria-label"),
            testId: element.getAttribute("data-testid"),
            text: norm(element.innerText || element.textContent || "").slice(0, 160),
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        });

    return {
      url: location.href,
      title: document.title,
      domNodes: document.querySelectorAll("*").length,
      headings: collect("h1,h2,h3,h4,h5,h6", 50),
      buttons: collect("button,[role='button']", 150),
      inputs: collect("input,textarea,select,[role='combobox']", 150),
      tabs: collect("[role='tab']", 100),
      menus: collect("[role='menu'],[role='menuitem']", 150),
      dialogs: collect("[role='dialog'],[role='alertdialog']", 50),
      links: collect("a[href]", 100),
    };
  });
}

function buildStateFingerprint(snapshot) {
  const payload = JSON.stringify({
    url: canonicalizeUrl(snapshot.url),
    title: snapshot.title,
    overlays: snapshot.overlays.map((overlay) => ({
      selector: overlay.selector,
      role: overlay.role,
      text: overlay.text.slice(0, 120),
      size: `${overlay.width}x${overlay.height}`,
    })),
    elements: snapshot.elements.slice(0, 40).map((element) => ({
      kind: element.kind,
      role: element.role,
      label: element.label.slice(0, 120),
      testId: element.testId,
      domPath: element.domPath.slice(0, 160),
      region: element.region,
      overlay: element.insideOverlay,
    })),
    taxonomy: {
      roles: snapshot.taxonomy.roles.slice(0, 60),
      dataAttrs: snapshot.taxonomy.dataAttrs.slice(0, 60),
      testIds: snapshot.taxonomy.testIds.slice(0, 60),
    },
    domNodes: snapshot.summary.domNodes,
  });
  return hashValue(payload);
}

async function snapshotState(page) {
  let lastError = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const [elements, overlays, taxonomy, summary, title] = await Promise.all([
        discoverInteractiveElements(page),
        discoverOverlays(page),
        extractUiTaxonomy(page),
        extractDomSummary(page),
        page.title().catch(() => null),
      ]);

      const snapshot = {
        url: page.url(),
        title,
        elements,
        overlays,
        taxonomy,
        summary,
      };
      snapshot.fingerprint = buildStateFingerprint(snapshot);
      return snapshot;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(700);
    }
  }
  throw lastError;
}

async function waitForUsableUi(page, timeoutMs = 45000) {
  const startedAt = Date.now();
  let lastSnapshot = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const snapshot = await snapshotState(page);
      lastSnapshot = snapshot;
      const visibleText = await safeVisibleText(page);
      const ready =
        snapshot.elements.length > 0 ||
        snapshot.overlays.length > 0 ||
        snapshot.summary.buttons.length > 0 ||
        snapshot.summary.inputs.length > 0 ||
        snapshot.summary.tabs.length > 0 ||
        normalizeText(visibleText).length > 20;
      if (ready) {
        return snapshot;
      }
    } catch {
      // Keep polling while the page settles or navigates.
    }
    await page.waitForTimeout(1000);
  }

  if (lastSnapshot) {
    return lastSnapshot;
  }

  return snapshotState(page);
}

async function captureState(page, stateDir, snapshot, meta = {}) {
  await ensureDir(stateDir);
  await page.screenshot({
    path: path.join(stateDir, "screenshot.png"),
    animations: "disabled",
  }).catch(() => {});

  await writeJson(path.join(stateDir, "state.json"), {
    capturedAt: new Date().toISOString(),
    ...meta,
    fingerprint: snapshot.fingerprint,
    url: snapshot.url,
    title: snapshot.title,
    overlayCount: snapshot.overlays.length,
    elementCount: snapshot.elements.length,
  });
  await writeJson(path.join(stateDir, "interactive-elements.json"), snapshot.elements);
  await writeJson(path.join(stateDir, "overlays.json"), snapshot.overlays);
  await writeJson(path.join(stateDir, "ui-taxonomy.json"), snapshot.taxonomy);
  await writeJson(path.join(stateDir, "dom-summary.json"), snapshot.summary);
  await fs.writeFile(path.join(stateDir, "visible-text.txt"), await safeVisibleText(page), "utf8");
}

async function tryDismissOverlays(page, settleMs = 250) {
  for (const key of SAFE_CLOSE_KEYS) {
    await page.keyboard.press(key).catch(() => {});
    await page.waitForTimeout(settleMs);
  }
  await page.mouse.click(4, 4).catch(() => {});
  await page.waitForTimeout(settleMs);
}

async function recoverRootPage(page, rootUrl, settleMs) {
  await tryDismissOverlays(page, Math.min(250, settleMs));
  const currentUrl = page.url();
  if (currentUrl !== rootUrl || looksExternalNavigation(rootUrl, currentUrl)) {
    await page.goto(rootUrl, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(settleMs);
  }
  await waitForUsableUi(page, Math.max(12000, settleMs * 4)).catch(() => {});
}

async function hoverForTooltips(page, element, targetDir) {
  await page.mouse.move(element.centerX, element.centerY).catch(() => {});
  await page.waitForTimeout(700);
  const tooltips = await page.evaluate(() => {
    const norm = (value) => (value || "").replace(/\s+/g, " ").trim();
    return Array.from(document.querySelectorAll("[role='tooltip'], [class*='tooltip'], [class*='Tooltip']"))
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .map((node) => ({
        text: norm(node.innerText || node.textContent || "").slice(0, 300),
        className: typeof node.className === "string" ? node.className.slice(0, 240) : "",
      }));
  }).catch(() => []);

  if (tooltips.length > 0) {
    await page.screenshot({
      path: path.join(targetDir, "hover.png"),
      animations: "disabled",
    }).catch(() => {});
    await writeJson(path.join(targetDir, "tooltips.json"), tooltips);
  }

  return tooltips;
}

async function readReplayPath(inputValue) {
  if (!inputValue) return [];
  const resolvedPath = path.resolve(inputValue);
  if (await pathExists(resolvedPath)) {
    const raw = await fs.readFile(resolvedPath, "utf8");
    return JSON.parse(raw);
  }
  return JSON.parse(inputValue);
}

async function findBestReplayTarget(page, step) {
  const elements = await discoverInteractiveElements(page);
  let best = null;
  let bestScore = -1;

  for (const element of elements) {
    const score = scoreReplayCandidate(step, element);
    if (score > bestScore) {
      best = element;
      bestScore = score;
    }
  }

  if (!best || bestScore < 60) {
    return null;
  }

  return { element: best, score: bestScore, available: elements.length };
}

async function executeReplayTrail(page, trail, opts, outDir) {
  await ensureDir(outDir);
  const replayLog = [];

  for (let index = 0; index < trail.length; index += 1) {
    const step = trail[index];
    const stepDir = path.join(outDir, `${String(index + 1).padStart(2, "0")}-${slug(step.label || step.action || "step")}`);
    await ensureDir(stepDir);
    await writeJson(path.join(stepDir, "step.json"), step);

    let matchedElement = null;
    if (step.replayTarget === "coordinate") {
      if (step.action === "contextmenu") {
        await page.mouse.click(step.x, step.y, { button: "right" });
      } else {
        await page.mouse.click(step.x, step.y);
      }
    } else {
      const match = await findBestReplayTarget(page, step);
      if (!match) {
        throw new Error(`Unable to replay step ${index + 1}: ${step.label || step.action}`);
      }
      matchedElement = match.element;
      await writeJson(path.join(stepDir, "matched-element.json"), {
        score: match.score,
        available: match.available,
        matchedElement,
      });
      await hoverForTooltips(page, matchedElement, stepDir);
      await clickElement(page, matchedElement, step.action || "click");
    }

    await page.waitForTimeout((step.action || "click") === "dblclick" ? opts.settleMs * 2 : opts.settleMs);
    const snapshot = await snapshotState(page);
    await captureState(page, stepDir, snapshot, {
      replayStepIndex: index + 1,
      replayStepLabel: step.label || step.action,
      replayAction: step.action || "click",
      matchedBy: step.replayTarget === "coordinate" ? "coordinate" : "heuristic-match",
    });
    replayLog.push({
      index: index + 1,
      step,
      matchedElement,
      fingerprint: snapshot.fingerprint,
      url: snapshot.url,
      overlayCount: snapshot.overlays.length,
      elementCount: snapshot.elements.length,
    });
  }

  await writeJson(path.join(outDir, "replay-log.json"), replayLog);
  return replayLog;
}

async function clickElement(page, element, clickType = "click") {
  if (clickType === "dblclick") {
    await page.mouse.dblclick(element.centerX, element.centerY);
    return;
  }
  if (clickType === "contextmenu") {
    await page.mouse.click(element.centerX, element.centerY, { button: "right" });
    return;
  }
  await page.mouse.click(element.centerX, element.centerY);
}

function prioritizeElements(elements, maxElementsPerState) {
  const score = (element) => {
    let value = 0;
    if (element.insideOverlay) value += 40;
    if (element.kind === "module") value += 35;
    if (element.kind === "tab") value += 30;
    if (element.kind === "combobox") value += 30;
    if (element.kind === "menuitem") value += 25;
    if (element.role === "button") value += 10;
    if (element.region === "toolbar") value += 8;
    if (element.region === "panel") value += 8;
    if (element.region === "canvas") value += 6;
    if (element.testId) value += 4;
    if (element.label) value += Math.min(10, Math.floor(element.label.length / 15));
    return value;
  };

  return [...elements]
    .sort((left, right) => score(right) - score(left) || left.y - right.y || left.x - right.x)
    .slice(0, maxElementsPerState);
}

async function exploreState({
  page,
  opts,
  runContext,
  stateDir,
  label,
  depth,
  parentFingerprint = null,
  rootUrl,
  mode = "root",
  trail = [],
}) {
  if (runContext.interactionCount >= opts.maxInteractions) return;

  const startSnapshot = await snapshotState(page);
  mergeTaxonomyIntoAggregate(runContext.taxonomyAggregate, startSnapshot.taxonomy);

  const stateKey = `${depth}:${startSnapshot.fingerprint}`;
  if (runContext.visitedStates.has(stateKey)) return;
  runContext.visitedStates.add(stateKey);

  await captureState(page, stateDir, startSnapshot, {
    label,
    depth,
    mode,
    parentFingerprint,
  });
  await writeJson(path.join(stateDir, "replay-path.json"), trail);
  registerReplayPath(runContext, {
    label,
    depth,
    mode,
    stateFingerprint: startSnapshot.fingerprint,
    captureDir: path.relative(opts.outDir, stateDir),
    trail,
  });

  const regionMap = { toolbar: [], sidebar: [], canvas: [], panel: [], statusbar: [], other: [] };
  for (const element of startSnapshot.elements) {
    regionMap[element.region] = regionMap[element.region] || [];
    regionMap[element.region].push(element);
  }
  await writeJson(path.join(stateDir, "element-regions.json"), regionMap);

  const candidates = prioritizeElements(startSnapshot.elements, opts.maxElementsPerState);
  const localSeen = new Set();

  for (const element of candidates) {
    if (runContext.interactionCount >= opts.maxInteractions) break;

    const signature = elementSignature(element);
    if (localSeen.has(signature)) continue;
    localSeen.add(signature);

    const interactionId = String(runContext.interactionCount).padStart(4, "0");
    const interactionDir = path.join(stateDir, `${interactionId}-${slug(element.label || element.kind)}`);
    await ensureDir(interactionDir);
    await writeJson(path.join(interactionDir, "element.json"), element);
    const nextTrail = [...trail, buildReplayStep(element, element.kind === "module" && depth === 0 ? "dblclick" : "click")];
    await writeJson(path.join(interactionDir, "replay-path.json"), nextTrail);

    if (!isSafeLabel(element.label) || !isSafeLabel(element.text) || !isSafeLabel(element.ariaLabel)) {
      runContext.catalog.push({
        depth,
        mode,
        action: "skipped-unsafe",
        stateFingerprint: startSnapshot.fingerprint,
        label: element.label,
        region: element.region,
        kind: element.kind,
        role: element.role,
        captureDir: path.relative(opts.outDir, interactionDir),
      });
      continue;
    }

    const beforeSnapshot = await snapshotState(page);
    const tooltips = await hoverForTooltips(page, element, interactionDir);
    await writeJson(path.join(interactionDir, "before.json"), {
      fingerprint: beforeSnapshot.fingerprint,
      url: beforeSnapshot.url,
      overlayCount: beforeSnapshot.overlays.length,
      elementCount: beforeSnapshot.elements.length,
    });

    let clickMode = "click";
    if (element.kind === "module" && depth === 0) {
      clickMode = "dblclick";
      nextTrail[nextTrail.length - 1] = buildReplayStep(element, clickMode);
      await writeJson(path.join(interactionDir, "replay-path.json"), nextTrail);
    }

    let error = null;
    try {
      await clickElement(page, element, clickMode);
      runContext.interactionCount += 1;
      await page.waitForTimeout(clickMode === "dblclick" ? opts.settleMs * 2 : opts.settleMs);
    } catch (interactionError) {
      error = String(interactionError);
    }

    const afterSnapshot = await snapshotState(page);
    mergeTaxonomyIntoAggregate(runContext.taxonomyAggregate, afterSnapshot.taxonomy);

    const newElements = diffElements(beforeSnapshot.elements, afterSnapshot.elements);
    const changed = !error && meaningfulStateChange(beforeSnapshot, afterSnapshot);
    const overlayDelta = afterSnapshot.overlays.length - beforeSnapshot.overlays.length;
    const transition = {
      id: interactionId,
      depth,
      mode,
      action: clickMode,
      label: element.label,
      kind: element.kind,
      region: element.region,
      role: element.role,
      beforeFingerprint: beforeSnapshot.fingerprint,
      afterFingerprint: afterSnapshot.fingerprint,
      beforeUrl: beforeSnapshot.url,
      afterUrl: afterSnapshot.url,
      overlayDelta,
      newElementCount: newElements.length,
      tooltipCount: tooltips.length,
      changed,
      error,
      trail: nextTrail,
      captureDir: path.relative(opts.outDir, interactionDir),
    };
    runContext.transitions.push(transition);
    await writeJson(path.join(interactionDir, "transition.json"), transition);

    if (error) {
      runContext.catalog.push({
        ...transition,
        stateFingerprint: beforeSnapshot.fingerprint,
        actionStatus: "error",
      });
      if (depth === 0) {
        await recoverRootPage(page, rootUrl, opts.settleMs);
      }
      continue;
    }

    await captureState(page, interactionDir, afterSnapshot, {
      label: element.label,
      depth,
      mode,
      action: clickMode,
      parentFingerprint: beforeSnapshot.fingerprint,
    });
    await writeJson(path.join(interactionDir, "new-elements.json"), newElements);
    registerReplayPath(runContext, {
      label: element.label,
      depth,
      mode,
      stateFingerprint: afterSnapshot.fingerprint,
      captureDir: path.relative(opts.outDir, interactionDir),
      trail: nextTrail,
    });

    runContext.catalog.push({
      depth,
      mode,
      stateFingerprint: beforeSnapshot.fingerprint,
      action: clickMode,
      label: element.label,
      kind: element.kind,
      role: element.role,
      region: element.region,
      overlayDelta,
      changed,
      newElementCount: newElements.length,
      tooltipCount: tooltips.length,
      trail: nextTrail,
      captureDir: path.relative(opts.outDir, interactionDir),
    });

    if (
      changed &&
      depth < opts.maxDepth &&
      !runContext.visitedStates.has(`${depth + 1}:${afterSnapshot.fingerprint}`) &&
      (overlayDelta > 0 || newElements.length > 0 || afterSnapshot.elements.length !== beforeSnapshot.elements.length)
    ) {
      await exploreState({
        page,
        opts,
        runContext,
        stateDir: path.join(interactionDir, "nested-state"),
        label: `${element.label || element.kind} nested`,
        depth: depth + 1,
        parentFingerprint: beforeSnapshot.fingerprint,
        rootUrl,
        mode: afterSnapshot.overlays.length > 0 ? "overlay" : "nested",
        trail: nextTrail,
      });
    }

    if (depth === 0) {
      await recoverRootPage(page, rootUrl, opts.settleMs);
    } else if (afterSnapshot.overlays.length > beforeSnapshot.overlays.length) {
      await tryDismissOverlays(page);
      await page.waitForTimeout(Math.min(opts.settleMs, 500));
    }
  }
}

async function exploreContextMenus(page, opts, runContext, baselineSnapshot) {
  const contextDir = path.join(opts.outDir, "02-context-menus");
  await ensureDir(contextDir);
  const viewport = page.viewportSize();

  const targets = [
    { x: Math.round(viewport.width / 2), y: Math.round(viewport.height / 2), label: "canvas-center" },
    { x: 400, y: 280, label: "canvas-upper-left" },
    { x: Math.round(viewport.width * 0.7), y: 220, label: "canvas-upper-right" },
  ];

  const moduleTargets = baselineSnapshot.elements
    .filter((element) => element.kind === "module")
    .slice(0, 6)
    .map((element) => ({
      x: element.centerX,
      y: element.centerY,
      label: `module-${slug(element.label || "node")}`,
    }));

  for (const target of [...targets, ...moduleTargets]) {
    if (runContext.interactionCount >= opts.maxInteractions) break;

    const targetDir = path.join(contextDir, target.label);
    await ensureDir(targetDir);
    const replayTrail = [buildCoordinateReplayStep(target, "contextmenu")];
    await writeJson(path.join(targetDir, "replay-path.json"), replayTrail);

    const beforeSnapshot = await snapshotState(page);
    await page.mouse.click(target.x, target.y, { button: "right" });
    runContext.interactionCount += 1;
    await page.waitForTimeout(opts.settleMs);
    const afterSnapshot = await snapshotState(page);
    const newElements = diffElements(beforeSnapshot.elements, afterSnapshot.elements);
    const changed = meaningfulStateChange(beforeSnapshot, afterSnapshot);

    await captureState(page, targetDir, afterSnapshot, {
      label: target.label,
      depth: 0,
      mode: "contextmenu",
      parentFingerprint: beforeSnapshot.fingerprint,
    });
    await writeJson(path.join(targetDir, "new-elements.json"), newElements);
    registerReplayPath(runContext, {
      label: target.label,
      depth: 0,
      mode: "contextmenu",
      stateFingerprint: afterSnapshot.fingerprint,
      captureDir: path.relative(opts.outDir, targetDir),
      trail: replayTrail,
    });

    runContext.transitions.push({
      id: `ctx-${target.label}`,
      depth: 0,
      mode: "contextmenu",
      action: "contextmenu",
      label: target.label,
      beforeFingerprint: beforeSnapshot.fingerprint,
      afterFingerprint: afterSnapshot.fingerprint,
      beforeUrl: beforeSnapshot.url,
      afterUrl: afterSnapshot.url,
      overlayDelta: afterSnapshot.overlays.length - beforeSnapshot.overlays.length,
      newElementCount: newElements.length,
      changed,
      trail: replayTrail,
      captureDir: path.relative(opts.outDir, targetDir),
    });

    if (changed && afterSnapshot.overlays.length > 0 && opts.maxDepth > 0) {
      await exploreState({
        page,
        opts,
        runContext,
        stateDir: path.join(targetDir, "nested-state"),
        label: `${target.label} context menu`,
        depth: 1,
        parentFingerprint: beforeSnapshot.fingerprint,
        rootUrl: opts.url,
        mode: "overlay",
        trail: replayTrail,
      });
    }

    await recoverRootPage(page, opts.url, opts.settleMs);
  }
}

function summarizeNetwork(networkLog) {
  const grouped = new Map();
  for (const entry of networkLog) {
    const key = `${entry.method || "GET"} ${canonicalizeUrl(entry.url)}`;
    const current = grouped.get(key) || {
      method: entry.method || "GET",
      url: canonicalizeUrl(entry.url),
      count: 0,
      statuses: new Set(),
      resourceTypes: new Set(),
    };
    current.count += 1;
    if (entry.status) current.statuses.add(entry.status);
    if (entry.resourceType) current.resourceTypes.add(entry.resourceType);
    grouped.set(key, current);
  }

  return [...grouped.values()]
    .map((entry) => ({
      ...entry,
      statuses: [...entry.statuses].sort((left, right) => left - right),
      resourceTypes: [...entry.resourceTypes].sort(),
    }))
    .sort((left, right) => right.count - left.count || left.url.localeCompare(right.url));
}

function generateMarkdownReport({ runContext, baselineSnapshot, networkSummary, websocketLog }) {
  const replayPathCount = runContext.pathsByFingerprint ? runContext.pathsByFingerprint.size : 0;
  const lines = [
    "# Make.com Editor UI Exploration Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Root URL: ${runContext.rootUrl}`,
    `Baseline fingerprint: ${baselineSnapshot.fingerprint}`,
    `Total interactions: ${runContext.interactionCount}`,
    `Catalog entries: ${runContext.catalog.length}`,
    `Transitions: ${runContext.transitions.length}`,
    `Visited states: ${runContext.visitedStates.size}`,
    `Replay paths: ${replayPathCount}`,
    "",
    "## What This Run Captured",
    "",
    "- Baseline editor snapshot with element inventory.",
    "- Replayable paths for every visited state so you can reopen it later.",
    "- Nested UI states such as overlays, dialogs, drawers, tabs, panels, and menus.",
    "- Tooltips, context menus, and node double-click states.",
    "- Passive network request and response logging plus websocket discovery.",
    "- Aggregated UI taxonomy: roles, data attributes, test ids, and overlay-ish class tokens.",
    "",
    "## High-Signal UI Transitions",
    "",
  ];

  const highSignal = runContext.transitions
    .filter((transition) => transition.changed || transition.overlayDelta > 0 || transition.newElementCount > 0)
    .sort((left, right) => right.newElementCount - left.newElementCount || right.overlayDelta - left.overlayDelta)
    .slice(0, 25);

  if (highSignal.length === 0) {
    lines.push("No major transitions were detected.");
  } else {
    lines.push("| Label | Mode | Depth | Overlay Delta | New Elements | Capture |");
    lines.push("|---|---|---|---|---|---|");
    for (const transition of highSignal) {
      lines.push(
        `| ${transition.label?.slice(0, 60) || "-"} | ${transition.mode} | ${transition.depth} | ${transition.overlayDelta || 0} | ${transition.newElementCount || 0} | ${transition.captureDir} |`,
      );
    }
  }

  lines.push("", "## Taxonomy Signals", "");
  lines.push(`- Roles: ${uniqueSorted([...runContext.taxonomyAggregate.roles]).slice(0, 40).join(", ") || "None"}`);
  lines.push(`- Data attrs: ${uniqueSorted([...runContext.taxonomyAggregate.dataAttrs]).slice(0, 40).join(", ") || "None"}`);
  lines.push(`- Test ids: ${uniqueSorted([...runContext.taxonomyAggregate.testIds]).slice(0, 40).join(", ") || "None"}`);
  lines.push(`- Overlay tokens: ${uniqueSorted([...runContext.taxonomyAggregate.overlayKinds]).slice(0, 40).join(", ") || "None"}`);

  lines.push("", "## Network Signals", "");
  if (networkSummary.length === 0) {
    lines.push("No interesting API or GraphQL traffic was captured.");
  } else {
    lines.push("| Method | Endpoint | Count | Statuses | Types |");
    lines.push("|---|---|---|---|---|");
    for (const entry of networkSummary.slice(0, 30)) {
      lines.push(
        `| ${entry.method} | ${entry.url} | ${entry.count} | ${entry.statuses.join(", ") || "-"} | ${entry.resourceTypes.join(", ") || "-"} |`,
      );
    }
  }

  lines.push("", "## Websocket Signals", "");
  if (websocketLog.length === 0) {
    lines.push("No websockets were observed.");
  } else {
    for (const websocket of websocketLog.slice(0, 20)) {
      lines.push(`- ${websocket.url} (${websocket.events.length} events)`);
    }
  }

  lines.push("", "## Output Files", "");
  lines.push("- `00-baseline/`: initial editor state");
  lines.push("- `01-root-exploration/`: main editor exploration");
  lines.push("- `02-context-menus/`: right-click discoveries");
  lines.push("- `catalog.json`: interaction catalog");
  lines.push("- `transitions.json`: state transitions");
  lines.push("- `replay-paths.json`: saved paths you can replay later");
  lines.push("- `network-summary.json`: grouped endpoint summary");
  lines.push("- `network-log.json`: raw request and response log");
  lines.push("- `websocket-log.json`: websocket events");
  lines.push("- `ui-taxonomy-aggregate.json`: merged taxonomy");
  lines.push("");

  return lines.join("\n");
}

function attachNetworkLogging(page, networkLog, websocketLog) {
  page.on("request", (request) => {
    const url = request.url();
    if (!isInterestingNetworkUrl(url)) return;
    networkLog.push({
      id: hashValue(`${Date.now()}-${request.method()}-${url}`),
      phase: "request",
      method: request.method(),
      url,
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString(),
    });
  });

  page.on("response", async (response) => {
    const url = response.url();
    if (!isInterestingNetworkUrl(url)) return;
    const request = response.request();
    const headers = response.headers();
    const contentType = headers["content-type"] || "";
    const contentLength = Number(headers["content-length"] || "0");
    const entry = {
      id: hashValue(`${Date.now()}-${response.status()}-${url}`),
      phase: "response",
      method: request.method(),
      url,
      resourceType: request.resourceType(),
      status: response.status(),
      timestamp: new Date().toISOString(),
      contentType,
      contentLength,
    };

    if (/json|graphql|text/i.test(contentType) && contentLength < 250000) {
      try {
        entry.preview = (await response.text()).slice(0, RESPONSE_PREVIEW_LIMIT);
      } catch {
        entry.preview = null;
      }
    }

    networkLog.push(entry);
  });

  page.on("websocket", (websocket) => {
    const wsEntry = {
      url: websocket.url(),
      openedAt: new Date().toISOString(),
      events: [],
    };
    websocketLog.push(wsEntry);
    websocket.on("framesent", (payload) => {
      wsEntry.events.push({
        type: "sent",
        payload: String(payload.payload || "").slice(0, 500),
        timestamp: new Date().toISOString(),
      });
    });
    websocket.on("framereceived", (payload) => {
      wsEntry.events.push({
        type: "received",
        payload: String(payload.payload || "").slice(0, 500),
        timestamp: new Date().toISOString(),
      });
    });
    websocket.on("close", () => {
      wsEntry.closedAt = new Date().toISOString();
    });
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.url) {
    console.error("Error: --url is required.");
    console.error("Example: node scripts/explore-make-editor-v2.mjs --url https://us1.make.com/NNNN/scenarios/NNN/edit");
    process.exit(1);
  }

  await ensureDir(opts.outDir);
  await ensureDir(opts.profileDir);

  if (opts.cloneFromBrowserProfile) {
    const browserPaths = getBrowserPaths(opts.browser);
    console.log(`Cloning ${browserPaths.displayName} profile "${opts.cloneFromBrowserProfile}"...`);
    await cloneBrowserProfile(opts.browser, opts.cloneFromBrowserProfile, opts.profileDir);
    if (!opts.profileDirectory) {
      opts.profileDirectory = opts.cloneFromBrowserProfile;
    }
  }

  console.log(
    opts.cdpUrl ? `Connecting to browser at ${opts.cdpUrl}` : `Launching ${getBrowserPaths(opts.browser).displayName} crawler browser...`,
  );
  let context;
  let browser = null;

  if (opts.cdpUrl) {
    browser = await chromium.connectOverCDP(opts.cdpUrl);
    context = browser.contexts()[0];
    if (!context) {
      context = await browser.newContext({ viewport: opts.viewport });
    }
  } else {
    const launchOptions = getPlaywrightLaunchOptions(opts.browser);
    context = await chromium.launchPersistentContext(opts.profileDir, {
      ...launchOptions,
      headless: false,
      viewport: opts.viewport,
      args: opts.profileDirectory ? [`--profile-directory=${opts.profileDirectory}`] : [],
    });
  }

  let page = context.pages()[0];
  if (!page) {
    page = await context.newPage();
  }

  const networkLog = [];
  const websocketLog = [];
  attachNetworkLogging(page, networkLog, websocketLog);

  console.log(`Navigating to ${opts.url}`);
  await page.goto(opts.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  if (!opts.autoStart) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log("");
    console.log("The browser should now show the Make editor.");
    console.log("Make sure you are logged in and the scenario editor is fully rendered.");
    await rl.question("Press Enter when you want the automated crawl to start... ");
    await rl.close();
  } else {
    console.log("Auto-start enabled; beginning crawl without waiting for terminal input.");
  }

  if (opts.replayPath) {
    const replayTrail = await readReplayPath(opts.replayPath);
    console.log(`Replaying ${replayTrail.length} saved step(s)...`);
    await executeReplayTrail(page, replayTrail, opts, path.join(opts.outDir, "00-replay"));
    if (opts.replayOnly) {
      const replaySnapshot = await waitForUsableUi(page, 30000);
      await captureState(page, path.join(opts.outDir, "01-replay-final"), replaySnapshot, {
        label: "replay-final",
        depth: replayTrail.length,
        mode: "replay-only",
        parentFingerprint: null,
      });
      await writeJson(path.join(opts.outDir, "manifest.json"), {
        exploredAt: new Date().toISOString(),
        mode: "replay-only",
        url: opts.url,
        replayPath: path.resolve(opts.replayPath),
        replaySteps: replayTrail.length,
        finalFingerprint: replaySnapshot.fingerprint,
      });
      console.log(`Replay finished. Final state saved to ${path.join(opts.outDir, "01-replay-final")}`);
      if (browser) {
        await browser.close().catch(() => {});
      } else {
        await context.close();
      }
      return;
    }
  }

  const baselineSnapshot = await waitForUsableUi(page, 45000);
  const taxonomyAggregate = {
    roles: new Set(),
    dataAttrs: new Set(),
    testIds: new Set(),
    classTokens: new Set(),
    overlayKinds: new Set(),
  };
  mergeTaxonomyIntoAggregate(taxonomyAggregate, baselineSnapshot.taxonomy);

  const runContext = {
    rootUrl: opts.url,
    interactionCount: 0,
    catalog: [],
    transitions: [],
    visitedStates: new Set(),
    taxonomyAggregate,
    pathsByFingerprint: new Map(),
  };

  await captureState(page, path.join(opts.outDir, "00-baseline"), baselineSnapshot, {
    label: "baseline",
    depth: 0,
    mode: "baseline",
    parentFingerprint: null,
  });
  await writeJson(path.join(opts.outDir, "00-baseline", "replay-path.json"), []);
  registerReplayPath(runContext, {
    label: "baseline",
    depth: 0,
    mode: "baseline",
    stateFingerprint: baselineSnapshot.fingerprint,
    captureDir: "00-baseline",
    trail: [],
  });

  console.log(`Baseline: ${baselineSnapshot.elements.length} elements, ${baselineSnapshot.overlays.length} overlays.`);

  await exploreState({
    page,
    opts,
    runContext,
    stateDir: path.join(opts.outDir, "01-root-exploration"),
    label: "root editor",
    depth: 0,
    parentFingerprint: baselineSnapshot.fingerprint,
    rootUrl: opts.url,
    mode: "root",
    trail: [],
  });

  await recoverRootPage(page, opts.url, opts.settleMs);
  const stableBaseline = await waitForUsableUi(page, 20000);
  try {
    await exploreContextMenus(page, opts, runContext, stableBaseline);
  } catch (error) {
    console.error(`Context menu exploration skipped after navigation issue: ${String(error)}`);
  }

  const networkSummary = summarizeNetwork(networkLog);
  const replayPaths = [...runContext.pathsByFingerprint.values()].sort(
    (left, right) => left.trail.length - right.trail.length || left.captureDir.localeCompare(right.captureDir),
  );
  await writeJson(path.join(opts.outDir, "catalog.json"), runContext.catalog);
  await writeJson(path.join(opts.outDir, "transitions.json"), runContext.transitions);
  await writeJson(path.join(opts.outDir, "replay-paths.json"), replayPaths);
  await writeJson(path.join(opts.outDir, "network-log.json"), networkLog);
  await writeJson(path.join(opts.outDir, "network-summary.json"), networkSummary);
  await writeJson(path.join(opts.outDir, "websocket-log.json"), websocketLog);
  await writeJson(path.join(opts.outDir, "ui-taxonomy-aggregate.json"), {
    roles: uniqueSorted([...runContext.taxonomyAggregate.roles]),
    dataAttrs: uniqueSorted([...runContext.taxonomyAggregate.dataAttrs]),
    testIds: uniqueSorted([...runContext.taxonomyAggregate.testIds]),
    classTokens: uniqueSorted([...runContext.taxonomyAggregate.classTokens]),
    overlayKinds: uniqueSorted([...runContext.taxonomyAggregate.overlayKinds]),
  });

  const report = generateMarkdownReport({
    runContext,
    baselineSnapshot,
    networkSummary,
    websocketLog,
  });
  await fs.writeFile(path.join(opts.outDir, "EXPLORATION-REPORT.md"), report, "utf8");

  await writeJson(path.join(opts.outDir, "manifest.json"), {
    exploredAt: new Date().toISOString(),
    url: opts.url,
    viewport: opts.viewport,
    settings: {
      settleMs: opts.settleMs,
      maxDepth: opts.maxDepth,
      maxInteractions: opts.maxInteractions,
      maxElementsPerState: opts.maxElementsPerState,
    },
    counts: {
      baselineElements: baselineSnapshot.elements.length,
      totalInteractions: runContext.interactionCount,
      catalogEntries: runContext.catalog.length,
      transitions: runContext.transitions.length,
      visitedStates: runContext.visitedStates.size,
      replayPaths: replayPaths.length,
      networkEntries: networkLog.length,
      networkSummaryEntries: networkSummary.length,
      websockets: websocketLog.length,
    },
  });

  console.log("");
  console.log(`Exploration finished. Interactions: ${runContext.interactionCount}`);
  console.log(`Visited states: ${runContext.visitedStates.size}`);
  console.log(`Results: ${opts.outDir}`);

  if (browser) {
    await browser.close().catch(() => {});
  } else {
    await context.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
