import { test, devices } from "@playwright/test";

test.describe("Oracle - Polished Compact Bar Screenshots", () => {
  // Desktop screenshot
  test("1. Desktop (1280px) - polished bar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1024 });

    console.log("\n🔐 Login (desktop)...");
    await page.goto("https://spiritual-oracle-web.netlify.app/login");
    await page.waitForTimeout(1000);

    // Fill login
    await page.locator('input[type="email"]').fill("test@yopmail.com").catch(() => {});
    await page.locator('input[type="password"]').fill("Test@123").catch(() => {});
    await page.locator("button").filter({ hasText: /Sign|Log/i }).first().click().catch(() => {});

    await page.waitForTimeout(2000);
    await page.goto("https://spiritual-oracle-web.netlify.app/oracle");
    await page.waitForTimeout(2000);

    // Select card
    const card = page.locator("button").filter({ hasText: /Finding|Making|Overthinking/ }).first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1000);

      // Screenshot just the bar
      const bar = page.locator("div").filter({ hasText: /Drawing from the/ }).first();
      if (await bar.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log("✓ Captured desktop bar");
        await bar.screenshot({ path: "desktop-1280-bar.png" });
      }
    }
  });

  // Mobile screenshot
  test("2. Mobile (375px) - polished bar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    console.log("\n🔐 Login (mobile)...");
    await page.goto("https://spiritual-oracle-web.netlify.app/login");
    await page.waitForTimeout(1000);

    // Fill login
    await page.locator('input[type="email"]').fill("test@yopmail.com").catch(() => {});
    await page.locator('input[type="password"]').fill("Test@123").catch(() => {});
    await page.locator("button").filter({ hasText: /Sign|Log/i }).first().click().catch(() => {});

    await page.waitForTimeout(2000);
    await page.goto("https://spiritual-oracle-web.netlify.app/oracle");
    await page.waitForTimeout(2000);

    // Select card
    const card = page.locator("button").filter({ hasText: /Finding|Making|Overthinking/ }).first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await card.click();
      await page.waitForTimeout(1000);

      // Screenshot just the bar
      const bar = page.locator("div").filter({ hasText: /Drawing from the/ }).first();
      if (await bar.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log("✓ Captured mobile bar");
        await bar.screenshot({ path: "mobile-375-bar.png" });
      }
    }
  });
});
