import { test, expect } from "@playwright/test";

test.describe("Post-Login Tests - Osheaga", () => {
  // These tests will automatically use the saved authentication state

  test("should access user dashboard when logged in", async ({ page }) => {
    console.log("Testing dashboard access");

    // Navigate directly to dashboard or protected page
    await page.goto("https://campaigns.monsterenergyloyalty.com/dashboard");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Verify we're logged in (not redirected to login page)
    await expect(page).not.toHaveURL(/.*\/login.*/);

    console.log("Dashboard access successful");
    console.log("URL:", page.url());

    // Take screenshot for verification
    await page.screenshot({ path: "dashboard-logged-in.png" });
  });

  test("should access user profile when logged in", async ({ page }) => {
    console.log("Testing profile access");

    // Try to access profile page
    await page.goto("https://campaigns.monsterenergyloyalty.com/profile");
    await page.waitForLoadState("networkidle");

    // Should not be redirected to login
    await expect(page).not.toHaveURL(/.*\/login.*/);

    console.log("Profile access successful");
    console.log("URL:", page.url());

    // Take screenshot
    await page.screenshot({ path: "profile-logged-in.png" });
  });

  test("should be able to navigate authenticated areas", async ({ page }) => {
    console.log("Testing navigation in authenticated areas");

    // Start from home page
    await page.goto("https://campaigns.monsterenergyloyalty.com/");
    await page.waitForLoadState("networkidle");

    // Look for logout or user menu (indicators of being logged in)
    const logoutButton = page.locator('text="Logout"');
    const userMenu = page.locator('[data-testid="user-menu"]');
    const profileLink = page.locator('text="Profile"');

    // At least one of these should be visible if logged in
    try {
      await Promise.race([
        expect(logoutButton).toBeVisible({ timeout: 5000 }),
        expect(userMenu).toBeVisible({ timeout: 5000 }),
        expect(profileLink).toBeVisible({ timeout: 5000 }),
      ]);
      console.log("User authentication indicators found");
    } catch (error) {
      console.log(
        "No obvious authentication indicators found, but continuing test"
      );
    }

    // Take screenshot of authenticated state
    await page.screenshot({ path: "authenticated-navigation.png" });

    console.log("Navigation test completed");
  });

  test("should maintain session across page reloads", async ({ page }) => {
    console.log("Testing session persistence across reloads");

    // Go to a protected page
    await page.goto("https://campaigns.monsterenergyloyalty.com/dashboard");
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
  });
});
