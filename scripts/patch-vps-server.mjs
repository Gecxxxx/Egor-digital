import { readFile, writeFile } from "node:fs/promises";

const serverPath = process.argv[2];

if (!serverPath) {
  throw new Error("Usage: node scripts/patch-vps-server.mjs /path/to/server.js");
}

const source = await readFile(serverPath, "utf8");
const oldCondition = "if (!payload.name || !payload.contact || !payload.message)";
const newCondition = "if (!payload.name || !payload.contact)";
const oldError = "Заполните имя, контакт и короткое описание задачи.";
const newError = "Заполните имя и удобный способ связи.";
let next = source;

const metrikaHttpSources = [
  "https://mc.yandex.ru",
  "https://mc.yandex.com",
  "https://mc.webvisor.org",
  "https://mc.webvisor.com",
];
const metrikaSocketSources = [
  "wss://mc.yandex.ru",
  "wss://mc.yandex.com",
  "wss://mc.webvisor.org",
  "wss://mc.webvisor.com",
];

function allowCspSources(input, directive, sources) {
  const pattern = new RegExp(`(${directive}\\s+)([^;]+)(;)`);
  const match = input.match(pattern);

  if (!match) {
    throw new Error(`Unknown VPS CSP format: ${directive} is missing; refusing an unsafe patch.`);
  }

  const current = match[2].trim().split(/\s+/);
  const missing = sources.filter((source) => !current.includes(source));
  if (missing.length === 0) return input;

  return input.replace(pattern, `${match[1]}${match[2].trim()} ${missing.join(" ")}${match[3]}`);
}

if (next.includes(oldCondition)) {
  next = next.replace(oldCondition, newCondition);
} else if (!next.includes(newCondition)) {
  throw new Error("Unknown VPS lead validation format; refusing an unsafe patch.");
}

if (next.includes(oldError)) next = next.replace(oldError, newError);

next = allowCspSources(next, "script-src", [...metrikaHttpSources, "https://yastatic.net"]);
next = allowCspSources(next, "img-src", metrikaHttpSources);
next = allowCspSources(next, "connect-src", [...metrikaHttpSources, ...metrikaSocketSources]);
next = allowCspSources(next, "frame-src", ["blob:", ...metrikaHttpSources]);
next = allowCspSources(next, "frame-ancestors", [
  "https://*.yandex.ru",
  "https://*.yandex.com",
  "https://*.yandex.by",
  "https://*.yandex.kz",
  "https://*.yandex.com.tr",
]);

if (!/child-src\s+[^;]+;/.test(next)) {
  next = next.replace(
    /(frame-src\s+)/,
    `child-src blob: ${metrikaHttpSources.join(" ")}; $1`,
  );
}

if (next !== source) {
  await writeFile(serverPath, next);
  console.log("VPS server updated: optional comment and Yandex Metrika CSP access are enabled.");
} else {
  console.log("VPS server validation and Yandex Metrika CSP access are already up to date.");
}
