import assert from "node:assert/strict";
import test from "node:test";
import { buildLeadMessage, normalizeAttribution, trackGoal } from "../src/lead-tracking.js";

test("normalizes only the supported attribution fields", () => {
  const attribution = normalizeAttribution({
    utm_source: " google ",
    utm_medium: "cpc",
    utm_campaign: "summer",
    utm_content: "hero",
    utm_term: "создание сайта",
    yclid: "123456789",
    first_url: "https://example.com/?utm_source=google",
    referrer: "https://search.example/",
    ignored: "secret",
  });

  assert.deepEqual(attribution, {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "summer",
    utm_content: "hero",
    utm_term: "создание сайта",
    yclid: "123456789",
    first_url: "https://example.com/?utm_source=google",
    referrer: "https://search.example/",
  });
});

test("builds a Telegram-compatible lead summary with tariff and attribution", () => {
  const message = buildLeadMessage({
    comment: "Нужен запуск",
    serviceLabel: "Сайт",
    price: "от $500",
    currentWebsite: "https://old.example/",
    currentPage: "/pricing?utm_source=google",
    attribution: { utm_source: "yandex", utm_campaign: "summer", utm_term: "сайт для бизнеса", yclid: "123456789", first_url: "https://example.com/" },
  });

  assert.match(message, /Услуга: Сайт/);
  assert.match(message, /Тариф: от \$500/);
  assert.match(message, /Текущий сайт: https:\/\/old\.example\//);
  assert.match(message, /UTM source: yandex/);
  assert.match(message, /UTM campaign: summer/);
  assert.match(message, /UTM term: сайт для бизнеса/);
  assert.match(message, /Yandex click ID: 123456789/);
});

test("analytics safely no-ops outside the browser", () => {
  assert.equal(trackGoal("lead_form_success"), false);
});
