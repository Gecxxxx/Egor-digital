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

test("falls back to index.html for a known app route", async () => {
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
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/services?source=share", "/index.html"]);
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
          return new Response(url.pathname === "/index.html" ? "privacy-app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "privacy-app");
  assert.deepEqual(calls, ["/privacy/", "/index.html"]);
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
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
  for (const route of ["services", "cases", "pricing", "process", "about", "contacts", "privacy"]) {
    await access(new URL(`../dist/client/${route}.html`, import.meta.url));
  }
});

test("keeps the mobile menu visible and ticker moving with reduced motion", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.ok(css.includes(".nav.open > button, .nav.open .mobile-nav-actions { opacity: 1; transform: none; }"));
  assert.ok(css.includes("@media (max-width: 820px) and (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes("animation: ticker-run 18s linear infinite !important"));
});

test("keeps the mobile hero portrait fully visible behind the text", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.ok(css.includes("width: min(39vw, 300px); height: auto; overflow: visible"));
  assert.ok(css.includes("width: min(52vw, 200px); height: auto"));
  assert.ok(css.includes("width: 100%; height: auto; max-width: 100%; object-fit: contain"));
  assert.ok(!css.includes(".hero-person { top: 68px; right: -14px"));
});

test("keeps every shared page hero within the first viewport", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.ok(css.includes("height: clamp(500px, calc(100svh - 86px), 860px)"));
  assert.ok(css.includes("font-size: clamp(56px, min(6.1vw, 10.6svh), 104px)"));
  assert.ok(css.includes("min-height: calc(100svh - 72px)"));
  assert.ok(css.includes("@media (max-width: 820px) and (max-height: 720px)"));
  assert.ok(!css.includes("font-size: clamp(64px, 8vw, 124px)"));
});
