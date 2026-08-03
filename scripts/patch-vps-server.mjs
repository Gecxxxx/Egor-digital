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

function removeNodeCsp(input) {
  const marker = "'Content-Security-Policy': [";
  const markerIndex = input.indexOf(marker);
  if (markerIndex === -1) return input;

  const lineStart = input.lastIndexOf("\n", markerIndex) + 1;
  const joinIndex = input.indexOf("].join(", markerIndex);
  if (joinIndex === -1) {
    throw new Error("Unknown VPS CSP format: the closing join call is missing.");
  }

  const entryEnd = input.indexOf("),", joinIndex);
  if (entryEnd === -1) {
    throw new Error("Unknown VPS CSP format: the CSP property terminator is missing.");
  }

  let removeEnd = entryEnd + 2;
  if (input[removeEnd] === "\r") removeEnd += 1;
  if (input[removeEnd] === "\n") removeEnd += 1;

  return input.slice(0, lineStart) + input.slice(removeEnd);
}

if (next.includes(oldCondition)) {
  next = next.replace(oldCondition, newCondition);
} else if (!next.includes(newCondition)) {
  throw new Error("Unknown VPS lead validation format; refusing an unsafe patch.");
}

if (next.includes(oldError)) next = next.replace(oldError, newError);

next = removeNodeCsp(next);

if (next !== source) {
  await writeFile(serverPath, next);
  console.log("VPS server updated: optional comment is enabled and CSP is delegated to Nginx.");
} else {
  console.log("VPS server validation and header ownership are already up to date.");
}
