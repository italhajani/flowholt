/**
 * Automated Make.com Editor UI Crawler
 *
 * Systematically explores every interactive element in the Make scenario editor:
 * - Clicks buttons, tabs, toggles, menu items
 * - Opens dropdowns, modals, context menus
 * - Hovers for tooltips
 * - Right-clicks for context menus on canvas
 * - Captures screenshot + DOM summary at each state
 * - Produces a structured catalog of all discovered UI components
 *
 * Usage:
 *   node scripts/explore-make-editor.mjs --url https://us1.make.com/NNNN/scenarios/NNN/edit --clone-from-chrome-profile "Profile 2"
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { chromium } from "@playwright/test";

// ─── Configuration ───────────────────────────────────────────────────────────

const DEFAULTS = {
  url: null,
  outDir: path.resolve("research", "make-ui-exploration"),
  profileDir: path.resolve(".playwright", "make-ui-profile"),
  profileDirectory: null,
  cloneFromChromeProfile: null,
  settleMs: 1200,
  maxDepth: 3,
  maxInteractions: 500,
  viewport: { width: 1600, height: 1000 },
};

const SKIP_PATTERNS = [
  /delete/i, /remove/i, /erase/i, /clear all/i, /confirm/i,
  /disconnect/i, /deactivate/i, /uninstall/i, /revoke/i,
  /sign out/i, /log out/i, /logout/i,
];

const SAFE_CLOSE_KEYS = ["Escape"];

// ─── CLI ─────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`Automated Make.com Editor UI Crawler

Usage:
  node scripts/explore-make-editor.mjs --url <editor-url> [options]

Options:
  --url <url>                        Make scenario editor URL (required)
  --out <dir>                        Output directory (default: research/make-ui-exploration)
  --profile-dir <dir>                Playwright profile directory
  --profile-directory <name>         Chrome profile directory name (e.g. "Profile 2")
  --clone-from-chrome-profile <name> Clone a real Chrome profile for auth
  --settle-ms <ms>                   Wait time after each interaction (default: 1200)
  --max-depth <n>                    Max depth for recursive exploration (default: 3)
  --max-interactions <n>             Max total interactions (default: 500)
  --help                             Show this message

Workflow:
  1. Log in to Make in Chrome (e.g. Profile 2) and open a scenario editor.
  2. Run this script with --clone-from-chrome-profile "Profile 2".
  3. The script opens the editor, waits for your confirmation, then auto-explores.
  4. Results saved to --out directory with screenshots, DOM summaries, and catalog.
`);
}

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help") { printHelp(); process.exit(0); }
    if (a === "--url") { opts.url = argv[++i]; continue; }
    if (a === "--out") { opts.outDir = path.resolve(argv[++i]); continue; }
    if (a === "--profile-dir") { opts.profileDir = path.resolve(argv[++i]); continue; }
    if (a === "--profile-directory") { opts.profileDirectory = argv[++i]; continue; }
    if (a === "--clone-from-chrome-profile") { opts.cloneFromChromeProfile = argv[++i]; continue; }
    if (a === "--settle-ms") { opts.settleMs = Number(argv[++i]) || DEFAULTS.settleMs; continue; }
    if (a === "--max-depth") { opts.maxDepth = Number(argv[++i]) || DEFAULTS.maxDepth; continue; }
    if (a === "--max-interactions") { opts.maxInteractions = Number(argv[++i]) || DEFAULTS.maxInteractions; continue; }
  }
  return opts;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

async function ensureDir(p) { await fs.mkdir(p, { recursive: true }); }

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function writeJson(p, v) {
  await fs.writeFile(p, JSON.stringify(v, null, 2) + "\n", "utf8");
}

function slug(s) {
  return (s || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function isSafeLabel(text) {
  if (!text) return true;
  return !SKIP_PATTERNS.some((p) => p.test(text));
}

async function cloneChromeProfile(src, target) {
  const chromeData = path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "User Data");
  const srcDir = path.join(chromeData, src);
  const srcLocal = path.join(chromeData, "Local State");
  if (!(await pathExists(srcDir))) throw new Error(`Chrome profile not found: ${srcDir}`);
  await ensureDir(target);
  if (await pathExists(srcLocal)) await fs.copyFile(srcLocal, path.join(target, "Local State"));
  const dest = path.join(target, src);
  await fs.rm(dest, { recursive: true, force: true });
  await fs.cp(srcDir, dest, { recursive: true, force: true });
}

// ─── DOM Discovery ───────────────────────────────────────────────────────────

async function discoverInteractiveElements(page) {
  return page.evaluate(() => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const seen = new Set();
    const results = [];

    const selectors = [
      "button:not([disabled])",
      "[role='button']:not([disabled])",
      "[role='tab']",
      "[role='menuitem']",
      "[role='switch']",
      "[role='option']",
      "[role='checkbox']",
      "[role='radio']",
      "a[href]",
      "select",
      "[data-testid]",
      "[class*='clickable']",
      "[class*='Clickable']",
      "[class*='toggle']",
      "[class*='Toggle']",
      "[class*='dropdown']",
      "[class*='Dropdown']",
      "[class*='menu-item']",
      "[class*='MenuItem']",
      "[class*='tab']",
      "[class*='Tab']:not(table)",
      ".imt-module",          // Make scenario module nodes
      "[class*='module']",    // Make module elements
      "[class*='toolbar'] button",
      "[class*='Toolbar'] button",
      "[class*='sidebar'] [role='button']",
      "[class*='Sidebar'] [role='button']",
    ];

    for (const sel of selectors) {
      for (const el of document.querySelectorAll(sel)) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.x < 0 || rect.y < 0) continue;

        const key = `${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.width)},${Math.round(rect.height)}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const text = norm(el.innerText || el.textContent || "").slice(0, 200);
        const ariaLabel = el.getAttribute("aria-label") || "";
        const title = el.getAttribute("title") || "";
        const testId = el.getAttribute("data-testid") || "";
        const role = el.getAttribute("role") || "";
        const tag = el.tagName.toLowerCase();
        const id = el.id || "";
        const cls = (typeof el.className === "string" ? el.className : "").slice(0, 300);

        results.push({
          selector: sel,
          tag,
          id,
          className: cls,
          role,
          text,
          ariaLabel,
          title,
          testId,
          disabled: !!el.disabled,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          centerX: Math.round(rect.x + rect.width / 2),
          centerY: Math.round(rect.y + rect.height / 2),
          label: ariaLabel || title || text || testId || `${tag}#${id}`,
        });
      }
    }

    // Sort by position: top-left first
    results.sort((a, b) => a.y - b.y || a.x - b.x);
    return results;
  });
}

async function discoverOverlays(page) {
  return page.evaluate(() => {
    const results = [];
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
      "[class*='dropdown-menu']",
      "[class*='DropdownMenu']",
      "[class*='context-menu']",
      "[class*='ContextMenu']",
      "[class*='tooltip']",
      "[class*='Tooltip']",
      "[class*='panel'][class*='open']",
    ];

    for (const sel of selectors) {
      for (const el of document.querySelectorAll(sel)) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        results.push({
          selector: sel,
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute("role") || "",
          className: (typeof el.className === "string" ? el.className : "").slice(0, 300),
          text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 500),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    }
    return results;
  });
}

async function extractFullDomSummary(page) {
  return page.evaluate(() => {
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const collect = (sel) =>
      Array.from(document.querySelectorAll(sel)).slice(0, 300).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName, id: el.id || null,
          className: typeof el.className === "string" ? el.className : null,
          role: el.getAttribute("role"),
          ariaLabel: el.getAttribute("aria-label"),
          testId: el.getAttribute("data-testid"),
          text: norm(el.innerText || el.textContent || "").slice(0, 200),
          visible: r.width > 0 && r.height > 0,
          x: Math.round(r.x), y: Math.round(r.y),
          w: Math.round(r.width), h: Math.round(r.height),
        };
      });

    return {
      url: location.href,
      title: document.title,
      domNodes: document.querySelectorAll("*").length,
      headings: collect("h1,h2,h3,h4,h5,h6"),
      buttons: collect("button,[role='button']"),
      inputs: collect("input,textarea,select"),
      tabs: collect("[role='tab']"),
      dialogs: collect("[role='dialog'],[role='alertdialog']"),
      menus: collect("[role='menu'],[role='menuitem']"),
      switches: collect("[role='switch']"),
      tooltips: collect("[role='tooltip']"),
      links: collect("a[href]"),
      dataAttrs: Array.from(new Set(
        Array.from(document.querySelectorAll("*")).flatMap((el) =>
          Array.from(el.attributes)
            .filter((a) => a.name.startsWith("data-"))
            .map((a) => a.name)
        )
      )).sort(),
    };
  });
}

// ─── Interaction Engine ──────────────────────────────────────────────────────

async function captureState(page, stateDir, label) {
  await ensureDir(stateDir);

  await page.screenshot({
    path: path.join(stateDir, "screenshot.png"),
    animations: "disabled",
  }).catch(() => {});

  const summary = await extractFullDomSummary(page).catch((e) => ({ error: String(e) }));
  await writeJson(path.join(stateDir, "dom-summary.json"), summary);

  const overlays = await discoverOverlays(page).catch(() => []);
  if (overlays.length > 0) {
    await writeJson(path.join(stateDir, "overlays.json"), overlays);
  }

  const text = await page.evaluate(() =>
    (document.body?.innerText || "").replace(/\r\n/g, "\n")
  ).catch(() => "");
  await fs.writeFile(path.join(stateDir, "visible-text.txt"), text, "utf8");

  return { label, overlayCount: overlays.length, domNodes: summary.domNodes || 0 };
}

async function tryDismissOverlays(page) {
  for (const key of SAFE_CLOSE_KEYS) {
    await page.keyboard.press(key);
    await page.waitForTimeout(300);
  }
  // Click outside any modal (top-left corner of viewport, typically safe)
  await page.mouse.click(1, 1).catch(() => {});
  await page.waitForTimeout(300);
}

async function interactWithElement(page, el, stateDir, opts) {
  const { settleMs } = opts;
  const beforeOverlays = await discoverOverlays(page).catch(() => []);

  // Click the element by coordinates
  try {
    await page.mouse.click(el.centerX, el.centerY);
  } catch (err) {
    return { success: false, error: String(err), newOverlays: 0 };
  }

  await page.waitForTimeout(settleMs);

  // Check what changed
  const afterOverlays = await discoverOverlays(page).catch(() => []);
  const newOverlayCount = Math.max(0, afterOverlays.length - beforeOverlays.length);

  // Capture the post-interaction state
  const result = await captureState(page, stateDir, el.label);
  result.newOverlays = newOverlayCount;
  result.afterOverlays = afterOverlays;
  result.success = true;

  return result;
}

async function exploreContextMenu(page, x, y, stateDir, opts) {
  await page.mouse.click(x, y, { button: "right" });
  await page.waitForTimeout(opts.settleMs);

  const overlays = await discoverOverlays(page).catch(() => []);
  const menuItems = await page.evaluate(() => {
    const items = document.querySelectorAll("[role='menuitem'], [role='menu'] [role='button']");
    return Array.from(items).map((el) => ({
      text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 200),
      ariaLabel: el.getAttribute("aria-label") || "",
      role: el.getAttribute("role") || "",
    }));
  }).catch(() => []);

  if (overlays.length > 0 || menuItems.length > 0) {
    await captureState(page, stateDir, "context-menu");
    await writeJson(path.join(stateDir, "context-menu-items.json"), menuItems);
  }

  await tryDismissOverlays(page);
  return { overlays, menuItems };
}

async function exploreHover(page, el, stateDir, opts) {
  await page.mouse.move(el.centerX, el.centerY);
  await page.waitForTimeout(800);

  const tooltips = await page.evaluate(() => {
    const tips = document.querySelectorAll("[role='tooltip'], [class*='tooltip'], [class*='Tooltip']");
    return Array.from(tips)
      .filter((t) => { const r = t.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((t) => ({
        text: (t.innerText || "").trim().slice(0, 300),
        className: typeof t.className === "string" ? t.className.slice(0, 200) : "",
      }));
  }).catch(() => []);

  if (tooltips.length > 0) {
    await page.screenshot({
      path: path.join(stateDir, "hover-tooltip.png"),
      animations: "disabled",
    }).catch(() => {});
    await writeJson(path.join(stateDir, "tooltips.json"), tooltips);
  }

  return tooltips;
}

// ─── Main Exploration Loop ───────────────────────────────────────────────────

async function explore(page, opts) {
  const { outDir, settleMs, maxInteractions, maxDepth } = opts;
  const catalog = [];
  let interactionCount = 0;

  // Phase 0: Capture baseline
  console.log("\n=== Phase 0: Capturing baseline state ===");
  const baselineDir = path.join(outDir, "00-baseline");
  await captureState(page, baselineDir, "baseline");

  const baselineElements = await discoverInteractiveElements(page);
  await writeJson(path.join(baselineDir, "interactive-elements.json"), baselineElements);
  console.log(`  Found ${baselineElements.length} interactive elements`);

  // Phase 1: Classify elements by region
  console.log("\n=== Phase 1: Classifying elements by region ===");
  const viewport = page.viewportSize();
  const regions = {
    toolbar: [], sidebar: [], canvas: [], panel: [], statusbar: [], other: [],
  };

  for (const el of baselineElements) {
    if (el.y < 60) regions.toolbar.push(el);
    else if (el.x < 250) regions.sidebar.push(el);
    else if (el.x > viewport.width - 350 && el.y > 60) regions.panel.push(el);
    else if (el.y > viewport.height - 60) regions.statusbar.push(el);
    else if (el.x >= 250 && el.x <= viewport.width - 350) regions.canvas.push(el);
    else regions.other.push(el);
  }

  for (const [region, els] of Object.entries(regions)) {
    console.log(`  ${region}: ${els.length} elements`);
  }
  await writeJson(path.join(outDir, "element-regions.json"), regions);

  // Phase 2: Systematic click exploration
  console.log("\n=== Phase 2: Systematic click exploration ===");

  // Explore regions in order: toolbar → sidebar → panel → statusbar → canvas → other
  const explorationOrder = ["toolbar", "sidebar", "panel", "statusbar", "canvas", "other"];

  for (const regionName of explorationOrder) {
    const elements = regions[regionName];
    if (elements.length === 0) continue;

    console.log(`\n--- Exploring ${regionName} (${elements.length} elements) ---`);
    const regionDir = path.join(outDir, `01-${regionName}`);
    await ensureDir(regionDir);

    for (const el of elements) {
      if (interactionCount >= maxInteractions) {
        console.log("  Max interactions reached, stopping.");
        break;
      }

      // Safety check
      if (!isSafeLabel(el.text) || !isSafeLabel(el.ariaLabel)) {
        console.log(`  SKIP (unsafe): "${el.label}"`);
        catalog.push({ ...el, region: regionName, action: "skipped-unsafe" });
        continue;
      }

      const elSlug = slug(el.label || `${el.tag}-${el.x}-${el.y}`);
      const elDir = path.join(regionDir, `${String(interactionCount).padStart(3, "0")}-${elSlug}`);

      console.log(`  [${interactionCount}] Click: "${el.label}" (${el.tag} @ ${el.x},${el.y})`);

      // Save element metadata
      await ensureDir(elDir);
      await writeJson(path.join(elDir, "element.json"), { ...el, region: regionName });

      // Hover first to discover tooltips
      const tooltips = await exploreHover(page, el, elDir, opts);

      // Click the element
      const result = await interactWithElement(page, el, elDir, opts);

      // If new overlays appeared, explore them
      if (result.success && result.newOverlays > 0) {
        console.log(`    → ${result.newOverlays} new overlay(s) appeared`);

        // Capture overlay contents
        const overlayDir = path.join(elDir, "overlay");
        await ensureDir(overlayDir);

        // Discover interactive elements within the overlay
        const overlayElements = await discoverInteractiveElements(page);
        const newElements = overlayElements.filter((oel) => {
          // Elements that weren't in the baseline
          return !baselineElements.some((bel) =>
            bel.x === oel.x && bel.y === oel.y &&
            bel.width === oel.width && bel.height === oel.height
          );
        });

        await writeJson(path.join(overlayDir, "new-elements.json"), newElements);
        console.log(`    → ${newElements.length} new elements in overlay`);

        // Take screenshot of overlay state
        await page.screenshot({
          path: path.join(overlayDir, "overlay-state.png"),
          animations: "disabled",
        }).catch(() => {});

        // Dismiss the overlay
        await tryDismissOverlays(page);
        await page.waitForTimeout(500);
      } else if (result.success) {
        // Check if the URL changed (navigation)
        const currentUrl = page.url();
        if (currentUrl !== opts.url) {
          console.log(`    → URL changed to: ${currentUrl}`);
          await page.goto(opts.url, { waitUntil: "domcontentloaded" });
          await page.waitForTimeout(settleMs);
        }

        // Dismiss any overlay that might have opened
        await tryDismissOverlays(page);
        await page.waitForTimeout(300);
      }

      catalog.push({
        ...el,
        region: regionName,
        action: "clicked",
        tooltips: tooltips.length > 0 ? tooltips : undefined,
        newOverlays: result.newOverlays || 0,
        captureDir: path.relative(outDir, elDir),
      });

      interactionCount++;
    }

    if (interactionCount >= maxInteractions) break;
  }

  // Phase 3: Context menu exploration on canvas
  console.log("\n=== Phase 3: Context menu exploration ===");
  const contextMenuDir = path.join(outDir, "02-context-menus");
  await ensureDir(contextMenuDir);

  // Right-click at several canvas positions
  const canvasPositions = [
    { x: Math.round(viewport.width / 2), y: Math.round(viewport.height / 2), label: "canvas-center" },
    { x: 400, y: 300, label: "canvas-top-left" },
    { x: Math.round(viewport.width / 2), y: 200, label: "canvas-top-center" },
  ];

  // Also right-click on any discovered module/node elements
  const moduleElements = baselineElements.filter((el) =>
    el.className.includes("module") || el.className.includes("Module") ||
    el.className.includes("imt-") || el.testId?.includes("module")
  );
  for (const mel of moduleElements.slice(0, 5)) {
    canvasPositions.push({ x: mel.centerX, y: mel.centerY, label: `module-${slug(mel.label)}` });
  }

  for (const pos of canvasPositions) {
    const ctxDir = path.join(contextMenuDir, pos.label);
    console.log(`  Right-click: ${pos.label} (${pos.x}, ${pos.y})`);
    await exploreContextMenu(page, pos.x, pos.y, ctxDir, opts);
  }

  // Phase 4: Double-click exploration (opens node settings in Make)
  console.log("\n=== Phase 4: Double-click exploration on modules ===");
  const dblClickDir = path.join(outDir, "03-double-click");
  await ensureDir(dblClickDir);

  for (const mel of moduleElements.slice(0, 10)) {
    const elDir = path.join(dblClickDir, slug(mel.label));
    console.log(`  Double-click: "${mel.label}" (${mel.centerX}, ${mel.centerY})`);
    await ensureDir(elDir);

    await page.mouse.dblclick(mel.centerX, mel.centerY);
    await page.waitForTimeout(settleMs * 2); // longer wait for panel to render

    await captureState(page, elDir, `dblclick-${mel.label}`);

    // Discover panel contents
    const panelElements = await discoverInteractiveElements(page);
    const newElements = panelElements.filter((pel) =>
      !baselineElements.some((bel) =>
        bel.x === pel.x && bel.y === pel.y &&
        bel.width === pel.width && bel.height === pel.height
      )
    );
    await writeJson(path.join(elDir, "panel-elements.json"), newElements);
    console.log(`    → ${newElements.length} new elements in panel`);

    // Dismiss
    await tryDismissOverlays(page);
    await page.waitForTimeout(500);
  }

  // Phase 5: Generate catalog
  console.log("\n=== Phase 5: Generating catalog ===");
  await writeJson(path.join(outDir, "catalog.json"), catalog);

  // Generate markdown summary
  const md = generateMarkdownReport(catalog, regions, interactionCount);
  await fs.writeFile(path.join(outDir, "EXPLORATION-REPORT.md"), md, "utf8");

  console.log(`\nDone! ${interactionCount} interactions, ${catalog.length} catalog entries.`);
  console.log(`Results: ${outDir}`);
  console.log(`Report:  ${path.join(outDir, "EXPLORATION-REPORT.md")}`);

  return catalog;
}

function generateMarkdownReport(catalog, regions, totalInteractions) {
  const lines = [
    "# Make.com Editor UI Exploration Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Total interactions: ${totalInteractions}`,
    `Total catalog entries: ${catalog.length}`,
    "",
    "## Element Counts by Region",
    "",
    "| Region | Elements | Clicked | Skipped |",
    "|---|---|---|---|",
  ];

  for (const [region, elements] of Object.entries(regions)) {
    const clicked = catalog.filter((e) => e.region === region && e.action === "clicked").length;
    const skipped = catalog.filter((e) => e.region === region && e.action === "skipped-unsafe").length;
    lines.push(`| ${region} | ${elements.length} | ${clicked} | ${skipped} |`);
  }

  lines.push("", "## Elements That Produced Overlays", "");
  const overlayProducers = catalog.filter((e) => (e.newOverlays || 0) > 0);
  if (overlayProducers.length === 0) {
    lines.push("None detected.");
  } else {
    lines.push("| Label | Region | Tag | Overlays |");
    lines.push("|---|---|---|---|");
    for (const e of overlayProducers) {
      lines.push(`| ${e.label.slice(0, 60)} | ${e.region} | ${e.tag} | ${e.newOverlays} |`);
    }
  }

  lines.push("", "## Elements With Tooltips", "");
  const tooltipElements = catalog.filter((e) => e.tooltips && e.tooltips.length > 0);
  if (tooltipElements.length === 0) {
    lines.push("None detected.");
  } else {
    lines.push("| Label | Tooltip Text |");
    lines.push("|---|---|");
    for (const e of tooltipElements) {
      const tipText = e.tooltips.map((t) => t.text).join("; ");
      lines.push(`| ${e.label.slice(0, 60)} | ${tipText.slice(0, 120)} |`);
    }
  }

  lines.push("", "## Unsafe Elements (Skipped)", "");
  const skipped = catalog.filter((e) => e.action === "skipped-unsafe");
  if (skipped.length === 0) {
    lines.push("None.");
  } else {
    for (const e of skipped) {
      lines.push(`- **${e.label.slice(0, 80)}** (${e.region}, ${e.tag})`);
    }
  }

  lines.push("", "## All Discovered Elements", "");
  lines.push("| # | Region | Tag | Role | Label | Overlays |");
  lines.push("|---|---|---|---|---|---|");
  catalog.forEach((e, i) => {
    lines.push(`| ${i} | ${e.region} | ${e.tag} | ${e.role || "-"} | ${e.label.slice(0, 50)} | ${e.newOverlays || 0} |`);
  });

  lines.push("");
  return lines.join("\n");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.url) {
    console.error("Error: --url is required. Provide a Make scenario editor URL.");
    console.error("Example: node scripts/explore-make-editor.mjs --url https://us1.make.com/NNNN/scenarios/NNN/edit");
    process.exit(1);
  }

  await ensureDir(opts.outDir);
  await ensureDir(opts.profileDir);

  // Clone Chrome profile if requested
  if (opts.cloneFromChromeProfile) {
    console.log(`Cloning Chrome profile "${opts.cloneFromChromeProfile}"...`);
    await cloneChromeProfile(opts.cloneFromChromeProfile, opts.profileDir);
    if (!opts.profileDirectory) opts.profileDirectory = opts.cloneFromChromeProfile;
    console.log("Profile cloned.");
  }

  // Launch browser
  console.log("Launching browser...");
  const context = await chromium.launchPersistentContext(opts.profileDir, {
    channel: "chrome",
    headless: false,
    viewport: opts.viewport,
    args: opts.profileDirectory ? [`--profile-directory=${opts.profileDirectory}`] : [],
  });

  let page = context.pages()[0] || await context.newPage();

  // Intercept and log network requests (for API discovery)
  const apiCalls = [];
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/api/") || url.includes("/graphql") || url.includes("/v2/")) {
      apiCalls.push({
        method: req.method(),
        url,
        resourceType: req.resourceType(),
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Navigate
  console.log(`Navigating to: ${opts.url}`);
  await page.goto(opts.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000); // Extra wait for React to render

  // Ask user to confirm the page is ready
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  console.log("\n────────────────────────────────────────────");
  console.log("The browser should now show the Make editor.");
  console.log("Make sure you're logged in and the scenario editor is fully loaded.");
  await rl.question("Press Enter when ready to start automated exploration... ");
  rl.close();

  // Run exploration
  const catalog = await explore(page, opts);

  // Save API calls log
  await writeJson(path.join(opts.outDir, "api-calls.json"), apiCalls);
  console.log(`\nLogged ${apiCalls.length} API calls to api-calls.json`);

  // Save final combined manifest
  await writeJson(path.join(opts.outDir, "manifest.json"), {
    url: opts.url,
    exploredAt: new Date().toISOString(),
    totalElements: catalog.length,
    totalApiCalls: apiCalls.length,
    viewport: opts.viewport,
    settings: {
      settleMs: opts.settleMs,
      maxDepth: opts.maxDepth,
      maxInteractions: opts.maxInteractions,
    },
  });

  await context.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
