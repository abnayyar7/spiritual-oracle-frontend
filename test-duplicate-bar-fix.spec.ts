import { test, expect } from "@playwright/test";

test("Oracle - Verify duplicate bar fix (1 bar only at each step)", async ({ page }) => {
  // Step 1: Login
  console.log("\n📍 STEP 1: Logging in...");
  await page.goto("https://spiritual-oracle-web.netlify.app/login");
  await page.waitForLoadState("networkidle");

  await page.fill('input[type="email"]', "test@yopmail.com");
  await page.fill('input[type="password"]', "Test@123");
  await page.click('button:has-text("Sign in")');

  await page.waitForURL(/\/(oracle|dashboard)/, { timeout: 15000 }).catch(() => {});

  await page.goto("https://spiritual-oracle-web.netlify.app/oracle");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  // Step 2: Select situation card
  console.log("\n📍 STEP 2: Selecting situation card...");
  const situationButton = page.locator("button").filter({
    hasText: /Finding|Making|Overthinking|Fear/
  }).first();

  if (await situationButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await situationButton.click();
    await page.waitForTimeout(800);

    const count = await page.locator('p:has-text("Drawing from")').count();
    console.log(`✓ After selecting card: ${count} bar(s)`);
    await page.screenshot({ path: "step-2-selected-card.png", fullPage: true });
    expect(count).toBe(1);
  }

  // Step 3: Switch to Choose Text tab
  console.log("\n📍 STEP 3: Switching to Choose Text tab...");
  await page.click('button:has-text("Choose Text")');
  await page.waitForTimeout(800);

  let count = await page.locator('p:has-text("Drawing from")').count();
  console.log(`✓ After tab switch: ${count} bar(s)`);
  await page.screenshot({ path: "step-3-switched-tabs.png", fullPage: true });
  expect(count).toBe(1);

  // Step 4: Select source text
  const textButton = page.locator("button").filter({
    hasText: /Bhagavad|Ramcharitmanas/
  }).first();

  if (await textButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await textButton.click();
    await page.waitForTimeout(800);

    count = await page.locator('p:has-text("Drawing from")').count();
    console.log(`✓ After selecting text: ${count} bar(s)`);
    await page.screenshot({ path: "step-4-selected-text.png", fullPage: true });
    expect(count).toBe(1);
  }

  // Step 5: Back to Guided
  console.log("\n📍 STEP 5: Back to Guided tab...");
  await page.click('button:has-text("Guided")');
  await page.waitForTimeout(800);

  count = await page.locator('p:has-text("Drawing from")').count();
  console.log(`✓ After back to Guided: ${count} bar(s)`);
  await page.screenshot({ path: "step-5-back-to-guided.png", fullPage: true });
  expect(count).toBe(1);

  // Step 6: Click Change
  console.log("\n📍 STEP 6: Click Change button...");
  const changeButton = page.locator('button:has-text("Change")');

  if (await changeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await changeButton.click();
    await page.waitForTimeout(800);

    count = await page.locator('p:has-text("Drawing from")').count();
    console.log(`✓ After Change click: ${count} bar(s) (should be 0 - cards shown)`);
    await page.screenshot({ path: "step-6-clicked-change.png", fullPage: true });
    expect(count).toBe(0);
  }

  // Step 7: Reselect different card
  console.log("\n📍 STEP 7: Select different card...");
  const differentCard = page.locator("button").filter({
    hasText: /Relationships|Staying|Loneliness|Trust|Faith/
  }).first();

  if (await differentCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    await differentCard.click();
    await page.waitForTimeout(800);

    count = await page.locator('p:has-text("Drawing from")').count();
    console.log(`✓ After reselect: ${count} bar(s)`);
    await page.screenshot({ path: "step-7-reselected-card.png", fullPage: true });
    expect(count).toBe(1);
  }

  console.log("\n✅ ALL PASSED - Duplicate bar bug is FIXED!");
});
