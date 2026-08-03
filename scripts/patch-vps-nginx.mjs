import { readFile, writeFile } from "node:fs/promises";

const nginxPath = process.argv[2];

if (!nginxPath) {
  throw new Error("Usage: node scripts/patch-vps-nginx.mjs /path/to/nginx.conf");
}

const source = await readFile(nginxPath, "utf8");
const serverMarker = "server_name egordigital.site;";
const managedStart = "    # BEGIN EGORDIGITAL MANAGED SECURITY";
const managedEnd = "    # END EGORDIGITAL MANAGED SECURITY";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self' https://*.yandex.ru https://*.yandex.com https://*.yandex.by https://*.yandex.kz https://*.yandex.com.tr",
  "child-src 'self' blob: https://mc.yandex.ru https://mc.yandex.com https://mc.webvisor.org https://mc.webvisor.com",
  "frame-src 'self' blob: https://mc.yandex.ru https://mc.yandex.com https://mc.webvisor.org https://mc.webvisor.com",
  "img-src 'self' data: https://images.unsplash.com https://www.egordigital.site https://mc.yandex.ru https://mc.yandex.com https://mc.webvisor.org https://mc.webvisor.com",
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://mc.yandex.com https://mc.webvisor.org https://mc.webvisor.com https://yastatic.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://mc.yandex.ru https://mc.yandex.com https://mc.webvisor.org https://mc.webvisor.com wss://mc.yandex.ru wss://mc.yandex.com wss://mc.webvisor.org wss://mc.webvisor.com",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const managedBlock = [
  managedStart,
  "    # CSP is owned by Nginx so API responses stay compact and cannot overflow proxy headers.",
  "    proxy_hide_header Content-Security-Policy;",
  "    proxy_buffer_size 32k;",
  "    proxy_buffers 8 32k;",
  "    proxy_busy_buffers_size 64k;",
  `    add_header Content-Security-Policy "${csp}" always;`,
  managedEnd,
].join("\n");

function findServerBlock(input, marker) {
  const markerIndex = input.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Nginx server marker is missing: ${marker}`);
  }

  const start = input.lastIndexOf("server {", markerIndex);
  if (start === -1) throw new Error("Could not find the start of the egordigital.site server block.");

  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let index = start; index < input.length; index += 1) {
    const char = input[index];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (!inDouble && char === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && char === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (inSingle || inDouble) continue;

    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return { start, end: index + 1 };
    }
  }

  throw new Error("Could not find the end of the egordigital.site server block.");
}

const block = findServerBlock(source, serverMarker);
let serverBlock = source.slice(block.start, block.end);

if (!serverBlock.includes("listen 443 ssl http2;")) {
  throw new Error("The matched egordigital.site block is not the HTTPS server block.");
}

const managedPattern = new RegExp(
  `${managedStart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${managedEnd.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
);

if (managedPattern.test(serverBlock)) {
  serverBlock = serverBlock.replace(managedPattern, managedBlock);
} else {
  const certificateKeyPattern = /(\n\s*ssl_certificate_key\s+[^;]+;\s*\n)/;
  if (!certificateKeyPattern.test(serverBlock)) {
    throw new Error("ssl_certificate_key is missing from the egordigital.site HTTPS server block.");
  }
  serverBlock = serverBlock.replace(certificateKeyPattern, `$1\n${managedBlock}\n`);
}

const next = source.slice(0, block.start) + serverBlock + source.slice(block.end);

if (next !== source) {
  await writeFile(nginxPath, next);
  console.log("Nginx updated: compact CSP and safe proxy buffers are enabled.");
} else {
  console.log("Nginx security and proxy buffers are already up to date.");
}
