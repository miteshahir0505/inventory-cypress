# Inventory Cypress

![Cypress Tests](https://github.com/miteshahir0505/inventory-cypress/actions/workflows/cypress.yml/badge.svg)

End-to-end test suite for a small inventory management app, built with Cypress and TypeScript. The app is an Express server with a vanilla JS frontend. The tests cover login, product management, input validation, and network behavior.

## Tech stack

- Cypress 16
- TypeScript 7
- Node.js 22
- Express 5 (the app under test)
- GitHub Actions (CI)

## Getting started

```bash
npm install
npm run start:app
```

The app runs at http://localhost:3000. Log in with `admin` / `secret123`.

## Running the tests

Start the app in one terminal, then in another:

```bash
npm run cy:open     # interactive runner (Chrome)
npm run cy:run      # headless run (Chrome)
npm run typecheck   # TypeScript check, no emit
```

## Project structure

```
app/
  server.js                 Express app and API (includes POST /api/reset)
  public/index.html         Frontend
cypress/
  e2e/
    login.cy.ts             Login flows
    products-network.cy.ts  API behavior using cy.intercept
    inventory.cy.ts         Add, delete, validation, XSS literal-text, error handling
  support/
    commands.ts             Custom commands: cy.login(), cy.addProduct()
    e2e.ts                  Support file
cypress.config.ts           Cypress configuration (baseUrl)
tsconfig.json               TypeScript configuration
.github/workflows/
  cypress.yml               CI workflow
```

## Testing approach

- **Selectors:** all elements are selected through `data-cy` attributes.
- **Authentication:** `cy.login()` uses `cy.session` to cache the login across tests.
- **Test isolation:** each test starts with `POST /api/reset` so the data is always in a known state.
- **Custom command:** `cy.addProduct({ name, sku, price, quantity })` fills and submits the product form. It performs the action only, and each test makes its own assertions.
- **Data-driven tests:** invalid price and quantity cases run from a single array.
- **Network:** `cy.intercept` is used only to spy on requests or stub server responses.
- **Relative assertions:** row counts are compared against the count before the action, not hard-coded.

## Continuous integration

On every push to `main` and every pull request, the workflow installs dependencies, runs the type check, starts the app, waits for it to respond, and runs the Cypress suite headlessly. Screenshots are uploaded as an artifact when a run fails.

## Known gaps

- **No error handling for server errors (500).** `index.html` handles only 400 and 409 responses. On a 500, no error message is shown and the form is cleared. The test `shows an error when the server fails to save a product` documents this and is marked `it.skip` until the app is fixed.
- **Questionable inputs are accepted.** The API accepts price `0`, decimal prices such as `10.5`, quantity `0`, and decimal quantities such as `1.5`. No tests exist for these because there is no requirement saying whether they are valid.