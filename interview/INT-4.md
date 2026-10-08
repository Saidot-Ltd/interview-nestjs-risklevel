# INT-4: soft-deleted systems are invisible

System 6 in organisation 1 is soft-deleted. The list hides it. The mutation and the route still change it.

Acceptance:
- `governSystems` and `GET /systems` never return system 6.
- `setSystemRiskLevel(6, ...)` and `PATCH /systems/6/risk-level` return a not-found error (404 on REST), writes no audit row, sends no notification.
- Two e2e tests against the real database, one per point.
- No other system's behaviour changes.

Question for the conversation: how do you keep this from coming back the next time someone adds a read?
