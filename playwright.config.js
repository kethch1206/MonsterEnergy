// @ts-check
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"], // Terminal output
    ["html"], // HTML report (not auto-opened)
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "https://campaigns.monsterenergyloyalty.com",
    extraHTTPHeaders: {
      Cookie: "cookie-consent=accepted; cookie-banner=dismissed",
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    headless: false,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - only run when explicitly needed
    {
      name: "setup",
      use: {
        ...devices["Desktop Chrome"],
        headless: false, // Show browser for manual operations
      },
      testMatch: /.*\.setup\.js/,
    },

    // Login tests - manual login without pre-auth
    {
      name: "login-tests",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/e2e/*[Ll]ogin*.spec.js"],
    },

    // Protected tests - use saved authentication state
    {
      name: "protected-tests",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      testMatch: ["**/e2e/*[Oo]sheaga*.spec.js"],
    },

    // All other e2e tests (excluding those already defined in other projects)
    {
      name: "other-e2e-tests",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["**/e2e/**/*.spec.js"],
      testIgnore: ["**/e2e/*[Ll]ogin*.spec.js", "**/e2e/*[Oo]sheaga*.spec.js"],
    },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
