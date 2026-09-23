# Pairing exercise: one write path, done right

**Do first:** `pnpm install && pnpm db:reset && pnpm dev` then open http://localhost:4373 and run `pnpm repro`.

## What this is

A miniature of one GraphQL mutation from a governance API: change the risk level of an AI system,
write an audit row, notify the owner. Written two years ago. Untouched since.

- API: NestJS 11, code-first GraphQL, Prisma on SQLite, `nestjs-cls`, event-emitter.
- Web: one React Router v7 page with the risk-level dropdown.
- Session: header `x-user-email`. Users: `alice@acme.test` (org 1, systems 1-6, system 6 soft-deleted), `bob@globex.test` (org 2, systems 7-11).
- Rules the code is supposed to follow: `apps/api/AGENTS.md` (three of them).

## Commands

```
pnpm dev          # api :4300/graphql + web :4373 (browser calls the API directly, cookie = session)
pnpm repro        # runs the failing save, prints the three tables
pnpm test         # unit (mocked)
pnpm test:e2e     # real database
pnpm test:e2e:web # browser smoke, needs pnpm dev running
pnpm check        # biome
```

## SAID-INT-1: make `setSystemRiskLevel` atomic and tenant-safe

**TL;DR:** one transaction owns every write, side effects after commit, tenant and actor from the session, one e2e that goes red before and green after.

Known, in `apps/api/src/govern-system/govern-system.service.ts`:

1. System row updated outside the `$transaction`, audit row inside. Failed save = changed system, no audit row. `pnpm repro` shows it.
2. Notification and event fire before commit.
3. `organizationId` and `actorId` come from mutation arguments. Should be `CurrentContextService`.

Together, ~30 min. You will not finish everything. Say what you skip and why. Leave the noise alone unless it blocks you.

## If time remains, in this order

Each is one PR-sized change on the same module. Same rules: say what you skip, leave the noise alone.
Acceptance criteria are observable. How you get there is yours to defend.

### INT-2: bulk risk level for an organisation

New mutation `setOrganisationRiskLevel(riskLevel)`: every non-deleted system in the caller's organisation moves to that level.

Acceptance:
- All systems change or none does. An e2e proves it: make the write for system 3 fail, assert every row is unchanged.
- One audit row per changed system, each signed by the caller.
- Each owner receives one notification for the batch, not one per system.
- The per-system mutation from SAID-INT-1 keeps working and shares its code with the bulk path.

Question for the conversation: where does responsibility for the transaction sit, and what does that mean for the per-system code you just fixed?

### INT-3: the same write from a nightly job

New script `pnpm task:normalise-risk-levels`: boots the app without an HTTP request and sets every system with `riskLevel = null` to `Low` through the same code path.

Acceptance:
- Audit rows exist for every changed system and name a non-human actor consistently.
- Running the script twice changes nothing the second time and writes no second audit row.
- One test runs the script against the real database and asserts the two points above.
- No mutation argument or environment variable lets a caller choose the actor.

Question for the conversation: a request carries a user, a job does not. Where does identity come from in each case, and what must never be the source?

### INT-4: soft-deleted systems are invisible

System 6 in organisation 1 is soft-deleted. The list hides it. The mutation still changes it.

Acceptance:
- `governSystems` never returns system 6.
- `setSystemRiskLevel(6, ...)` returns a not-found error, writes no audit row, sends no notification.
- Two e2e tests against the real database, one per point.
- No other system's behaviour changes.

Question for the conversation: how do you keep this from coming back the next time someone adds a read?

### INT-5: break the module cycle

`GovernSystemModule` and `NotificationsModule` import each other through `forwardRef`.

Acceptance:
- No `forwardRef` in either module, no `moduleRef.get`, no new module.
- Notification messages read exactly as before.
- App boots, `pnpm test` and `pnpm test:e2e` stay green.

Question for the conversation: what did the cycle tell you about where a piece of code should live?

### INT-6: the web page

The web sends `organizationId` and `actorId` as mutation variables at all, and a failed save leaves the picked value on screen.

Acceptance:
- The mutation sends only `systemId` and `riskLevel`.
- After a failed save the row shows the stored value, and the error stays visible.
- The tour still anchors to its four elements.

Question for the conversation: what belongs in a React Query key, what belongs in the URL, and what belongs in neither?

### INT-7: a test that can fail

`govern-system.service.spec.ts` mocks Prisma and asserts `update` was called once. It stayed green through the bug in SAID-INT-1.

Acceptance:
- Either a replacement test that fails on the original bug and passes on the fix, or the file deleted with a one-paragraph reason in the PR description.
- Test time for the suite stays under ten seconds.

Question for the conversation: what can a mocked unit test prove about a transaction, and what can it not?
