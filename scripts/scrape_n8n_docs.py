"""Scrape docs.n8n.io into RAG-friendly markdown and local assets.

Usage:
  python scripts/scrape_n8n_docs.py
  python scripts/scrape_n8n_docs.py --output research/n8n-docs-export
  python scripts/scrape_n8n_docs.py --limit 20          # quick test run
  python scripts/scrape_n8n_docs.py --resume            # continue interrupted run

n8n docs use MkDocs Material theme. Content lives in <article> or .md-content__inner.
Sitemap: https://docs.n8n.io/sitemap.xml
"""

import argparse
import asyncio
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any
from urllib.parse import urlparse, urlunparse

import httpx
from markdownify import markdownify as md
from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from playwright.async_api import async_playwright

BASE_URL = "https://docs.n8n.io"
SITEMAP_URL = f"{BASE_URL}/sitemap.xml"
SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
FILE_LINK_RE = re.compile(r"\.(?:pdf|ppt|pptx|doc|docx|xls|xlsx|zip|rar|7z|csv|json|txt|xml)$", re.I)


def normalize_url(url: str) -> str:
    parsed = urlparse(url.strip())
    path = parsed.path or "/"
    if path != "/" and path.endswith("/"):
        path = path.rstrip("/")
    return urlunparse((parsed.scheme, parsed.netloc, path, "", "", ""))


def slug_for_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/") or "index"
    path = re.sub(r"[^\w\-/]", "_", path)
    return path.replace("/", "__")


def asset_filename(url: str, content_type: str | None = None) -> str:
    parsed = urlparse(url)
    original_name = Path(parsed.path).name or "asset"
    stem = re.sub(r"[^\w.-]", "_", Path(original_name).stem) or "asset"
    suffix = Path(original_name).suffix
    if not suffix and content_type:
        guessed = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/svg+xml": ".svg",
            "image/gif": ".gif",
            "application/pdf": ".pdf",
            "text/plain": ".txt",
        }
        suffix = guessed.get(content_type.split(";")[0].strip().lower(), "")
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]
    return f"{stem}__{digest}{suffix}"


def strip_noise(markdown: str) -> str:
    markdown = markdown.replace("\r\n", "\n")
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    markdown = re.sub(r"[ \t]+\n", "\n", markdown)
    return markdown.strip()


async def fetch_sitemap(client: httpx.AsyncClient) -> list[str]:
    """Fetch sitemap.xml and return all page URLs.

    n8n docs may nest sitemap indexes — handle both flat and nested structures.
    """
    urls: list[str] = []

    async def _fetch_one(sitemap_url: str) -> None:
        try:
            response = await client.get(sitemap_url, timeout=60)
            response.raise_for_status()
            root = ET.fromstring(response.text)
            # Nested sitemap index (sitemapindex → sitemap → loc)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            nested = [node.text for node in root.findall(".//sm:sitemap/sm:loc", ns) if node.text]
            if nested:
                for child in nested:
                    await _fetch_one(child)
                return
            # Flat urlset
            for node in root.findall(".//sm:loc", ns):
                if node.text:
                    normalized = normalize_url(node.text)
                    if normalized.startswith(BASE_URL):
                        urls.append(normalized)
        except Exception as exc:
            print(f"[sitemap-error] {sitemap_url} -> {exc}")

    await _fetch_one(SITEMAP_URL)
    return urls


async def auto_scroll(page: Any) -> None:
    await page.evaluate(
        """async () => {
          await new Promise((resolve) => {
            let total = 0;
            const step = 800;
            const timer = setInterval(() => {
              window.scrollBy(0, step);
              total += step;
              if (total >= document.body.scrollHeight + 800) {
                clearInterval(timer);
                window.scrollTo(0, 0);
                resolve();
              }
            }, 120);
          });
        }"""
    )


async def expand_content(page: Any) -> None:
    """Expand collapsed sections (details, accordion) for full content extraction."""
    await page.evaluate(
        """() => {
          const scopeRoots = Array.from(document.querySelectorAll(
            'main, article, [role="main"], .content, .article-body, .md-content, .md-content__inner'
          ));
          const withinContent = (el) => scopeRoots.length === 0 || scopeRoots.some((root) => root.contains(el));

          document.querySelectorAll('details').forEach((el) => {
            if (withinContent(el)) el.open = true;
          });

          document.querySelectorAll('button[aria-expanded="false"], [role="button"][aria-expanded="false"]').forEach((el) => {
            if (!withinContent(el)) return;
            if (el.closest('nav, header, footer, aside, [role="navigation"], .md-nav, .md-sidebar')) return;
            const text = (el.textContent || '').trim();
            if (text.length > 300) return;
            try { el.click(); } catch {}
          });
        }"""
    )
    await page.wait_for_timeout(600)


async def clean_page_noise(page: Any) -> None:
    """Remove cookie banners, chat widgets, and other non-content noise."""
    await page.evaluate(
        """() => {
          const selectors = [
            '#tally-widget-button',
            '#tally-widget-popup',
            '[id*="cookie"]',
            '[class*="cookie"]',
            '[data-testid*="cookie"]',
            '[aria-label*="cookie"]',
            '[aria-labelledby*="cookie"]',
            '.md-banner',
            '.md-announce',
            '[data-md-component="announce"]',
          ];
          selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((node) => node.remove());
          });
        }"""
    )


async def pick_content_html(page: Any) -> dict[str, Any]:
    """Extract the main documentation content HTML.

    Selectors tried in strict priority order — first match wins.
    MkDocs Material (n8n docs) uses article.md-content__inner for body content.
    Sorting by text-length is avoided because parent containers (main, body) always
    win over the actual content article when sidebars are present.
    """
    return await page.evaluate(
        """() => {
          // Try selectors in priority order — first visible match wins.
          const ordered = [
            'article.md-content__inner',
            '.md-content__inner',
            '.md-content article',
            '.md-content',
            'article',
            '[role="main"] article',
            '.article-body',
            '.docs-content',
            '#content',
            '.content',
            '.archbee-doc',
            '[role="main"]',
            'main',
          ];

          const visible = (el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          };

          for (const selector of ordered) {
            const matches = Array.from(document.querySelectorAll(selector)).filter(visible);
            if (matches.length > 0) {
              const el = matches[0];
              return {
                selector: selector,
                html: el.innerHTML,
                textLength: (el.innerText || '').trim().length,
              };
            }
          }

          return {
            selector: 'body',
            html: document.body ? document.body.innerHTML : '',
            textLength: document.body ? (document.body.innerText || '').trim().length : 0,
          };
        }"""
    )


async def extract_page_payload(page: Any) -> dict[str, Any]:
    return await page.evaluate(
        """() => {
          const normalize = (value) => (value || '').replace(/\\s+/g, ' ').trim();
          const visible = (el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          };

          const collectAssets = (selector, mapper) =>
            Array.from(document.querySelectorAll(selector))
              .filter((el) => visible(el))
              .map(mapper)
              .filter(Boolean);

          const images = collectAssets('img', (el) => ({
            src: el.currentSrc || el.src || '',
            alt: normalize(el.alt),
            width: el.naturalWidth || null,
            height: el.naturalHeight || null,
          }));

          const videos = collectAssets('video, source[src], audio', (el) => ({
            src: el.currentSrc || el.src || el.getAttribute('src') || '',
            tag: el.tagName.toLowerCase(),
          }));

          const iframes = Array.from(document.querySelectorAll('iframe'))
            .map((el) => ({
              src: el.src || '',
              title: normalize(el.getAttribute('title')),
              width: el.getAttribute('width'),
              height: el.getAttribute('height'),
            }))
            .filter((item) => item.src);

          const fileLinks = Array.from(document.querySelectorAll('a[href]'))
            .map((el) => ({
              href: el.href,
              text: normalize(el.textContent),
            }))
            .filter((item) => item.href);

          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .map((el) => ({
              level: el.tagName.toLowerCase(),
              text: normalize(el.textContent),
            }))
            .filter((item) => item.text);

          return {
            title: document.title,
            description:
              document.querySelector('meta[name="description"]')?.getAttribute('content') ||
              document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
              '',
            images,
            videos,
            iframes,
            fileLinks,
            headings,
            visibleText: normalize(document.body?.innerText || ''),
          };
        }"""
    )


async def download_asset(
    client: httpx.AsyncClient,
    url: str,
    output_dir: Path,
    manifest: dict[str, str],
) -> str | None:
    if not url.startswith("http"):
        return None
    if url in manifest:
        return manifest[url]

    try:
        response = await client.get(url, timeout=60)
        response.raise_for_status()
        filename = asset_filename(url, response.headers.get("content-type"))
        destination = output_dir / filename
        if not destination.exists():
            destination.write_bytes(response.content)
        relative = destination.relative_to(output_dir.parent.parent).as_posix()
        manifest[url] = relative
        return relative
    except Exception as exc:
        print(f"[asset-error] {url} -> {exc}")
        return None


async def scrape_page(
    page: Any,
    client: httpx.AsyncClient,
    url: str,
    lastmod: str | None,
    output_root: Path,
    asset_manifest: dict[str, str],
) -> dict[str, Any]:
    slug = slug_for_url(url)
    print(f"[page] {url}")

    page_html_path = output_root / "raw_html" / f"{slug}.html"
    markdown_path = output_root / "pages_markdown" / f"{slug}.md"
    metadata_path = output_root / "pages_json" / f"{slug}.json"

    await page.goto(url, wait_until="networkidle", timeout=60000)
    await page.wait_for_timeout(1200)
    await auto_scroll(page)
    await expand_content(page)
    await clean_page_noise(page)

    content = await pick_content_html(page)
    payload = await extract_page_payload(page)
    full_html = await page.content()

    seen_image_srcs: set[str] = set()
    image_assets: list[dict[str, Any]] = []
    for image in payload["images"]:
        if not image["src"] or image["src"] in seen_image_srcs:
            continue
        seen_image_srcs.add(image["src"])
        local_path = await download_asset(client, image["src"], output_root / "assets" / "images", asset_manifest)
        image_assets.append({**image, "local_path": local_path})

    seen_file_hrefs: set[str] = set()
    file_assets: list[dict[str, Any]] = []
    for link in payload["fileLinks"]:
        href = normalize_url(link["href"])
        if href in seen_file_hrefs:
            continue
        seen_file_hrefs.add(href)
        if FILE_LINK_RE.search(urlparse(href).path):
            local_path = await download_asset(client, href, output_root / "assets" / "files", asset_manifest)
            file_assets.append({**link, "local_path": local_path})

    seen_iframe_srcs: set[str] = set()
    iframe_assets: list[dict[str, Any]] = []
    for frame in payload["iframes"]:
        frame_src = normalize_url(frame["src"])
        if not frame_src or frame_src == url or frame_src in seen_iframe_srcs:
            continue
        seen_iframe_srcs.add(frame_src)
        local_path = None
        if frame_src.startswith(BASE_URL):
            try:
                iframe_response = await client.get(frame_src, timeout=60)
                iframe_response.raise_for_status()
                iframe_name = f"{slug_for_url(frame_src)}.html"
                iframe_file = output_root / "assets" / "iframes" / iframe_name
                iframe_file.write_text(iframe_response.text, encoding="utf-8")
                local_path = iframe_file.relative_to(output_root).as_posix()
            except Exception as exc:
                print(f"[iframe-error] {frame_src} -> {exc}")
        iframe_assets.append({**frame, "src": frame_src, "local_path": local_path})

    for video in payload["videos"]:
        if video["src"].startswith("http"):
            await download_asset(client, video["src"], output_root / "assets" / "media", asset_manifest)

    markdown = md(
        content["html"],
        heading_style="ATX",
        strip=["script", "style", "nav", "footer"],
    )
    markdown = strip_noise(markdown)

    header = [
        f"# {payload['title']}",
        "",
        f"Source: {url}",
        f"Lastmod: {lastmod or ''}",
        f"Description: {payload['description']}",
        "",
    ]
    markdown_path.write_text("\n".join(header) + markdown + "\n", encoding="utf-8")
    page_html_path.write_text(full_html, encoding="utf-8")

    page_record = {
        "url": url,
        "slug": slug,
        "title": payload["title"],
        "description": payload["description"],
        "lastmod": lastmod,
        "markdown_path": markdown_path.relative_to(output_root).as_posix(),
        "raw_html_path": page_html_path.relative_to(output_root).as_posix(),
        "heading_count": len(payload["headings"]),
        "image_count": len(image_assets),
        "iframe_count": len(iframe_assets),
        "file_link_count": len(file_assets),
        "content_selector": content["selector"],
        "content_text_length": content["textLength"],
        "headings": payload["headings"],
        "images": image_assets,
        "iframes": iframe_assets,
        "file_assets": file_assets,
        "videos": payload["videos"],
        "discovered_internal_links": sorted(
            {
                normalize_url(item["href"])
                for item in payload["fileLinks"]
                if item["href"].startswith(BASE_URL)
                and not FILE_LINK_RE.search(urlparse(normalize_url(item["href"])).path)
            }
        ),
    }
    metadata_path.write_text(json.dumps(page_record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return page_record


async def main() -> int:
    parser = argparse.ArgumentParser(description="Scrape docs.n8n.io into RAG-friendly markdown and assets.")
    parser.add_argument("--output", default="research/n8n-docs-export")
    parser.add_argument("--limit", type=int, default=0, help="Only scrape the first N URLs (useful for testing).")
    parser.add_argument("--resume", action="store_true", help="Skip pages that already have a JSON file in output.")
    args = parser.parse_args()

    output_root = Path(args.output).resolve()
    for subdir in [
        "pages_markdown",
        "pages_json",
        "raw_html",
        "assets/images",
        "assets/files",
        "assets/iframes",
        "assets/media",
    ]:
        (output_root / subdir).mkdir(parents=True, exist_ok=True)

    async with httpx.AsyncClient(follow_redirects=True, headers={"User-Agent": "Mozilla/5.0 (compatible; research-scraper/1.0)"}) as client:
        print(f"Fetching sitemap from {SITEMAP_URL} ...")
        sitemap_urls = await fetch_sitemap(client)
        queue: list[str] = list(dict.fromkeys([normalize_url(BASE_URL)] + sitemap_urls))

        if args.limit > 0:
            queue = queue[: args.limit]

        # Build lastmod lookup from sitemap
        lastmod_lookup: dict[str, str | None] = {}
        try:
            sitemap_response = await client.get(SITEMAP_URL, timeout=60)
            root = ET.fromstring(sitemap_response.text)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            for url_node in root.findall(".//sm:url", ns):
                loc = url_node.find("sm:loc", ns)
                lastmod = url_node.find("sm:lastmod", ns)
                if loc is not None and loc.text:
                    lastmod_lookup[normalize_url(loc.text)] = lastmod.text if lastmod is not None else None
        except Exception:
            pass  # lastmod is optional

        print(f"Discovered {len(queue)} URLs to scrape.")
        results: list[dict[str, Any]] = []
        visited: set[str] = set()
        asset_manifest: dict[str, str] = {}

        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 900},
            )

            index = 0
            while index < len(queue):
                if args.limit > 0 and len(results) >= args.limit:
                    break
                url = normalize_url(queue[index])
                index += 1
                if url in visited:
                    continue
                if not url.startswith(BASE_URL):
                    continue
                visited.add(url)

                existing_json = output_root / "pages_json" / f"{slug_for_url(url)}.json"
                if args.resume and existing_json.exists():
                    try:
                        record = json.loads(existing_json.read_text(encoding="utf-8"))
                        results.append(record)
                        # Re-queue any discovered internal links not yet visited
                        for link in record.get("discovered_internal_links", []):
                            if link not in visited:
                                queue.append(link)
                        print(f"[resume] {url}")
                        continue
                    except Exception as exc:
                        print(f"[resume-error] {url} -> {exc}")

                page = await context.new_page()
                try:
                    record = await scrape_page(
                        page=page,
                        client=client,
                        url=url,
                        lastmod=lastmod_lookup.get(url),
                        output_root=output_root,
                        asset_manifest=asset_manifest,
                    )
                    results.append(record)
                    # Enqueue discovered internal links
                    for link in record.get("discovered_internal_links", []):
                        if link not in visited:
                            queue.append(link)
                except PlaywrightTimeoutError as exc:
                    print(f"[timeout] {url} -> {exc}")
                except Exception as exc:
                    print(f"[page-error] {url} -> {exc}")
                finally:
                    await page.close()

            await browser.close()

    manifest_path = output_root / "manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "base_url": BASE_URL,
                "sitemap_url": SITEMAP_URL,
                "page_count": len(results),
                "asset_count": len(asset_manifest),
                "pages": results,
                "assets": asset_manifest,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"\nDone. Scraped {len(results)} pages -> {output_root}")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
