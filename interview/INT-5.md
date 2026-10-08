# INT-5: break the module cycle

`GovernSystemModule` and `NotificationsModule` import each other through `forwardRef`.

Acceptance:
- No `forwardRef` in either module, no `moduleRef.get`, no new module.
- Notification messages read exactly as before.
- App boots, `pnpm test` and `pnpm test:e2e` stay green.

Question for the conversation: what did the cycle tell you about where a piece of code should live?
