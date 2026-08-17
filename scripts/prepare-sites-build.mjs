#!/usr/bin/env node
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { routes, SITE_URL, SOCIAL_IMAGE } from "../src/site-config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const index = path.join(client, "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");
const prerenderBundle = path.join(dist, "prerender", "prerender-entry.js");

for (const file of [index, worker, hosting, prerenderBundle]) {
  if (!existsSync(file)) throw new Error(`Missing Sites build input: ${file}`);
}

const { render } = await import(pathToFileURL(prerenderBundle).href);
const template = readFileSync(index, "utf8");

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const jsonLd = (route) => {
  const graph = [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Егор Гецевич",
      url: SITE_URL,
      jobTitle: "Разработчик сайтов и CRM",
      sameAs: [
        "https://t.me/egecxxxx",
        "https://www.instagram.com/_gecevich_/",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#business`,
      name: "Egor Digital",
      url: SITE_URL,
      image: SOCIAL_IMAGE,
      description: routes[0].description,
      priceRange: "20 000–100 000 ₽",
      founder: { "@id": `${SITE_URL}/#person` },
      areaServed: "Worldwide",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Egor Digital",
      url: SITE_URL,
      inLanguage: "ru-RU",
      publisher: { "@id": `${SITE_URL}/#business` },
    },
  ];

  if (route.path !== "/") {
    const nested = route.parentPath && route.parentLabel;
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}${route.path}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE_URL}/` },
        ...(nested ? [{ "@type": "ListItem", position: 2, name: route.parentLabel, item: `${SITE_URL}${route.parentPath}` }] : []),
        { "@type": "ListItem", position: nested ? 3 : 2, name: route.label, item: `${SITE_URL}${route.path}` },
      ],
    });
  }

  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c");
};

function setMeta(html, route, { notFound = false } = {}) {
  const canonical = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
  const robots = notFound ? "noindex,follow" : "index,follow";
  const replacements = [
    [/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`],
    [/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`],
    [/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`],
    [/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`],
    [/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(route.title)}" />`],
    [/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`],
    [/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`],
    [/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`],
    [/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`],
  ];

  let output = html;
  for (const [pattern, replacement] of replacements) output = output.replace(pattern, replacement);
  output = output.replace('<div id="root"></div>', `<div id="root">${render(route.path)}</div>`);
  output = output.replace("</head>", `    <script type="application/ld+json">${jsonLd(route)}</script>\n  </head>`);
  return output;
}

function writeRoute(route) {
  const html = setMeta(template, route);
  if (route.path === "/") {
    writeFileSync(index, html);
    return;
  }

  const slug = route.path.slice(1);
  writeFileSync(path.join(client, `${slug}.html`), html);
  const routeDirectory = path.join(client, slug);
  mkdirSync(routeDirectory, { recursive: true });
  writeFileSync(path.join(routeDirectory, "index.html"), html);
}

for (const route of routes) writeRoute(route);

const notFoundRoute = {
  path: "/404",
  label: "Страница не найдена",
  title: "404 — Страница не найдена | Egor Digital",
  description: "Запрошенная страница не найдена. Вернитесь на сайт Egor Digital или оставьте заявку.",
};
writeFileSync(path.join(client, "404.html"), setMeta(template, notFoundRoute, { notFound: true }));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map(({ path: routePath }) => `  <url><loc>${SITE_URL}${routePath === "/" ? "/" : routePath}</loc></url>`),
  "</urlset>",
  "",
].join("\n");
writeFileSync(path.join(client, "sitemap.xml"), sitemap);
writeFileSync(path.join(client, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));
rmSync(path.join(dist, "prerender"), { recursive: true, force: true });

console.log(`Prepared ${routes.length} prerendered routes with route-specific SEO metadata.`);
