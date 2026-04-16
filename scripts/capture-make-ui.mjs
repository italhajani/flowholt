import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { chromium } from "@playwright/test";

const DEFAULTS = {
  url: "https://www.make.com/",
  outDir: path.resolve("research", "make-ui-captures"),
  profileDir: path.resolve(".playwright", "make-ui-profile"),
  profileDirectory: null,
  settleMs: 1500,
  saveStorageState: false,
  cloneFromChromeProfile: null,
  viewport: { width: 1600, height: 1000 },
};

function printHelp() {
  console.log(`Capture React-heavy Make UI states with Playwright.

Usage:
  npm run capture:make-ui -- --url https://www.make.com/en/ --out research/make-ui

Options:
  --url <url>             Starting URL to open
  --out <dir>             Output directory for captured states
  --profile-dir <dir>     Persistent browser profile directory
  --profile-directory <n> Chrome profile directory name like "Profile 2"
  --clone-from-chrome-profile <n>
                          Clone a real Chrome profile into the Playwright profile dir first
  --settle-ms <ms>        Delay before each capture (default: 1500)
  --save-storage-state    Save cookies/local storage state for replay
  --help                  Show this message

Workflow:
  1. Run the script in headed mode.
  2. Log in to Make and open the exact editor state you want.
  3. In the terminal, enter a label for each state you want captured.
  4. Move the UI to the next configuration and repeat.
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
    if (arg === "--save-storage-state") {
      options.saveStorageState = true;
      continue;
    }
    if (arg === "--url") {
      options.url = argv[index + 1];
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
    if (arg === "--clone-from-chrome-profile") {
      options.cloneFromChromeProfile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--settle-ms") {
      options.settleMs = Number(argv[index + 1]) || DEFAULTS.settleMs;
      index += 1;
    }
  }
  return options;
}

function sanitizeLabel(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function cloneChromeProfile(sourceProfileName, targetUserDataDir) {
  const chromeUserDataDir = path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "User Data");
  const sourceProfileDir = path.join(chromeUserDataDir, sourceProfileName);
  const sourceLocalState = path.join(chromeUserDataDir, "Local State");

  if (!(await pathExists(sourceProfileDir))) {
    throw new Error(`Chrome profile not found: ${sourceProfileDir}`);
  }

  await ensureDir(targetUserDataDir);

  if (await pathExists(sourceLocalState)) {
    await fs.copyFile(sourceLocalState, path.join(targetUserDataDir, "Local State"));
  }

  const targetProfileDir = path.join(targetUserDataDir, sourceProfileName);
  await fs.rm(targetProfileDir, { recursive: true, force: true });
  await fs.cp(sourceProfileDir, targetProfileDir, { recursive: true, force: true });
}

async function safeText(page) {
  try {
    return await page.evaluate(() => (document.body?.innerText || "").replace(/\r\n/g, "\n"));
  } catch (error) {
    return `Unable to read visible text: ${String(error)}`;
  }
}

async function summarizeFrame(frame) {
  return frame.evaluate(() => {
    const normalize = (value) => value.replace(/\s+/g, " ").trim();
    const summarizeNode = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        id: element.id || null,
        className: typeof element.className === "string" ? element.className : null,
        role: element.getAttribute("role"),
        name: element.getAttribute("name"),
        type: element.getAttribute("type"),
        placeholder: element.getAttribute("placeholder"),
        ariaLabel: element.getAttribute("aria-label"),
        href: element.getAttribute("href"),
        disabled: "disabled" in element ? Boolean(element.disabled) : false,
        visible: rect.width > 0 && rect.height > 0,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        text: normalize(element.innerText || element.textContent || "").slice(0, 240),
      };
    };

    const collect = (selector) =>
      Array.from(document.querySelectorAll(selector))
        .slice(0, 500)
        .map((element) => summarizeNode(element));

    return {
      title: document.title,
      url: location.href,
      readyState: document.readyState,
      domNodeCount: document.querySelectorAll("*").length,
      headings: collect("h1, h2, h3, h4, h5, h6"),
      buttons: collect("button, [role='button']"),
      inputs: collect("input, textarea, select"),
      links: collect("a[href]"),
      tabs: collect("[role='tab']"),
      dialogs: collect("[role='dialog']"),
      menus: collect("[role='menu'], [role='menuitem']"),
      labels: collect("label"),
      toggles: collect("[role='switch'], [aria-checked='true'], [aria-checked='false']"),
      comboboxes: collect("[role='combobox']"),
      resources: performance
        .getEntriesByType("resource")
        .slice(-250)
        .map((entry) => ({
          name: entry.name,
          initiatorType: entry.initiatorType,
          duration: Math.round(entry.duration),
        })),
    };
  });
}

async function captureFrame(frame, frameDir, index) {
  const prefix = `frame-${String(index).padStart(2, "0")}`;
  const metadataPath = path.join(frameDir, `${prefix}.summary.json`);
  const htmlPath = path.join(frameDir, `${prefix}.html`);

  try {
    const summary = await summarizeFrame(frame);
    await writeJson(metadataPath, summary);
  } catch (error) {
    await fs.writeFile(metadataPath, `${String(error)}\n`, "utf8");
  }

  try {
    const html = await frame.content();
    await fs.writeFile(htmlPath, html, "utf8");
  } catch (error) {
    await fs.writeFile(htmlPath, `Unable to save frame HTML: ${String(error)}\n`, "utf8");
  }
}

async function captureState({ page, context, outDir, label, index, note, settleMs, saveStorageState }) {
  const stateSlug = sanitizeLabel(label) || `state-${index}`;
  const stateDir = path.join(outDir, `${String(index).padStart(2, "0")}-${stateSlug}`);
  const framesDir = path.join(stateDir, "frames");

  await ensureDir(framesDir);
  await page.waitForTimeout(settleMs);

  const metadata = {
    capturedAt: new Date().toISOString(),
    label,
    note,
    url: page.url(),
    title: await page.title().catch(() => null),
    viewport: page.viewportSize(),
    frameCount: page.frames().length,
  };

  await writeJson(path.join(stateDir, "meta.json"), metadata);

  const mainHtml = await page.content().catch((error) => `Unable to save page HTML: ${String(error)}`);
  await fs.writeFile(path.join(stateDir, "page.html"), mainHtml, "utf8");
  await fs.writeFile(path.join(stateDir, "visible-text.txt"), await safeText(page), "utf8");

  await page.screenshot({
    path: path.join(stateDir, "viewport.png"),
    animations: "disabled",
  });

  try {
    await page.screenshot({
      path: path.join(stateDir, "full-page.png"),
      fullPage: true,
      animations: "disabled",
    });
  } catch (error) {
    await fs.writeFile(path.join(stateDir, "full-page-error.txt"), `${String(error)}\n`, "utf8");
  }

  const mainSummary = await summarizeFrame(page.mainFrame()).catch((error) => ({
    error: String(error),
  }));
  await writeJson(path.join(stateDir, "page-summary.json"), mainSummary);

  const frames = page.frames();
  const frameManifest = frames.map((frame, frameIndex) => ({
    index: frameIndex,
    name: frame.name() || null,
    url: frame.url(),
    parentUrl: frame.parentFrame()?.url() || null,
  }));
  await writeJson(path.join(stateDir, "frames.json"), frameManifest);

  for (const [frameIndex, frame] of frames.entries()) {
    await captureFrame(frame, framesDir, frameIndex);
  }

  if (saveStorageState) {
    await context.storageState({ path: path.join(stateDir, "storage-state.json") });
  }

  return stateDir;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await ensureDir(options.outDir);
  await ensureDir(options.profileDir);

  if (options.cloneFromChromeProfile) {
    await cloneChromeProfile(options.cloneFromChromeProfile, options.profileDir);
    if (!options.profileDirectory) {
      options.profileDirectory = options.cloneFromChromeProfile;
    }
  }

  const context = await chromium.launchPersistentContext(options.profileDir, {
    channel: "chrome",
    headless: false,
    viewport: options.viewport,
    args: options.profileDirectory ? [`--profile-directory=${options.profileDirectory}`] : [],
  });

  let page = context.pages()[0];
  if (!page) {
    page = await context.newPage();
  }

  await page.goto(options.url, { waitUntil: "domcontentloaded" });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`Profile directory: ${options.profileDir}`);
  console.log(`Capture output: ${options.outDir}`);
  console.log("Log in to Make, open the editor state you want, then return here.");
  await rl.question("Press Enter when the browser is ready for the first capture.");

  let captureIndex = 1;
  while (true) {
    const label = (await rl.question(`Label for capture ${captureIndex} (blank or 'done' to finish): `)).trim();
    if (!label || label.toLowerCase() === "done") {
      break;
    }

    const note = (await rl.question("Optional note for this state: ")).trim();
    const savedDir = await captureState({
      page,
      context,
      outDir: options.outDir,
      label,
      index: captureIndex,
      note,
      settleMs: options.settleMs,
      saveStorageState: options.saveStorageState,
    });

    console.log(`Saved capture ${captureIndex} to ${savedDir}`);
    console.log("Move the browser to the next UI state, then enter the next label here.");
    captureIndex += 1;
  }

  await rl.close();
  await context.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
