import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const baseUrl = "https://store.egordigital.site";
const outputDirectory = path.resolve(
  "audit",
  "production-store-2026-08-31",
);

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();

async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1_200);
}

async function capture(page, name) {
  await page.screenshot({
    path: path.join(outputDirectory, `${name}.png`),
    fullPage: false,
  });
}

try {
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 810 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  });
  const page = await desktop.newPage();

  await page.goto(`${baseUrl}/`);
  await settle(page);
  await capture(page, "home-desktop");

  await page.goto(`${baseUrl}/catalog`);
  await settle(page);
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".catalog-product-image img")]
      .slice(0, 4)
      .every((image) => image.complete && image.naturalWidth > 0),
  );
  await capture(page, "catalog-desktop");

  await page.goto(`${baseUrl}/product/retro-bolid`);
  await settle(page);
  await capture(page, "product-desktop");
  await page.locator(".product-reviews").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await capture(page, "product-reviews-desktop");

  await page.goto(`${baseUrl}/catalog`);
  await settle(page);
  await page.getByRole("button", { name: "В корзину" }).first().click();
  await page.getByRole("button", { name: "Добавлено" }).first().waitFor();
  await page.goto(`${baseUrl}/cart`);
  await settle(page);
  await capture(page, "cart-desktop");

  await page.getByRole("link", { name: /Оформить заказ/i }).click();
  await settle(page);
  await capture(page, "checkout-desktop");

  const adminPage = await desktop.newPage();
  await adminPage.goto(`${baseUrl}/login?callbackUrl=/admin`);
  await settle(adminPage);
  try {
    await adminPage.getByRole("button", { name: "Войти" }).click();
    await adminPage.waitForURL(`${baseUrl}/admin`, { timeout: 15_000 });
    await settle(adminPage);
    await capture(adminPage, "admin-desktop");
  } catch {
    // Повторные запуски могут попасть под rate limit публичного входа.
  }
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${baseUrl}/`);
  await settle(mobilePage);
  await capture(mobilePage, "home-mobile");
  await mobile.close();
} finally {
  await browser.close();
}
