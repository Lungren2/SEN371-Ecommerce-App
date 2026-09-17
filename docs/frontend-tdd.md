# Frontend TDD workflow

Frontend UI work follows a Red-Green-Refactor cycle.

## Red

Write or update the smallest user-facing test before changing the component. Prefer accessible queries such as role, label, and visible text over CSS implementation details.

Run the focused component suite:

```bash
cd GrandmastersHub/GrandmastersHub.Api/client
npm run test:ui -- --grep "behavior under test"
```

Confirm the new test fails for the expected missing or incorrect behavior. A failing test caused by setup, routing, or an unrelated API mock is not a valid Red step.

## Green

Make the minimum UI change needed to satisfy the failing test. Keep the test focused on observable behavior:

- what renders
- what changes after a click
- disabled/enabled state
- navigation outcome
- loading, empty, success, and error feedback

Run the focused test until it passes, then run the full component suite:

```bash
npm run test:ui
```

## Refactor

Refactor markup, state, styles, or component boundaries while preserving behavior. Keep the component suite green throughout the refactor.

Before finishing frontend work, run:

```bash
npm run test:ui
npm run lint
npm run build
cd tests/browser
npm run test:adaptive
```

The `Frontend TDD / Chromium` CI check runs the component interaction suite on pushes to `main` and on pull requests that change frontend code. The adaptive browser suite remains a separate higher-level check for compact, tablet, and desktop composition.

## Test placement

Use `tests/browser/ui-components.spec.mjs` for focused rendering and interaction tests. Use `tests/browser/adaptive-layout.spec.mjs` for viewport composition and responsive shell behavior. Use the existing Node test suite for pure data or utility logic that does not need a browser.

Do not add implementation-only selectors solely for tests when an accessible role, name, label, or visible state can express the behavior instead.
