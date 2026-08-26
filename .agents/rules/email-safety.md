---
description: Strict safety guidelines for email delivery, newsletter broadcasting, and test environments
globs: ["**/*"]
alwaysApply: true
---

# Email Delivery & Campaign Broadcast Safety Rules

## 1. NEVER Send Live Emails or Campaigns During Testing / Debugging

- **Strict Prohibition**: Under NO circumstances should any AI agent, test script, or debug command trigger live emails or marketing campaigns to real users or subscriber lists.
- All unit tests, integration tests, E2E tests, and development sandbox executions **MUST** run with simulated / mock email delivery enabled (`NODE_ENV=test` or simulated mode).
- Never call live external endpoints such as `PlunkCampaignService.sendCampaign`, `PlunkCampaignService.testCampaign`, or `NewsletterDispatcher.dispatchCampaign` with real recipient audiences during development or verification phases.

## 2. Environment Safeguards

- `PlunkCampaignService`, `PlunkTemplateService`, and `PlunkVerifyService` must strictly enforce `isPlaceholder()` / simulated mode when:
  - `NODE_ENV === "test"`
  - `BUN_ENV === "test"`
  - `DISABLE_EMAIL_DELIVERY === "true"`
  - Running under any test runner (`bun test`, `vitest`, `jest`)
  - The API key is empty or a placeholder key
- If an agent is writing new tests for email or newsletter modules:
  - Always mock the email transport or verify that `isPlaceholder()` returns `true`.
  - Always use simulated email addresses (`tester@example.com`) and ensure no real outbound network requests are dispatched.

## 3. Production Broadcasts

- Live broadcasts may ONLY be triggered through authenticated user actions within the production Admin Dashboard or verified scheduled production queues.
- Never write automated seed scripts or CI/CD jobs that trigger campaign broadcasts.
