# Monster Energy Playwright E2E Test Project

This project contains end-to-end (E2E) tests for the Monster Energy campaign web application, using [Playwright](https://playwright.dev/).

## Project Structure

```
MonsterEnergy/
├── tests/
│   ├── e2e/                # Main E2E test files (Login, Osheaga, etc.)
│   ├── pages/              # Page Object Model (POM) classes
│   ├── utils/              # Shared test utilities
│   └── data/               # Test data files
├── playwright.config.js    # Playwright configuration
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or above recommended)
- npm (comes with Node.js)

### Install Dependencies

```
npm install
```

### Run All Tests

```
npx playwright test
```

### Run a Specific Test File

```
npx playwright test tests/e2e/Osheaga.spec.js
```

### Run a Specific Test Case

```
npx playwright test tests/e2e/Osheaga.spec.js -g "should increase cart number by 1"
```

### View HTML Test Report

```
npx playwright show-report
```

## Authentication

- The tests include an auto-login helper. If not logged in, the test will fill in the phone number and log in automatically.
- Update the phone number in `ensureLoggedIn` if your test account changes.

## Customization

- Update selectors in the Page Object files or test files if the UI changes.
- Add new test cases in the `tests/e2e/` directory as needed.

## Troubleshooting

- If tests fail due to cookie banners or login issues, check the selectors in `ensureLoggedIn` and cookie banner handling logic.
- Use Playwright's debug mode for step-by-step investigation:
  ```
  npx playwright test tests/e2e/Osheaga.spec.js --debug
  ```
