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

if (next.includes(oldCondition)) {
  next = next.replace(oldCondition, newCondition);
} else if (!next.includes(newCondition)) {
  throw new Error("Unknown VPS lead validation format; refusing an unsafe patch.");
}

if (next.includes(oldError)) next = next.replace(oldError, newError);

if (next !== source) {
  await writeFile(serverPath, next);
  console.log("VPS lead validation updated: comment is optional.");
} else {
  console.log("VPS lead validation is already up to date.");
}
