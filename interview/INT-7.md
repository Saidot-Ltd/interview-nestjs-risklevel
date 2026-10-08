# INT-7: a test that can fail

`govern-system.service.spec.ts` mocks Prisma and asserts `update` was called once. It stayed green through the bug in SAID-INT-1.

Acceptance:
- Either a replacement test that fails on the original bug and passes on the fix, or the file deleted with a one-paragraph reason in the PR description.
- Test time for the suite stays under ten seconds.

Question for the conversation: what can a mocked unit test prove about a transaction, and what can it not?
