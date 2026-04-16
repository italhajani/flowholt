import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/inspect_local_pdf.mjs <pdf-path> [output-dir]");
  process.exit(1);
}

const pdfPath = path.resolve(args[0]);
const outputDir = path.resolve(args[1] ?? "research/pdf-inspection");

if (!fs.existsSync(pdfPath)) {
  console.error(`PDF not found: ${pdfPath}`);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const fileUrl = `file:///${pdfPath.replace(/\\/g, "/")}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });

try {
  await page.goto(fileUrl, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(5000);

  const viewerInfo = await page.evaluate(() => {
    const text = document.body?.innerText ?? "";
    const html = document.documentElement?.outerHTML ?? "";
    return {
      title: document.title,
      url: location.href,
      textSnippet: text.slice(0, 8000),
      htmlSnippet: html.slice(0, 12000),
    };
  });

  fs.writeFileSync(
    path.join(outputDir, "viewer-info.json"),
    JSON.stringify(viewerInfo, null, 2),
    "utf8",
  );

  await page.screenshot({
    path: path.join(outputDir, "page-viewport.png"),
    fullPage: false,
  });

  try {
    await page.screenshot({
      path: path.join(outputDir, "page-full.png"),
      fullPage: true,
    });
  } catch {
    // PDF viewers may not support a reliable full-page capture.
  }
} finally {
  await browser.close();
}
