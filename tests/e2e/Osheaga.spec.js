import { test, expect } from "@playwright/test";

async function ensureLoggedIn(page) {
  await page.goto("/home?locale=en-CA");
  await page.waitForLoadState("networkidle");

  // Handle cookie banner if present
  try {
    await page
      .locator('button:has-text("ACCEPT COOKIES")')
      .click({ timeout: 2000 });
  } catch (e) {}

  if (page.url().includes("/login")) {
    // Try to find the phone input by name only, in case placeholder is not correct
    let phoneInput = page.locator('input[name="phone_number"]');
    await expect(phoneInput).toBeVisible({ timeout: 5000 });

    // Debug log for troubleshooting
    const placeholder = await phoneInput.getAttribute("placeholder");
    const value = await phoneInput.inputValue();
    console.log("Login input placeholder:", placeholder, "value:", value);

    await phoneInput.fill("6478852216");
    const loginButton = page.locator('button[type="submit"]:has-text("LOGIN")');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 20000,
    });
  }
}

test.describe("Post-Login Tests - Osheaga", () => {
  // These tests will automatically use the saved authentication state

  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test("should navigate to Osheaga page when clicking sidebar Osheaga button", async ({
    page,
  }) => {
    await page.goto("/home?source=sidebar&locale=en-CA");
    await page.waitForLoadState("networkidle");

    const osheagaBtn = page.locator(
      'button[title="Osheaga"], button[aria-label*="Osheaga"]'
    );
    await expect(osheagaBtn).toBeVisible();
    await osheagaBtn.click();

    await expect(page).toHaveURL(/osheaga|rewards/i);
    await expect(page.locator("text=COLLECT AND REDEEM")).toBeVisible();
  });

  test("should increase cart number by 1 when redeeming Sullivan King", async ({
    page,
  }) => {
    await page.goto("/rewards?source=sidebar&locale=en-CA");
    await page.waitForLoadState("networkidle");

    // Get the current cart number
    const cartNumberLocator = page.locator(
      "button.items-center.justify-center.rounded-full span.text-primary"
    );
    await expect(cartNumberLocator).toBeVisible();
    const beforeText = await cartNumberLocator.innerText();
    const before = parseInt(beforeText) || 0;

    // Find the REDEEM button inside the Sullivan King card
    const redeemButton = page
      .locator('div:has-text("Sullivan King") button:has-text("REDEEM")')
      .first();
    await expect(redeemButton).toBeVisible();
    await redeemButton.click();

    // Check the cart number increased by 1
    await expect(cartNumberLocator).toHaveText((before + 1).toString());
  });
});
