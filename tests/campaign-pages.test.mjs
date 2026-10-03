import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { campaigns } from "../src/campaigns.js";
import { getRoute } from "../src/site-config.js";

test("advertising links resolve to complete pages with the matching offer and focused form", async () => {
  for (const campaign of campaigns) {
    const route = getRoute(`${campaign.path}/?utm_source=test`);
    assert.equal(route.path, campaign.path);
    assert.equal(route.nav, false);
    const html = await readFile(new URL(`../dist/client${campaign.path}.html`, import.meta.url), "utf8");
    assert.ok(html.includes(`<title>${campaign.title}</title>`));
    assert.ok(html.includes(`href="https://egordigital.site${campaign.path}"`));
    assert.ok(html.includes(`name="service" value="${campaign.service}"`));
    assert.ok(html.includes(campaign.label));
    assert.ok(html.includes('id="request"'));
    const privacyField = html.match(/<input[^>]*name="privacy"[^>]*>/)?.[0];
    assert.match(privacyField, /type="checkbox"/);
    assert.match(privacyField, /required=""/);
    assert.ok(!html.includes('class="service-choice"'));
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    await access(new URL(`../dist/client${campaign.path}/index.html`, import.meta.url));
    for (const [, source] of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)(?:\?[^\"]*)?"/g)) {
      await access(new URL(`../dist/client${source}`, import.meta.url));
    }
  }
});

test("advertising kit contains real assets and nine independently tagged ad drafts", async () => {
  const gallery = await readFile(new URL("../dist/client/offers/ad-kit.html", import.meta.url), "utf8");
  assert.ok(gallery.includes('content="noindex,nofollow"'));
  for (const campaign of campaigns) {
    assert.equal(campaign.adVariants.length, 3);
    assert.ok(gallery.includes(`href="${campaign.path}"`));
    for (let index = 1; index <= 3; index++) {
      assert.ok(gallery.includes(`utm_campaign=${campaign.id}&amp;utm_content=ad-${index}`));
    }
    const png = await readFile(new URL(`../dist/client/offers/banners/${campaign.id}.png`, import.meta.url));
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 1080);
    const svg = await readFile(new URL(`../dist/client/offers/banners/${campaign.id}.svg`, import.meta.url), "utf8");
    assert.ok(svg.includes('data:image/png;base64,'));
  }
});
