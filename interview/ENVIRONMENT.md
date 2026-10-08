# Development environment

Prepare this before the interview. Setup time is outside the timed exercise.

## Required

- A macOS or Linux development machine with a Unix-compatible shell.
- Git and a GitHub account that can fork and clone the repository.
- Node.js 24 or newer.
- pnpm 11.1.2, as specified in the repository’s `package.json`.
- Your usual code editor and a modern browser.
- A working Tuple or Dovio setup, as agreed with the interviewer, with microphone
  and screen-sharing permissions enabled. Share the screen that contains your editor,
  terminal, browser, and any AI tools used during the interview.
- Internet access for dependency installation and permitted documentation.
- Local ports 4300 (API) and 4373 (web) available.

The database is local SQLite. No separate database server is required.

## Check versions

```sh
git --version
node --version
pnpm --version
```

Use your usual Node and pnpm installation method. If you cannot use this environment,
let the interviewer know before the session so an alternative can be arranged.

## Prepare the app

After forking and cloning, follow the setup commands in the root README.
Confirm that http://localhost:4373 opens and `pnpm repro` runs.
The reproduction deliberately exercises a failure; an error printed by that request
is part of the exercise.

Database reset and reproduction commands overwrite sample data. Use this checkout
only for the interview fixture.
