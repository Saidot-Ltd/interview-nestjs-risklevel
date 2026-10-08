# Risk level pairing exercise

A small governance app for managing AI systems. Each system belongs to an organisation,
has an owner, and has a risk level: Low, Medium, or High.

## Step 0 — Fork and clone

Fork [Saidot-Ltd/interview-nestjs-risklevel](https://github.com/Saidot-Ltd/interview-nestjs-risklevel)
to your GitHub account, then clone your fork:

```sh
git clone https://github.com/YOUR-GITHUB-USERNAME/interview-nestjs-risklevel.git
cd interview-nestjs-risklevel
```

Prepare the [development environment](interview/ENVIRONMENT.md) before the session.

## Step 1 — Set up the app

Complete setup before the timed exercise.

```sh
pnpm install
pnpm db:reset   # deletes and recreates sample data
```

Terminal A — leave running:

```sh
pnpm dev
```

Open http://localhost:4373. The API runs at http://localhost:4300.

## Step 2 — Begin INT-1

Read [INT-1](interview/INT-1.md), then run the reproduction in Terminal B:

```sh
pnpm repro   # reseeds sample data
```

You have 30 minutes for INT-1, including verification. Setup is completed beforehand.

## Checks and reference

```sh
pnpm test:e2e
pnpm test
pnpm check
pnpm typecheck
```

Stack, fixture data, and routes: [reference](interview/REFERENCE.md).

INT-2 through INT-7 are separate extension cards in `interview/`.
The interviewer selects any follow-up. They are not required for the 30-minute INT-1 task.

## Tools and shared screen

AI assistants, Google, Stack Overflow, and documentation are allowed.
Keep all interview work on the one shared screen: prompts, responses, searches,
code changes, and test output. Do not use an unshared screen or device for assistance.

You remain responsible for the code you submit. Be prepared to explain it, justify
its tradeoffs, and adapt it when we discuss a change in requirements.
