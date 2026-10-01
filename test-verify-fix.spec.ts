import { test, expect } from "@playwright/test";

test("Verify: 1 'Drawing from' bar at each step", async ({ page }) => {
  console.log("\n🔐 Logging in...");
  await page.goto("https://spiritual-oracle-web.netlify.app/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // Check what's on the page
  const emailInputs = await page.locator('input[type="email"]').count();
  console.log(`Found ${emailInputs} email input(s)`);

  if (emailInputs > 0) {
    await page.locator('input[type="email"]').fill("test@yopmail.com");
    await page.locator('input[type="password"]').fill("Test@123");

    // Try different button text variations
    const buttons = await page.locator("button").allTextContents();
    console.log("Buttons:", buttons);

    const signInButton = page.locator("button").filter({ hasText: /Sign|Log|Login/i }).first();
    if (await signInButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await signInButton.click();
      await page.waitForURL(/oracle|dashboard/, { timeout: 20000 }).catch(() => {});
    }
  }

  // Go to oracle
  console.log("\n🎯 Going to /oracle...");
  await page.goto("https://spiritual-oracle-web.netlify.app/oracle", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // Step 2: Select card
  console.log("\n📍 STEP 2: Select situation card");
  const cards = await page.locator("button").filter({ hasText: /Finding|Making|Overthinking/ }).all();
  console.log(`Found ${cards.length} situation cards`);

  if (cards.length > 0) {
    await cards[0].click();
    await page.waitForTimeout(1000);

    let count = await page.locator('p:has-text("Drawing from")').count();
    console.log(`✓ Bars visible: ${count} (expect 1)`);
    await page.screenshot({ path: "b-step2.png", fullPage: true });
    expect(count).toBe(1);
  }

  // Step 3: Switch tabs
  console.log("\n📍 STEP 3: Switch to Choose Text");
  await page.locator("button:has-text('Choose Text')").click();
  await page.waitForTimeout(1000);

  let count = await page.locator('p:has-text("Drawing from")').count();
  console.log(`✓ Bars visible: ${count} (expect 1)`);
  await page.screenshot({ path: "b-step3.png", fullPage: true });
  expect(count).toBe(1);

  // Step 4: Select text
  console.log("\n📍 STEP 4: Select text source");
  const textBtn = page.locator("button").filter({ hasText: /Bhagavad|Ramcharitmanas/ }).first();
  if (await textBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await textBtn.click();
    await page.waitForTimeout(1000);

    count = await page.locator('p:has-text("Drawing from")').count();
    console.log(`✓ Bars visible: ${count} (expect 1)`);
    await page.screenshot({ path: "b-step4.png", fullPage: true });
    expect(count).toBe(1);
  }

  // Step 5: Back to Guided
  console.log("\n📍 STEP 5: Back to Guided");
  await page.locator("button:has-text('Guided')").click();
  await page.waitForTimeout(1000);

  count = await page.locator('p:has-text("Drawing from")').count();
  console.log(`✓ Bars visible: ${count} (expect 1)`);
  await page.screenshot({ path: "b-step5.png", fullPage: true });
  expect(count).toBe(1);

  // Step 6: Click Change
  console.log("\n📍 STEP 6: Click Change");
  const changeBtn = page.locator("button:has-text('Change')");
  if (await changeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await changeBtn.click();
    await page.waitForTimeout(1000);

    count = await page.locator('p:has-text("Drawing from")').count();
    console.log(`✓ Bars visible: ${count} (expect 0 - cards shown)`);
    await page.screenshot({ path: "b-step6.png", fullPage: true });
    expect(count).toBe(0);
  }

  console.log("\n✅ TEST PASSED - NO DUPLICATE BARS!");
});
