#!/usr/bin/env node
/**
 * Measures First Load JS for a prerendered route.
 *
 * Usage:
 *   node scripts/first-load-js.mjs            -> measures .next/server/app/menu.html
 *   node scripts/first-load-js.mjs cart       -> measures .next/server/app/cart.html
 *   node scripts/first-load-js.mjs menu before-> measures a custom html file
 *
 * It reads the HTML shell Next wrote during `next build`, collects every
 * <script src="..."> it references, resolves those paths inside .next/static,
 * and sums their (optionally gzipped) sizes. Inline <script> bodies
 * (the RSC payload) are reported separately so the numbers stay comparable
 * with the "First Load JS" line printed by next build.
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const arg = (process.argv[2] || "menu").replace(/^\/+|\/+$/g, "");
const route = arg === "" ? "index" : arg;
const routeLabel = route === "index" ? "/" : `/${route}`;
const label = process.argv[3] || "after";

const htmlCandidates = [
  path.join(root, ".next", "server", "app", `${route}.html`),
  path.join(root, ".next", "server", "app", `${route}.index.html`),
  path.join(root, ".next", "server", "app", `${route}.rsc`),
];

const htmlPath = htmlCandidates.find((file) => fs.existsSync(file));

if (!htmlPath) {
  console.error(
    `No prerendered HTML found for route "${routeLabel}". Looked for:\n  ${htmlCandidates.join(
      "\n  "
    )}\nRun \`npm run build\` first, and note that dynamic routes (for example /checkout) have no HTML shell.`
  );
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");

const external = new Map();
for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
  const src = match[1];
  if (src.startsWith("http")) continue;
  const filePath = path.join(root, ".next", src.replace(/^\/?_next\//, ""));
  if (!external.has(src)) external.set(src, filePath);
}

const inlineScripts = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter((body) => body.trim().length > 0);

function sizeOf(file) {
  return fs.existsSync(file) ? fs.statSync(file).size : 0;
}

function format(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const rows = [];
let externalTotal = 0;
let externalGzipTotal = 0;
let missing = 0;

for (const [src, file] of external) {
  const bytes = sizeOf(file);
  if (bytes === 0) missing += 1;
  const gzip = bytes ? zlib.gzipSync(fs.readFileSync(file)).length : 0;
  externalTotal += bytes;
  externalGzipTotal += gzip;
  rows.push({ src, bytes, gzip });
}

rows.sort((a, b) => b.bytes - a.bytes);

const inlineTotal = inlineScripts.reduce((sum, body) => sum + Buffer.byteLength(body), 0);

console.log(`\nFirst Load JS — ${routeLabel} (${label})`);
console.log(`html: ${path.relative(root, htmlPath)}`);
console.log(`\n${"script".padEnd(58)} ${"raw".padStart(10)} ${"gzip".padStart(10)}`);
console.log("-".repeat(80));
for (const row of rows) {
  const name = row.src.replace(/^\/_next\//, "");
  console.log(
    `${name.length > 57 ? `…${name.slice(-56)}` : name}`.padEnd(58) +
      `${format(row.bytes).padStart(10)} ${format(row.gzip).padStart(10)}`
  );
}
console.log("-".repeat(80));
console.log(`${`external scripts (${rows.length})`.padEnd(58)} ${format(externalTotal).padStart(10)} ${format(externalGzipTotal).padStart(10)}`);
console.log(`${`inline RSC scripts (${inlineScripts.length})`.padEnd(58)} ${format(inlineTotal).padStart(10)} ${"-".padStart(10)}`);
console.log(`${"TOTAL".padEnd(58)} ${format(externalTotal + inlineTotal).padStart(10)} ${"-".padStart(10)}`);

if (missing) {
  console.log(`\nwarning: ${missing} script file(s) referenced by the HTML were not found in .next`);
}

const jsonOut = path.join(root, ".next", `first-load-js-${label}-${route}.json`);
fs.writeFileSync(
  jsonOut,
  JSON.stringify(
    {
      route: routeLabel,
      label,
      html: path.relative(root, htmlPath),
      scriptCount: rows.length,
      externalBytes: externalTotal,
      externalGzipBytes: externalGzipTotal,
      inlineBytes: inlineTotal,
      totalBytes: externalTotal + inlineTotal,
      files: rows.map((row) => ({
        src: row.src,
        bytes: row.bytes,
        gzip: row.gzip,
      })),
    },
    null,
    2
  )
);
console.log(`\nwrote ${path.relative(root, jsonOut)}`);
