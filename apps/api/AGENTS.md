# apps/api

NestJS 11, code-first GraphQL plus REST controllers that call the same services, Prisma on SQLite, `nestjs-cls` for request context.

## The three rules

1. **Tenant comes from the session, never from the caller.** Read `organizationId` from
   `CurrentContextService`. An `organizationId` that arrives as a GraphQL argument, a REST param or body field, or a method
   parameter is caller-controlled and must never reach a `where` clause.
2. **The audit row belongs in the same transaction as the write it describes, with a named actor.**
   `AuditLogService.persist(trx, before, after, meta)` takes the caller's transaction client as its
   first argument. The actor is a person from the request context, not a parameter.
3. **Side effects happen after commit.** Events and notifications describe work that has landed.
   Nothing inside a `$transaction` callback may emit, notify or call the outside world, and a failed
   side effect must not undo a committed write.

## Transactions

`this.prisma` inside a `$transaction` callback is a different connection to `trx`. Its writes are
not part of the transaction and do not roll back. Prisma interactive transactions do not nest: the
outermost caller owns the transaction, everyone below takes `trx` as a parameter.

## The fake session

There is no auth in this fixture. `SessionMiddleware` reads the `x-user-email` header, looks the
`AppUser` up and puts `userId`, `userEmail` and `organizationId` into CLS. That stands in for the
real session. Requests with no header have no context, and `CurrentContextService` throws for them.

    curl -H 'x-user-email: alice@acme.test' ... http://localhost:4300/graphql
    curl -H 'x-user-email: alice@acme.test' http://localhost:4300/systems

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Nest in watch mode, GraphQL sandbox on `http://localhost:4300/graphql`, REST on `http://localhost:4300` |
| `pnpm db:reset` | Drop `prisma/dev.db`, apply migrations, seed |
| `pnpm db:seed` | Seed only |
| `pnpm repro` | Reset, boot the app with a failing notification provider, print the three tables |
| `pnpm test` | Unit tests (Jest, mocked Prisma) |
| `pnpm test:e2e` | e2e tests against a real `prisma/test.db` |
| `pnpm check` | Biome format + lint |
| `pnpm typecheck` | `tsc --noEmit` |

`strictNullChecks` is off, as it is in the real codebase.
