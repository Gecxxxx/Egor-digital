import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to the prerendered shell for a known app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/services?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/services.html" ? "services-app" : "missing", {
            status: url.pathname === "/services.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "services-app");
  assert.deepEqual(calls, ["/services?source=share", "/services.html"]);
});

test("serves the privacy route as a known app page", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/privacy/", { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname);
          return new Response(url.pathname === "/privacy.html" ? "privacy-app" : "missing", {
            status: url.pathname === "/privacy.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "privacy-app");
  assert.deepEqual(calls, ["/privacy/", "/privacy.html"]);
});

test("serves the app 404 shell with a 404 status for an unknown route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/missing-page?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/404.html" ? "not-found-app" : "missing", {
            status: url.pathname === "/404.html" ? 200 : 404,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        },
      },
    },
  );

  assert.equal(response.status, 404);
  assert.equal(await response.text(), "not-found-app");
  assert.deepEqual(calls, ["/missing-page?source=share", "/404.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/client/404.html", import.meta.url));
  await access(new URL("../dist/client/_redirects", import.meta.url));
  await access(new URL("../dist/client/robots.txt", import.meta.url));
  await access(new URL("../dist/client/sitemap.xml", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
  for (const route of ["services", "cases", "cases/daria-kaminskene", "cases/green-apple-dent", "cases/krysha-mechty", "pricing", "process", "about", "contacts", "privacy"]) {
    await access(new URL(`../dist/client/${route}.html`, import.meta.url));
    await access(new URL(`../dist/client/${route}/index.html`, import.meta.url));
  }
});

test("prerenders route content with unique SEO metadata and crawlable links", async () => {
  const home = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  const services = await readFile(new URL("../dist/client/services.html", import.meta.url), "utf8");
  const pricing = await readFile(new URL("../dist/client/pricing.html", import.meta.url), "utf8");
  const notFound = await readFile(new URL("../dist/client/404.html", import.meta.url), "utf8");
  const robots = await readFile(new URL("../dist/client/robots.txt", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../dist/client/sitemap.xml", import.meta.url), "utf8");

  assert.match(home, /<div id="root">[\s\S]*<main>/);
  assert.match(services, /Услуги для сайта, заявок и CRM/);
  assert.match(services, /<title>Создание сайтов и CRM для бизнеса — услуги и цены<\/title>/);
  assert.match(services, /rel="canonical" href="https:\/\/egordigital\.site\/services"/);
  assert.match(services, /<a[^>]+href="\/cases"/);
  assert.match(services, /"@type":"BreadcrumbList"/);
  assert.match(pricing, /<title>Стоимость создания сайта и CRM — от 50 000 ₽<\/title>/);
  assert.match(notFound, /<meta name="robots" content="noindex,follow"/);
  assert.match(robots, /Sitemap: https:\/\/egordigital\.site\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/egordigital\.site\/pricing<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/egordigital\.site\/cases\/green-apple-dent<\/loc>/);
});

test("keeps the result-focused hero and ships three detailed real cases", async () => {
  const home = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  const daria = await readFile(new URL("../dist/client/cases/daria-kaminskene.html", import.meta.url), "utf8");
  const clinic = await readFile(new URL("../dist/client/cases/green-apple-dent.html", import.meta.url), "utf8");
  const roof = await readFile(new URL("../dist/client/cases/krysha-mechty.html", import.meta.url), "utf8");

  assert.match(home, /Сайт\. Заявки\. Автоматизация\./);
  assert.match(home, /Создаю сайты и автоматизирую заявки/);
  assert.match(home, /<span[^>]*class="count-up"[^>]*>25 000(?:<!-- -->)? ₽<\/span>/);
  assert.match(home, /class="char-word"/);
  assert.match(home, /class="cta secondary" href="\/cases"/);
  assert.ok(home.indexOf("Сайты приводят заявки") < home.indexOf("Реальные проекты"));
  const servicesStart = home.indexOf("services-home");
  const servicesEnd = home.indexOf("lead-flow", servicesStart);
  const homeServices = home.slice(servicesStart, servicesEnd);
  assert.ok(homeServices.indexOf("Полный аудит и доработка") < homeServices.indexOf("Сайт для бизнеса"));
  assert.ok(homeServices.indexOf("Сайт для бизнеса") < homeServices.indexOf(">CRM<"));
  assert.ok(homeServices.indexOf(">CRM<") < homeServices.indexOf(">Автоматизация<"));
  assert.match(daria, /Что нужно было решить/);
  assert.match(daria, /Дарья Каминскене — маркетолог/);
  assert.match(clinic, /Telegram и MAX-уведомления/);
  assert.match(clinic, /"@type":"BreadcrumbList"/);
  assert.match(clinic, /"position":3/);
  assert.match(roof, /Калькулятор ориентировочной стоимости/);
});

test("keeps mobile navigation visible and the compact ticker moving on mobile", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.ok(css.includes(".nav.open > a, .nav.open .mobile-nav-actions { opacity: 1; transform: none; }"));
  assert.ok(css.includes(".ticker-track { animation-duration: 18s; -webkit-animation-duration: 18s; }"));
  assert.ok(css.includes("@media (max-width: 820px) and (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes("animation: ticker-run 24s linear infinite !important"));
  assert.ok(!css.includes(".ticker-track { transform: none !important;"));
});

test("shows the branded loader only once per session without delaying secondary assets", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(app, /INTRO_SESSION_KEY = "egor:intro-seen"/);
  assert.match(app, /sessionStorage\.getItem\(INTRO_SESSION_KEY\)/);
  assert.match(app, /sessionStorage\.setItem\(INTRO_SESSION_KEY, "1"\)/);
  assert.match(app, /\? 360 : 280/);
  assert.match(app, /setTimeout\(resolve, 420\)/);
  assert.doesNotMatch(app, /document\.fonts/);
  assert.doesNotMatch(html, /rel="preload"[^>]+egor-about-cutout/);
});

test("traps and restores modal focus while hiding background content", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(app, /app\.inert = true/);
  assert.match(app, /app\.setAttribute\("aria-hidden", "true"\)/);
  assert.match(app, /event\.key !== "Tab"/);
  assert.match(app, /returnFocusRef\.current\.focus\(\)/);
  assert.match(app, /className="skip-link" href="#page-content"/);
  assert.match(app, /role="dialog" aria-modal="true"/);
});

test("keeps the ticker moving without interactive pause controls", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(app, /function BenefitTicker\(\) \{\n  return <div className="ticker"/);
  assert.doesNotMatch(app, /ticker-toggle|aria-pressed=\{paused\}|setPaused/);
  assert.doesNotMatch(css, /ticker-toggle|ticker\.is-paused|ticker:hover \.ticker-track/);
});

test("keeps the mobile hero portrait fully visible behind the text", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.ok(css.includes("width: min(39vw, 300px); height: auto; overflow: visible"));
  assert.ok(css.includes("width: min(52vw, 200px); height: auto"));
  assert.ok(css.includes("width: 100%; height: auto; max-width: 100%; object-fit: contain"));
  assert.ok(!css.includes(".hero-person { top: 68px; right: -14px"));
});

test("keeps all three homepage action labels visible at tablet widths", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.ok(css.includes(".hero-actions .cta-copy { white-space: nowrap; }"));
  assert.ok(css.includes(".hero-actions .cta:nth-child(1), .hero-actions .cta:nth-child(2) { flex-grow: 1.2; }"));
  assert.ok(css.includes(".hero-actions .cta:nth-child(3) { flex-grow: .7; }"));
  assert.ok(css.includes(".hero-actions { gap: 8px; }"));
});

test("shows complete case-study images instead of cropping their previews", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.ok(css.includes(".case-image img { width: 100%; height: 100%; object-fit: contain; object-position: center; display: block; }"));
  assert.ok(css.includes(".case-study-preview .case-image img { filter: none; transform: none; }"));
});

test("ships an adaptive animated Digital Orbit portrait on the about page", async () => {
  const about = await readFile(new URL("../dist/client/about.html", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const orbitAsset = await readFile(new URL("../public/assets/images/egor-about-orbit.webp", import.meta.url));

  assert.match(about, /egor-about-orbit\.webp/);
  assert.match(about, /about-orbit-card-site/);
  assert.match(about, /about-orbit-card-telegram/);
  assert.ok(css.includes("@keyframes about-card-float"));
  assert.ok(css.includes(".about-orbit-ui { position: absolute; z-index: 5;"));
  assert.ok(css.includes("aspect-ratio: 4 / 5"));
  assert.ok(orbitAsset.byteLength > 20_000);
});

test("keeps every shared page hero within the first viewport", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.ok(css.includes("height: clamp(500px, calc(100svh - 86px), 860px)"));
  assert.ok(css.includes("font-size: clamp(56px, min(6.1vw, 10.6svh), 104px)"));
  assert.ok(css.includes("align-items: center; overflow: hidden"));
  assert.ok(css.includes("min-height: calc(100svh - 72px)"));
  assert.ok(css.includes("align-content: start; align-items: start; gap: clamp(56px, 16vw, 76px)"));
  assert.ok(css.includes("font-size: clamp(40px, 10.5vw, 50px)"));
  assert.ok(!css.includes("@media (max-width: 820px) and (max-height:"));
  assert.ok(!css.includes(".page-hero h1 { max-width: none; font-size: clamp(42px, min(12vw, 8.2svh), 58px)"));
  assert.ok(!css.includes("font-size: clamp(64px, 8vw, 124px)"));
});

test("ships browser and Apple tab icons from the brand mark", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /href="\/favicon\.ico"/);
  assert.match(html, /href="\/favicon-32\.png"/);
  assert.match(html, /href="\/apple-touch-icon\.png"/);
  await access(new URL("../public/favicon.ico", import.meta.url));
  await access(new URL("../public/favicon-32.png", import.meta.url));
  await access(new URL("../public/apple-touch-icon.png", import.meta.url));
});

test("keeps modal controls above the sticky header and mobile menu", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.ok(css.includes(".modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.82); z-index: 200"));
  assert.ok(css.includes(".modal-toolbar { position: sticky; top: 0; z-index: 3"));
  assert.ok(css.includes("body.modal-open { overflow: hidden; }"));
  assert.match(app, /createPortal\(/);
  assert.match(app, /if \(modalOpen\) setOpen\(false\)/);
  assert.match(app, /\(hover: hover\) and \(pointer: fine\)/);
});

test("keeps scroll reveals fast and immediately accessible with reduced motion", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.ok(css.includes("transition: opacity .34s ease"));
  assert.ok(css.includes("transform .42s cubic-bezier"));
  assert.ok(css.includes(".motion-reveal { opacity: 1 !important; transform: none !important; filter: none !important"));
  assert.ok(app.includes("(index % 4) * 35"));
  assert.ok(app.includes('rootMargin: "0px 0px -2%", threshold: 0.03'));
});

test("shows pricing offers directly after a compact first screen", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(app, /className="pricing-hero"/);
  assert.match(app, /className="section pricing-plans-section"/);
  assert.ok(css.includes(".pricing-hero { height: auto; min-height: 340px"));
  assert.ok(css.includes(".pricing-hero { min-height: 0; gap: 26px"));
});

test("ships approved client testimonials and Yandex Metrika", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(html, /mc\.yandex\.ru\/metrika\/tag\.js\?id=111655243/);
  assert.match(html, /ym\(111655243, "init"/);
  assert.match(app, /Дарья Каминскене/);
  assert.match(app, /Green Apple Dent/);
  assert.match(app, /Крыша-мечты/);
  assert.match(app, /window\.ym\?\.\(111655243, "hit"/);
  assert.match(app, /Яндекс Метрика и cookie/);
});
