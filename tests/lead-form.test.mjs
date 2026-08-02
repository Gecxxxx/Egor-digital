import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);

const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const deploySource = await readFile(new URL("../scripts/deploy-vps.sh", import.meta.url), "utf8");
const serverPatchSource = await readFile(new URL("../scripts/patch-vps-server.mjs", import.meta.url), "utf8");

test("submits the lead form to the VPS Telegram endpoint", () => {
  assert.match(appSource, /fetch\("\/api\/brief"/);
  assert.match(appSource, /result\.ok !== true/);
  assert.match(appSource, /setStatus\("success"\)/);
});

test("updates VPS validation so an empty comment is accepted", () => {
  assert.match(deploySource, /patch-vps-server\.mjs/);
  assert.match(deploySource, /SERVER_BACKUP_FILE/);
  assert.match(deploySource, /wait_for_endpoint GET http:\/\/127\.0\.0\.1:3000\//);
  assert.match(deploySource, /for attempt in \$\(seq 1 30\)/);
  assert.match(serverPatchSource, /!payload\.name \|\| !payload\.contact\)/);
  assert.doesNotMatch(serverPatchSource, /newCondition = .*payload\.message/);
});

test("allows Yandex Metrika and Webvisor through the VPS CSP", async () => {
  const directory = await mkdtemp(join(tmpdir(), "egor-metrika-csp-"));
  const serverPath = join(directory, "server.js");
  const serverSource = `
    const validation = (payload) => {
      if (!payload.name || !payload.contact || !payload.message) return "Заполните имя, контакт и короткое описание задачи.";
    };
    const csp = "default-src 'self'; frame-ancestors 'self'; frame-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; connect-src 'self';";
  `;

  await writeFile(serverPath, serverSource);
  await execFileAsync(process.execPath, [new URL("../scripts/patch-vps-server.mjs", import.meta.url).pathname, serverPath]);

  const patched = await readFile(serverPath, "utf8");
  assert.match(patched, /script-src[^;]*https:\/\/mc\.yandex\.ru[^;]*https:\/\/yastatic\.net/);
  assert.match(patched, /connect-src[^;]*https:\/\/mc\.yandex\.ru[^;]*wss:\/\/mc\.webvisor\.org/);
  assert.match(patched, /img-src[^;]*https:\/\/mc\.yandex\.ru/);
  assert.match(patched, /child-src blob:[^;]*https:\/\/mc\.yandex\.ru/);
  assert.match(patched, /frame-src[^;]*blob:[^;]*https:\/\/mc\.yandex\.ru/);
  assert.match(patched, /frame-ancestors[^;]*https:\/\/\*\.yandex\.ru/);
  assert.match(deploySource, /verify_metrika/);
  assert.match(deploySource, /content-security-policy:.*connect-src/);
});

test("labels concept work as demo projects and includes the fitness case", () => {
  assert.match(appSource, /name: "Илья Морозов", categories: \["Демо-проект", "Сайт", "Личный бренд"\]/);
  assert.match(appSource, /name: "NovaDent", categories: \["Демо-проект", "Сайт", "CRM", "Автоматизация"\]/);
  assert.match(appSource, /name: "Casa Maris", categories: \["Демо-проект", "Сайт", "CRM", "Автоматизация"\]/);
  assert.match(appSource, /name: "Level Home", categories: \["Демо-проект", "Сайт", "Автоматизация"\]/);
  assert.match(appSource, /fitness-coach\.webp/);
});

test("filters cases by every matching category", () => {
  assert.match(appSource, /item\.categories\.includes\(filter\)/);
  assert.match(appSource, /item\.categories\.join\(" \/ "\)/);
  assert.match(appSource, /"Личный бренд", "Демо-проект"/);
  assert.match(appSource, /Проекты и концепты/);
});

test("requires only name, contact and privacy consent", () => {
  assert.match(appSource, /name="name" required/);
  assert.match(appSource, /name="contact" required/);
  assert.match(appSource, /Комментарий \(по желанию\)/);
  assert.match(appSource, /name="message" rows="4" maxLength="3000"/);
  assert.doesNotMatch(appSource, /name="message" rows="4" required/);
  assert.match(appSource, /name="privacy" type="checkbox" required/);
  assert.match(appSource, /name="website"/);
});
