#!/usr/bin/env node
/* build.mjs — cross-platform build for CI (Netlify/Cloudflare).
   Assembles publish/ from the repo: copies shared app + all event folders
   (excluding dev files) and injects per-event Open Graph tags.
   Mirrors build-publish.ps1 so `node build.mjs` works on Linux CI. */
import { cp, rm, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const PUB = join(ROOT, "publish");
const SITE = (process.env.SITE_URL || "https://vistochka.pp.ua").replace(/\/$/, "");

const EXCLUDE_TOP = new Set([
  "publish", "design", "apps-script", ".git", ".github", ".claude", "node_modules",
  "editor.html", "studio.html", "content.sample.json", "content.template.json",
  "build-publish.ps1", "new-event.ps1", "build.mjs", "netlify.toml",
  "README.md", "ROADMAP.md", "MIGRATION-TODO.md", ".gitignore", ".node-version"
]);
const EXCLUDE_FILE = new Set(["js/editor.js", "js/studio.js"]);

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function copyAll() {
  await rm(PUB, { recursive: true, force: true });
  await mkdir(PUB, { recursive: true });
  for (const e of await readdir(ROOT, { withFileTypes: true })) {
    if (EXCLUDE_TOP.has(e.name)) continue;
    await cp(join(ROOT, e.name), join(PUB, e.name), {
      recursive: true,
      filter: (src) => !EXCLUDE_FILE.has(relative(ROOT, src).split(sep).join("/"))
    });
  }
}

async function injectOG() {
  for (const e of await readdir(PUB, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const dir = join(PUB, e.name);
    let cj, html;
    try {
      cj = await readFile(join(dir, "content.json"), "utf8");
      html = await readFile(join(dir, "index.html"), "utf8");
    } catch { continue; }
    let c; try { c = JSON.parse(cj); } catch { continue; }
    const title = esc(c.meta?.title);
    const desc = esc(c.meta?.description);
    const url = `${SITE}/${e.name}/`;
    const img = `${SITE}/${e.name}/${(c.hero?.backgroundImage) || ""}`;
    html = html
      .replace(/(<title>)[\s\S]*?(<\/title>)/, (m, a, b) => a + title + b)
      .replace(/(<meta name="description" content=")[^"]*(">)/, (m, a, b) => a + desc + b)
      .replace(/(<meta property="og:title" content=")[^"]*(">)/, (m, a, b) => a + title + b)
      .replace(/(<meta property="og:description" content=")[^"]*(">)/, (m, a, b) => a + desc + b)
      .replace(/(<meta property="og:url" content=")[^"]*(">)/, (m, a, b) => a + url + b)
      .replace(/<\/head>/, `  <meta property="og:image" content="${img}">\n  <meta name="twitter:image" content="${img}">\n</head>`);
    await writeFile(join(dir, "index.html"), html);
  }
}

await copyAll();
await injectOG();
console.log("publish/ built (shared app + all events, per-event OG).");
