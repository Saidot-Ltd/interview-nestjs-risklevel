# Optional reference

Stack, routes, and sample data for the starting code.

## Stack

API: NestJS 11, Prisma on SQLite, `nestjs-cls`, and event-emitter.
Web: React Router v7 with a risk-level dropdown.

## Sample users

The fixture simulates a session with the `x-user-email` header.

| User | Organisation | Systems |
|---|---|---|
| `alice@acme.test` | Acme, ID 1 | 1–6 |
| `bob@globex.test` | Globex, ID 2 | 7–11 |

System 6 is soft-deleted. Soft-delete changes are outside INT-1.

## Current routes

These describe the starting code, not the required final input contract.

| GraphQL | REST |
|---|---|
| `me` | `GET /me` |
| `governSystems(page, pageSize)` | `GET /systems?page=&pageSize=` |
| `setSystemRiskLevel(systemId, riskLevel, organizationId, actorId)` | `PATCH /systems/:systemId/risk-level` |
| `systemActivity(systemId)` | `GET /systems/:systemId/activity` |

Example request against the starting API:

```sh
curl -X PATCH \
  -H 'x-user-email: alice@acme.test' \
  -H 'content-type: application/json' \
  -d '{"riskLevel":"High","organizationId":1,"actorId":1}' \
  http://localhost:4300/systems/1/risk-level
```

## Additional commands

- `pnpm db:reset`: deletes and recreates the development database and sample data.
- `pnpm db:seed`: reseeds sample data.
- `pnpm test:e2e:web`: browser smoke test; requires `pnpm dev` running.

`pnpm repro` boots its own test app, injects a notification-provider failure, reseeds
sample data, and prints the system, audit, and notification records.
A notification record does not prove that the external provider delivered the message.
