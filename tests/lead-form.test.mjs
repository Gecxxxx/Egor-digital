import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const deploySource = await readFile(new URL("../scripts/deploy-vps.sh", import.meta.url), "utf8");
const serverPatchSource = await readFile(new URL("../scripts/patch-vps-server.mjs", import.meta.url), "utf8");

test("submits the lead form to the VPS Telegram endpoint", () => {
  assert.match(appSource, /fetch\("\/api\/brief"/);
  assert.match(appSource, /result\.ok !== true/);
  assert.match(appSource, /setStatus\("success"\)/);
  assert.match(appSource, /trackGoal\("lead_form_success"/);
});

test("submits service, tariff and first-touch attribution", () => {
  assert.match(appSource, /current_website: currentWebsite/);
  assert.match(appSource, /service: chosenService\.value/);
  assert.match(appSource, /price: selection\.price/);
  assert.match(appSource, /first_url: attribution\.first_url/);
  assert.match(appSource, /utm_source: attribution\.utm_source/);
  assert.match(appSource, /utm_medium: attribution\.utm_medium/);
  assert.match(appSource, /utm_campaign: attribution\.utm_campaign/);
  assert.match(appSource, /utm_content: attribution\.utm_content/);
});

test("keeps the agreed analytics goal names stable", () => {
  for (const goal of ["lead_modal_open", "lead_form_start", "lead_form_success", "telegram_click", "whatsapp_click", "case_open", "pricing_plan_select", "privacy_open", "form_error"]) {
    assert.match(appSource, new RegExp(goal));
  }
});

test("updates VPS validation so an empty comment is accepted", () => {
  assert.match(deploySource, /patch-vps-server\.mjs/);
  assert.match(deploySource, /SERVER_BACKUP_FILE/);
  assert.match(deploySource, /wait_for_endpoint GET http:\/\/127\.0\.0\.1:3000\//);
  assert.match(deploySource, /for attempt in \$\(seq 1 30\)/);
  assert.match(serverPatchSource, /!payload\.name \|\| !payload\.contact\)/);
  assert.doesNotMatch(serverPatchSource, /newCondition = .*payload\.message/);
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
  assert.match(appSource, /name="service"/);
  assert.match(appSource, /name="current_website"/);
  assert.match(appSource, /Комментарий \(по желанию\)/);
  assert.match(appSource, /name="message" rows="3" maxLength="3000"/);
  assert.doesNotMatch(appSource, /name="message" rows="3" required/);
  assert.match(appSource, /name="privacy" type="checkbox" required/);
  assert.match(appSource, /name="website"/);
});
