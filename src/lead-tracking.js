export const METRIKA_ID = 111655243;

const ATTRIBUTION_KEY = "egor-digital-attribution-v1";
const ATTRIBUTION_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "yclid"];

function clean(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

export function normalizeAttribution(value = {}) {
  return {
    utm_source: clean(value.utm_source, 160),
    utm_medium: clean(value.utm_medium, 160),
    utm_campaign: clean(value.utm_campaign, 240),
    utm_content: clean(value.utm_content, 240),
    utm_term: clean(value.utm_term, 240),
    yclid: clean(value.yclid, 240),
    first_url: clean(value.first_url, 1000),
    referrer: clean(value.referrer, 1000),
  };
}

export function captureAttribution() {
  if (typeof window === "undefined") return normalizeAttribution();

  try {
    const saved = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (saved) return normalizeAttribution(JSON.parse(saved));

    const params = new URLSearchParams(window.location.search);
    const captured = normalizeAttribution({
      ...Object.fromEntries(ATTRIBUTION_FIELDS.map((field) => [field, params.get(field) || ""])),
      first_url: window.location.href,
      referrer: document.referrer,
    });
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(captured));
    return captured;
  } catch {
    return normalizeAttribution({
      first_url: window.location.href,
      referrer: document.referrer,
    });
  }
}

export function getCurrentPage() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function getGoalContext(extra = {}) {
  const attribution = captureAttribution();
  return {
    page: getCurrentPage(),
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    utm_term: attribution.utm_term,
    yclid: attribution.yclid,
    ...extra,
  };
}

export function trackGoal(goal, params = {}) {
  if (typeof window === "undefined" || typeof window.ym !== "function") return false;
  try {
    window.ym(METRIKA_ID, "reachGoal", goal, params);
    return true;
  } catch {
    return false;
  }
}

export function buildLeadMessage({ comment = "", serviceLabel = "", price = "", currentWebsite = "", attribution = {}, currentPage = "/" } = {}) {
  const lines = [
    `Услуга: ${clean(serviceLabel, 160) || "Не выбрана"}`,
    price ? `Тариф: ${clean(price, 160)}` : "",
    currentWebsite ? `Текущий сайт: ${clean(currentWebsite, 1000)}` : "",
    comment ? `Комментарий: ${clean(comment, 3000)}` : "Комментарий: не указан",
    `Страница заявки: ${clean(currentPage, 1000)}`,
    attribution.first_url ? `Первый визит: ${clean(attribution.first_url, 1000)}` : "",
    attribution.referrer ? `Реферер: ${clean(attribution.referrer, 1000)}` : "",
    attribution.utm_source ? `UTM source: ${clean(attribution.utm_source, 160)}` : "",
    attribution.utm_medium ? `UTM medium: ${clean(attribution.utm_medium, 160)}` : "",
    attribution.utm_campaign ? `UTM campaign: ${clean(attribution.utm_campaign, 240)}` : "",
    attribution.utm_content ? `UTM content: ${clean(attribution.utm_content, 240)}` : "",
    attribution.utm_term ? `UTM term: ${clean(attribution.utm_term, 240)}` : "",
    attribution.yclid ? `Yandex click ID: ${clean(attribution.yclid, 240)}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}
