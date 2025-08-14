// Shared utility functions for Playwright tests

/**
 * Basic cookie banner handler
 * @param {Page} page - Playwright page object
 */
export async function handleCookieBanner(page) {
  const cookieSelectors = [
    'button:has-text("accept cookies")',
    '[data-testid="accept-cookies"]',
    ".cookie-accept",
    'button[id*="cookie"]',
    'button[class*="cookie"]',
  ];

  try {
    for (const selector of cookieSelectors) {
      const cookieButton = page.locator(selector);
      if (await cookieButton.isVisible({ timeout: 1000 })) {
        console.log(`Found cookie button with selector: ${selector}`);
        await cookieButton.click();
        console.log("Cookie button clicked");
        await page.waitForTimeout(2000); // Wait longer for banner to disappear
        return;
      }
    }
    console.log("No cookie banner found");
  } catch (error) {
    console.log("Error handling cookie banner:", error.message);
  }

  console.log("Cookie banner handling completed");
}

/**
 * Enhanced cookie banner handler with better detection
 * @param {Page} page - Playwright page object
 */
export async function handleCookieBannerAdvanced(page) {
  console.log("Looking for cookie banner...");

  // Wait a bit for page to stabilize
  await page.waitForTimeout(1000);

  const cookieSelectors = [
    'button:has-text("ACCEPT COOKIES")',
    'button:has-text("Accept Cookies")',
    'button:has-text("accept cookies")',
    'button[data-testid*="accept"]',
    'button[id*="accept"]',
    'button[class*="accept"]',
    ".cookie-banner button",
    '[role="banner"] button',
    ".cookie-consent button",
  ];

  try {
    // Try each selector with a reasonable timeout
    for (const selector of cookieSelectors) {
      console.log(`Checking selector: ${selector}`);
      const cookieButton = page.locator(selector);

      // Check if element exists and is visible
      const count = await cookieButton.count();
      if (count > 0) {
        const isVisible = await cookieButton
          .first()
          .isVisible({ timeout: 500 });
        if (isVisible) {
          console.log(`✓ Found cookie button with selector: ${selector}`);
          await cookieButton.first().click();
          console.log("✓ Cookie button clicked successfully");

          // Wait for banner to disappear
          await page.waitForTimeout(2000);

          // Verify banner is gone
          const stillVisible = await cookieButton
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
          if (!stillVisible) {
            console.log("✓ Cookie banner successfully dismissed");
          }
          return;
        }
      }
    }

    console.log("ℹ️ No cookie banner found or already dismissed");
  } catch (error) {
    console.log("⚠️ Error handling cookie banner:", error.message);
  }
}

/**
 * Check if login was successful by looking for success indicators
 * @param {Page} page - Playwright page object
 * @returns {boolean} - True if login success is detected
 */
export async function checkLoginSuccess(page) {
  try {
    // Define login success indicators
    const successIndicators = [
      'text="ENTER TAB CODE HERE"',
      'text="PROGRAMS"',
      'text="TABS AVAILABLE"',
      'input[placeholder*="ENTER TAB CODE"]',
      'button:has-text("ENTER")',
      'text="Explore the programs below"',
    ];

    // Check for any success indicators
    for (const indicator of successIndicators) {
      const element = page.locator(indicator);
      if (await element.isVisible({ timeout: 1000 })) {
        console.log(`Login success detected with indicator: ${indicator}`);
        return true;
      }
    }

    // Check URL as secondary indicator
    const currentUrl = page.url();
    if (
      !currentUrl.includes("/login") &&
      !currentUrl.includes("/auth") &&
      currentUrl.includes("campaigns.monsterenergyloyalty.com")
    ) {
      console.log(`Login success detected by URL change: ${currentUrl}`);
      return true;
    }
  } catch (error) {
    console.log("Error checking login success:", error.message);
  }

  return false;
}

/**
 * Wait for manual user input during login process
 * @param {Page} page - Playwright page object
 * @param {string} message - Message to display to user
 * @param {number} timeoutMinutes - Timeout in minutes (default: 5)
 * @returns {boolean} - True if login detected within timeout
 */
export async function waitForManualInput(page, message, timeoutMinutes = 5) {
  console.log(message);
  console.log(`Timeout: ${timeoutMinutes} minutes`);
  console.log("Waiting for manual operations...");

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const startTime = Date.now();
  const initialUrl = page.url();

  while (Date.now() - startTime < timeoutMs) {
    await page.waitForTimeout(5000);

    await handleCookieBanner(page);

    const currentUrl = page.url();
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

    const isLoggedIn = await checkLoginSuccess(page);

    if (isLoggedIn || currentUrl !== initialUrl) {
      console.log(`Login detected. URL: ${currentUrl}`);
      return true;
    }

    console.log(`Waited ${elapsedSeconds} seconds`);
  }

  console.log("Timeout reached");
  return false;
}

/**
 * Verify login success with expect assertions
 * @param {Page} page - Playwright page object
 * @returns {boolean} - True if login verification passes
 */
export async function verifyLoginSuccess(page) {
  const { expect } = await import("@playwright/test");

  try {
    // Ensure we're not on login page
    await expect(page).not.toHaveURL(/.*\/login.*/);
    await page.waitForLoadState("networkidle");

    // Look for any login success indicator
    const successIndicators = [
      'text="ENTER TAB CODE HERE"',
      'text="PROGRAMS"',
      'text="TABS AVAILABLE"',
    ];

    for (const selector of successIndicators) {
      try {
        const element = page.locator(selector).first();
        await element.waitFor({ timeout: 2000 });
        console.log(`Login verified with indicator: ${selector}`);
        return true;
      } catch (e) {
        // Continue to next selector
      }
    }

    // If no indicators found but URL check passed, still consider success
    console.log("Login verified by URL check (no specific indicators found)");
    return true;
  } catch (error) {
    console.log("Login verification failed:", error.message);
    return false;
  }
}
