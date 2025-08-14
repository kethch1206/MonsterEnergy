import { expect } from "@playwright/test";

// Lightweight POM for Login page elements and operations
export class LoginPageElements {
  constructor(page) {
    this.page = page;
    this.phoneInput =
      'input[name="phone_number"][placeholder="Enter your phone number to login"]';
    this.loginButton = 'button[type="submit"]:has-text("LOGIN")';
    this.errorMessage =
      '.error-message, [data-testid="error"], .field-error, .validation-error';
  }

  async navigate() {
    await this.page.goto("/login?locale=en-CA");
    await this.page.waitForLoadState("networkidle");
  }

  async fillPhone(value) {
    const input = this.page.locator(this.phoneInput).first();
    await this.forceClearPhone();
    await input.fill(value);
  }

  async clearPhone() {
    const input = this.page.locator(this.phoneInput).first();
    await input.clear();
  }

  async forceClearPhone() {
    const input = this.page.locator(this.phoneInput).first();

    // Multiple clearing strategies to handle auto-fill issues
    await input.clear();
    await this.page.waitForTimeout(100);

    // Select all and delete
    await input.selectText();
    await input.press("Delete");
    await this.page.waitForTimeout(100);

    // Try keyboard shortcut
    await input.focus();
    await input.press("Control+a");
    await input.press("Delete");
    await this.page.waitForTimeout(100);

    // Final clear
    await input.clear();

    // Verify it's actually empty
    const finalValue = await input.inputValue();
    if (finalValue && finalValue.trim() !== "") {
      console.log(
        `⚠️ Phone field still contains: "${finalValue}" after force clear`
      );
      // Try one more time with JavaScript
      await this.page.evaluate(() => {
        const phoneInput = document.querySelector('input[name="phone_number"]');
        if (phoneInput) {
          phoneInput.value = "";
          phoneInput.dispatchEvent(new Event("input", { bubbles: true }));
          phoneInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    }
  }

  async clickPhone() {
    const input = this.page.locator(this.phoneInput).first();
    await input.click();
  }

  async clickOutside() {
    // Click on the page background to trigger blur
    await this.page.click("body");
  }

  async pressTab() {
    const input = this.page.locator(this.phoneInput).first();
    await input.press("Tab");
  }

  async isLoginButtonEnabled() {
    const button = this.page.locator(this.loginButton).first();
    return await button.isEnabled();
  }

  async getPhoneInputValue() {
    const input = this.page.locator(this.phoneInput).first();
    return await input.inputValue();
  }

  async getErrorMessage() {
    const errorElements = this.page.locator(this.errorMessage);
    const count = await errorElements.count();

    for (let i = 0; i < count; i++) {
      const element = errorElements.nth(i);
      if (await element.isVisible()) {
        return await element.textContent();
      }
    }
    return null;
  }

  async isErrorMessageVisible() {
    const errorElements = this.page.locator(this.errorMessage);
    const count = await errorElements.count();

    for (let i = 0; i < count; i++) {
      const element = errorElements.nth(i);
      if (await element.isVisible()) {
        return true;
      }
    }
    return false;
  }
}
