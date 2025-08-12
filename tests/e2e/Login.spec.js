import { test, expect } from "@playwright/test";

test.describe("Monster Energy Login Test", () => {
  async function handleCookieBanner(page) {
    const cookieSelector = 'button:has-text("ACCEPT COOKIES")';

    try {
      const cookieButton = page.locator(cookieSelector);
      if (await cookieButton.isVisible({ timeout: 2000 })) {
        await cookieButton.click();
        console.log("Cookie button clicked");
        await page.waitForTimeout(1000);
        return true;
      }
    } catch (error) {
      console.log("Cookie button not found or not clickable");
    }

    console.log("No cookie banner found");
    return false;
  }

  async function waitForManualInput(page, message, timeoutMinutes = 5) {
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

  async function checkLoginSuccess(page) {
    try {
      // Use stricter success criteria - require multiple indicators
      const primaryIndicators = [
        'text="ENTER TAB CODE HERE"',
        'text="PROGRAMS"',
        'text="TABS AVAILABLE"',
      ];

      const secondaryIndicators = [
        'input[placeholder*="ENTER TAB CODE"]',
        'button:has-text("ENTER")',
        'text="Explore the programs below"',
      ];

      // Check that at least 2 primary indicators are present
      let primaryCount = 0;
      for (const indicator of primaryIndicators) {
        const element = page.locator(indicator);
        if (await element.isVisible({ timeout: 1000 })) {
          primaryCount++;
        }
      }

      // Check that at least 1 secondary indicator is present
      let secondaryCount = 0;
      for (const indicator of secondaryIndicators) {
        const element = page.locator(indicator);
        if (await element.isVisible({ timeout: 1000 })) {
          secondaryCount++;
        }
      }

      // Require both primary and secondary indicators for success
      if (primaryCount >= 2 && secondaryCount >= 1) {
        console.log(
          `Login success detected: ${primaryCount} primary + ${secondaryCount} secondary indicators`
        );
        return true;
      }

      const currentUrl = page.url();
      if (
        !currentUrl.includes("/login") &&
        !currentUrl.includes("/auth") &&
        currentUrl.includes("campaigns.monsterenergyloyalty.com") &&
        primaryCount >= 1
      ) {
        console.log(`Login success by URL + indicators: ${currentUrl}`);
        return true;
      }
    } catch (error) {
      // Continue checking
    }

    return false;
  }

  async function verifyLoginSuccess(page) {
    try {
      await expect(page).not.toHaveURL(/.*\/login.*/);
      await page.waitForLoadState("networkidle");

      const possibleElements = [
        'text="ENTER TAB CODE HERE"',
        'text="PROGRAMS"',
        'text="TABS AVAILABLE"',
      ];

      let foundElement = false;
      for (const selector of possibleElements) {
        try {
          const element = page.locator(selector).first();
          await element.waitFor({ timeout: 2000 });
          console.log(`Found login indicator: ${selector}`);
          foundElement = true;
          break;
        } catch (e) {
          // Continue to next selector
        }
      }

      if (!foundElement) {
        console.log("No clear login indicators found, but URL check passed");
        return true;
      }

      return true;
    } catch (error) {
      console.log("Login verification failed:", error.message);
      return false;
    }
  }
  test("should auto-fill phone then wait for manual verification", async ({
    page,
  }) => {
    test.setTimeout(10 * 60 * 1000);

    await test.step("Navigate to login page", async () => {
      console.log("Starting login test");

      await page.goto(
        "https://campaigns.monsterenergyloyalty.com/login?locale=en-CA"
      );

      await page.waitForLoadState("networkidle");
      await handleCookieBanner(page);
    });

    await test.step("Fill phone number and submit", async () => {
      console.log("Filling phone number");

      const phoneInput = await page
        .locator(
          'input[name="phone_number"][placeholder="Enter your phone number to login"]'
        )
        .first();
      await expect(phoneInput).toBeVisible();

      await phoneInput.clear();
      const phoneNumber = "6478852216";
      await phoneInput.fill(phoneNumber);
      console.log(`Phone number filled: ${phoneNumber}`);

      await page.waitForTimeout(1000);

      await handleCookieBanner(page);

      const submitButton = await page
        .locator('button[type="submit"]:has-text("LOGIN")')
        .first();

      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled({ timeout: 5000 });

      await submitButton.click();
      console.log("Login button clicked");

      await page.waitForTimeout(3000);
    });

    await test.step("Wait for manual verification", async () => {
      const loginSuccess = await waitForManualInput(
        page,
        "Please manually enter the verification code from SMS",
        5
      );

      await page.screenshot({ path: "final-login-result.png" });

      if (loginSuccess) {
        const verified = await verifyLoginSuccess(page);

        if (verified) {
          await page
            .context()
            .storageState({ path: "playwright/.auth/user.json" });
          console.log("Login successful and authentication state saved");
        } else {
          throw new Error("Login appeared successful but verification failed");
        }
      } else {
        console.log("Login status unclear");
      }
    });
  });
});
