import { test, expect } from "@playwright/test";

test.describe("Post-Login Tests - Osheaga", () => {
  // These tests will automatically use the saved authentication state

  test.beforeEach(async ({ page }) => {
    // Common setup for all tests
    console.log("Setting up test with authenticated state");
  });

  test("should access user dashboard when logged in", async ({ page }) => {
    console.log("Testing dashboard access");

    // Navigate directly to dashboard or protected page
    await page.goto(
      "https://campaigns.monsterenergyloyalty.com/home?locale=en-CA"
    );

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Verify we're logged in (not redirected to login page)
    await expect(page).not.toHaveURL(/.*\/login.*/);

    console.log("Dashboard access successful");
    console.log("URL:", page.url());

    // Take screenshot for verification
    await page.screenshot({ path: "dashboard-logged-in.png" });
  });

  test("should maintain session across page reloads", async ({ page }) => {
    console.log("Testing session persistence across reloads");

    // Go to a protected page
    await page.goto(
      "https://campaigns.monsterenergyloyalty.com/home?locale=en-CA"
    );
    await page.waitForLoadState("networkidle");

    const initialUrl = page.url();
    console.log("Initial URL:", initialUrl);

    // Reload the page
    await page.reload();
    await page.waitForLoadState("networkidle");

    const afterReloadUrl = page.url();
    console.log("URL after reload:", afterReloadUrl);

    // Should still be on the same page (not redirected to login)
    await expect(page).not.toHaveURL(/.*\/login.*/);

    console.log("Session maintained successfully across reload");

    // Take screenshot for verification
    await page.screenshot({ path: "after-reload.png" });
  });
});
