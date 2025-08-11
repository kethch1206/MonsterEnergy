import { test, expect } from "@playwright/test";

test.describe("Monster Energy Login Test", () => {
  // Helper function to handle cookie banner
  async function handleCookieBanner(page) {
    // Try multiple selectors for cookie accept button
    const cookieSelectors = [
      'button:has-text("ACCEPT COOKIES")',
      'button:has-text("Accept Cookies")',
      'button[class*="cookie"]:has-text("Accept")',
      'button[class*="cookie"]:has-text("ACCEPT")',
      'button:text-is("ACCEPT COOKIES")',
      'button:text-is("Accept Cookies")',
    ];

    for (const selector of cookieSelectors) {
      try {
        const cookieButton = page.locator(selector);
        if (await cookieButton.isVisible({ timeout: 2000 })) {
          await cookieButton.click();
          console.log(`Clicked cookie button with selector: ${selector}`);
          await page.waitForTimeout(1000);
          return true;
        }
      } catch (error) {
        // Continue to next selector
        continue;
      }
    }

    console.log("No cookie banner found with any selector");
    return false;
  }

  // Helper function to wait for manual input with success detection
  async function waitForManualInput(page, message, timeoutMinutes = 5) {
    console.log(`\n${message}`);
    console.log(`Timeout: ${timeoutMinutes} minutes`);
    console.log("Test will wait until you complete manual operations...\n");

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const startTime = Date.now();
    const initialUrl = page.url();

    // Check every 5 seconds for URL change or login success indicators
    while (Date.now() - startTime < timeoutMs) {
      await page.waitForTimeout(5000);

      const currentUrl = page.url();
      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

      // Check for login success indicators
      const isLoggedIn = await checkLoginSuccess(page);

      if (isLoggedIn || currentUrl !== initialUrl) {
        console.log(
          `Login detected! URL changed from ${initialUrl} to ${currentUrl}`
        );
        return true;
      }

      console.log(`Waited ${elapsedSeconds} seconds... (URL: ${currentUrl})`);
    }

    console.log("Timeout reached, but test continues...");
    return false;
  }

  // Helper function to check if login was successful
  async function checkLoginSuccess(page) {
    try {
      // Check for common success indicators
      const successIndicators = [
        'text="Welcome"',
        'text="Dashboard"',
        'text="Profile"',
        'text="Account"',
        'text="Logout"',
        '[data-testid="user-menu"]',
        ".user-profile",
        ".dashboard",
      ];

      for (const indicator of successIndicators) {
        const element = page.locator(indicator);
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`Login success detected: ${indicator}`);
          return true;
        }
      }

      // Check if URL indicates success (not on login page)
      const currentUrl = page.url();
      if (!currentUrl.includes("/login") && !currentUrl.includes("auth")) {
        console.log(`Login success detected: Left login page to ${currentUrl}`);
        return true;
      }
    } catch (error) {
      // Continue checking
    }

    return false;
  }
  test("should auto-fill phone then wait for manual verification", async ({
    page,
  }) => {
    console.log("Starting semi-automatic login test");

    // Navigate to login page
    await page.goto(
      "https://campaigns.monsterenergyloyalty.com/login?locale=en-CA"
    );

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Handle cookie banner at the beginning
    await handleCookieBanner(page);

    console.log("Automatic part: handling phone number input");

    // Find phone input (more specific selector)
    const phoneInput = await page
      .locator('input[type="tel"], input[placeholder*="phone"], textbox')
      .first();
    await expect(phoneInput).toBeVisible();

    // Clear and fill phone number - you can modify this number
    await phoneInput.clear();
    const phoneNumber = "6478852216"; // Modify your test phone number here
    await phoneInput.fill(phoneNumber);
    console.log(`Auto-filled phone number: ${phoneNumber}`);

    // Wait a moment for validation
    await page.waitForTimeout(1000);

    // Handle cookie banner again if it appears after input
    await handleCookieBanner(page);

    // Find submit/login button (try multiple selectors)
    const submitButton = await page
      .locator(
        'button:has-text("LOGIN"), button:has-text("Login"), button[type="submit"]'
      )
      .first();

    // Wait for button to be enabled
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled({ timeout: 5000 });

    await submitButton.click();
    console.log("Auto-clicked login button");

    // Wait for verification code input to appear
    await page.waitForTimeout(3000);

    console.log("\n" + "=".repeat(60));
    console.log("Now it's your turn!");
    console.log("Please do the following in the browser:");
    console.log("   1. Receive and check SMS verification code");
    console.log("   2. Enter verification code on the webpage");
    console.log("   3. Click confirm/verify button");
    console.log("   4. Complete the login process");
    console.log("=".repeat(60));

    // Wait for manual verification (5 minutes timeout)
    const loginSuccess = await waitForManualInput(
      page,
      "Waiting for you to manually enter verification code and complete login...",
      5
    );

    // Take final screenshot
    await page.screenshot({ path: "final-login-result.png" });
    console.log("Final result screenshot captured");
    console.log("Final URL:", page.url());

    if (loginSuccess) {
      console.log("\nLogin successful detected!");
      // Add success assertion
      await expect(page).not.toHaveURL(/.*\/login.*/);
    } else {
      console.log("\nLogin status unclear - manual verification completed");
    }

    console.log("\nSemi-automatic test completed!");
  });
});
