# INT-1 — Atomic, tenant-safe risk-level changes

**Time: 30 minutes.**

`setSystemRiskLevel` / `PATCH /systems/:systemId/risk-level` can leave inconsistent
state on failure and trusts caller-supplied identity. Investigate and fix it.

## Acceptance

- Risk-level and audit writes are atomic.
- Organisation and audit actor derive from the session, not request inputs.
- Cross-organisation access returns not found, without writes or notifications.
- Events and notifications reflect committed changes. Notification delivery failure
  is logged; a committed save still succeeds.
- A regression test fails on the original defect and passes on the fix.

## Scope

Single-system API operation and affected callers; preserve both transports and
notification eligibility. No bulk updates, jobs, soft-delete changes, retries, or
unrelated refactoring. `x-user-email` simulates the session; authentication is out of scope.

Demonstrate the result and explain decisions, verification, and remaining risks.
