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
const nginxPatchSource = await readFile(new URL("../scripts/patch-vps-nginx.mjs", import.meta.url), "utf8");

test("submits the lead form to the VPS Telegram endpoint", () => {
  assert.match(appSource, /fetch\("\/api\/brief"/);
  assert.match(appSource, /!response\.ok \|\| result\?\.ok === false \|\| result\?\.success === false/);
  assert.doesNotMatch(appSource, /result\.ok !== true/);
  assert.match(appSource, /setStatus\("success"\)/);
  assert.match(appSource, /trackGoal\("lead_form_success"/);
});

test("shows Russian accessible validation without browser-native English messages", () => {
  assert.match(appSource, /<form noValidate/);
  assert.match(appSource, /Введите имя\./);
  assert.match(appSource, /Укажите Telegram, WhatsApp, телефон или email\./);
  assert.match(appSource, /Подтвердите согласие на обработку персональных данных\./);
  assert.match(appSource, /aria-describedby=\{fieldErrors\.name/);
  assert.match(appSource, /className="field-error" id=\{id\} role="alert"/);
  assert.match(appSource, /className="form-status form-error" role="alert"/);
  assert.match(appSource, /className="cta-copy" aria-hidden="true"/);
  assert.match(appSource, /className="cta-action" aria-hidden="true"/);
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

test("delegates the VPS CSP to Nginx and keeps API response headers compact", async () => {
  const directory = await mkdtemp(join(tmpdir(), "egor-vps-security-"));
  const serverPath = join(directory, "server.js");
  const nginxPath = join(directory, "egordigital.site");
  const serverSource = `
    const validation = (payload) => {
      if (!payload.name || !payload.contact || !payload.message) return "Заполните имя, контакт и короткое описание задачи.";
    };
    function securityHeaders() {
      return {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'",
          "connect-src 'self'"
        ].join('; '),
        'X-Content-Type-Options': 'nosniff'
      };
    }
  `;
  const nginxSource = `
server {
    listen 80;
    server_name egordigital.site www.egordigital.site;
    return 301 https://egordigital.site$request_uri;
}

server {
    listen 443 ssl http2;
    server_name egordigital.site;

    ssl_certificate /etc/letsencrypt/live/egordigital.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/egordigital.site/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
  `;

  await writeFile(serverPath, serverSource);
  await writeFile(nginxPath, nginxSource);
  await execFileAsync(process.execPath, [new URL("../scripts/patch-vps-server.mjs", import.meta.url).pathname, serverPath]);
  await execFileAsync(process.execPath, [new URL("../scripts/patch-vps-nginx.mjs", import.meta.url).pathname, nginxPath]);

  const patchedServer = await readFile(serverPath, "utf8");
  const patchedNginx = await readFile(nginxPath, "utf8");

  assert.match(patchedServer, /!payload\.name \|\| !payload\.contact\)/);
  assert.doesNotMatch(patchedServer, /Content-Security-Policy/);
  assert.match(patchedNginx, /proxy_hide_header Content-Security-Policy/);
  assert.match(patchedNginx, /proxy_buffer_size 32k/);
  assert.match(patchedNginx, /proxy_buffers 8 32k/);
  assert.match(patchedNginx, /script-src[^;]*https:\/\/mc\.yandex\.ru[^;]*https:\/\/yastatic\.net/);
  assert.match(patchedNginx, /connect-src[^;]*https:\/\/mc\.yandex\.ru[^;]*wss:\/\/mc\.webvisor\.org/);
  assert.match(patchedNginx, /img-src[^;]*https:\/\/mc\.yandex\.ru/);
  assert.match(patchedNginx, /style-src[^;]*https:\/\/fonts\.googleapis\.com/);
  assert.match(patchedNginx, /font-src[^;]*https:\/\/fonts\.gstatic\.com/);

  assert.match(nginxPatchSource, /BEGIN EGORDIGITAL MANAGED SECURITY/);
  assert.match(deploySource, /patch-vps-nginx\.mjs/);
  assert.match(deploySource, /NGINX_BACKUP_FILE/);
  assert.match(deploySource, /verify_public_headers/);
  assert.match(deploySource, /verify_brief_api/);
  assert.match(deploySource, /Public CSP header is unexpectedly large/);
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
