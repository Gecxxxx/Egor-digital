import assert from "node:assert/strict";
import test from "node:test";
import { buildLeadMessage, normalizeAttribution, trackGoal } from "../src/lead-tracking.js";

test("normalizes only the supported attribution fields", () => {
  const attribution = normalizeAttribution({
    utm_source: " google ",
    utm_medium: "cpc",
    utm_campaign: "summer",
    utm_content: "hero",
    first_url: "https://example.com/?utm_source=google",
    referrer: "https://search.example/",
    ignored: "secret",
  });

  assert.deepEqual(attribution, {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "summer",
    utm_content: "hero",
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
    attribution: { utm_source: "google", utm_campaign: "summer", first_url: "https://example.com/" },
  });

  assert.match(message, /Услуга: Сайт/);
  assert.match(message, /Тариф: от \$500/);
  assert.match(message, /Текущий сайт: https:\/\/old\.example\//);
  assert.match(message, /UTM source: google/);
  assert.match(message, /UTM campaign: summer/);
});

test("analytics safely no-ops outside the browser", () => {
  assert.equal(trackGoal("lead_form_success"), false);
});
