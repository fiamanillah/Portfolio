# Agent Directives & Repository Guidelines

## ⚠️ Critical Rule: Email & Newsletter Broadcast Safety

- **NEVER** run commands, tests, or scripts that trigger live email deliveries or marketing broadcasts to real subscribers.
- All testing and debugging **must** operate in simulated/mock mode (`NODE_ENV=test` or `DISABLE_EMAIL_DELIVERY=true`).
- Never make live outbound calls to `PlunkCampaignService`, `PlunkTemplateService`, or `NewsletterDispatcher` during development.
- When creating or modifying tests involving emails, always verify that simulated mode is active.
