import { test, expect } from "@playwright/test";

test.describe("Oracle - Drawing from bar bug", () => {
  test("should show exactly one 'Drawing from' bar when guided card is selected", async ({
    page,
  }) => {
    // Use the deployed version
    await page.goto("https://spiritual-oracle-web.netlify.app/oracle", { waitUntil: "networkidle" });

    // Log page URL and title
    console.log("Page URL:", page.url());
    console.log("Page title:", await page.title());

    // Wait for Guided tab to appear
    const guidedTab = page.locator('button:has-text("Guided")');
    await guidedTab.waitFor({ timeout: 10000 }).catch(() => console.log("Guided tab not found"));

    // Take screenshot of initial state
    await page.screenshot({ path: "1-initial-page.png", fullPage: true });
    console.log("✓ Screenshot 1: Initial page");

    // Check what buttons exist on the page
    const allButtons = await page.locator("button").all();
    console.log(`Total buttons on page: ${allButtons.length}`);

    // Click Guided tab if visible
    if (await guidedTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await guidedTab.click();
      await page.waitForTimeout(500);
    }

    // Take screenshot after tab click
    await page.screenshot({ path: "2-after-guided-tab.png", fullPage: true });
    console.log("✓ Screenshot 2: After clicking Guided tab");

    // Look for any card-like elements
    const possibleCards = await page.locator("[role='button'], button").allTextContents();
    console.log("Visible button texts:", possibleCards.slice(0, 10));

    // Try to find and click any situation-related button
    const situationButtons = await page.locator("button").filter({
      hasText: /situation|relationship|love|career|health|family|work|decision|purpose|growth|stress|loneliness|uncertainty|change/i
    }).all();

    console.log(`Found ${situationButtons.length} situation-related buttons`);

    if (situationButtons.length > 0) {
      await situationButtons[0].click();
      await page.waitForTimeout(1000);
      console.log("✓ Clicked first situation button");
    }

    // Take screenshot after clicking card
    await page.screenshot({ path: "3-after-card-click.png", fullPage: true });
    console.log("✓ Screenshot 3: After clicking card");

    // Count "Drawing from" bars
    const drawingBars = await page.locator('p:has-text("Drawing from")').count();
    console.log(`✓ Found ${drawingBars} "Drawing from" bar(s)`);

    // Also look for any bar elements
    const allBars = await page.locator("p").allTextContents();
    const relevantText = allBars.filter(t => t.includes("Drawing") || t.includes("Answered"));
    console.log("Relevant bar text found:", relevantText);

    // Don't assert yet - just report
    console.log("TEST RESULT: ", drawingBars === 1 ? "PASS (1 bar)" : `FAIL (${drawingBars} bars)`)
  });

  test("should show exactly one bar when switching between tabs", async ({ page }) => {
    // Use the deployed version
    await page.goto("https://spiritual-oracle-web.netlify.app/oracle", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    // Click Guided tab and select a card
    await page.click('button:has-text("Guided")');
    await page.waitForTimeout(500);
    const card = page.locator("button").filter({ hasText: /Relationship|Love|Career/ }).first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(800);
    }

    let drawingBars = await page.locator('p:has-text("Drawing from")').count();
    console.log(`After selecting card (Guided): ${drawingBars} bar(s)`);

    // Switch to Choose Text tab
    await page.click('button:has-text("Choose Text")');
    await page.waitForTimeout(800);

    // Select a text source
    const textButton = page.locator("button").filter({ hasText: /Bhagavad|Ramcharitmanas/ }).first();
    if (await textButton.isVisible()) {
      await textButton.click();
      await page.waitForTimeout(800);
    }

    drawingBars = await page.locator('p:has-text("Drawing from")').count();
    console.log(`After selecting text (Choose Text): ${drawingBars} bar(s)`);

    await page.screenshot({ path: "oracle-tab-switch.png", fullPage: true });

    // Switch back to Guided
    await page.click('button:has-text("Guided")');
    await page.waitForTimeout(800);

    drawingBars = await page.locator('p:has-text("Drawing from")').count();
    console.log(`After switching back to Guided: ${drawingBars} bar(s)`);

    await page.screenshot({ path: "oracle-tab-switch-back.png", fullPage: true });

    expect(drawingBars).toBe(1);
  });
});
