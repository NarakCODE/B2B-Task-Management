# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm/Turborepo workspace. Application code lives in `apps/`:

- `apps/client`: React 19 + Vite + TypeScript frontend. Source is in `src/`, static files are in `public/`.
- `apps/backend`: Express + TypeScript API backed by MongoDB/Mongoose. Source is split under `src/` into `controllers/`, `routes/`, `models/`, `services/`, `middlewares/`, `validation/`, `utils/`, and `seeders/`.
- `apps/eve-agent`: Eve agent app. Agent code lives in `agent/`, including channels, tools, skills, and helpers.

Do not edit generated output: `dist/`, `.output/`, `.turbo/`, or `node_modules/`.

## Build, Test, and Development Commands

- `pnpm install`: install workspace dependencies.
- `pnpm dev`: run all app development servers through Turbo.
- `pnpm build`: build all apps.
- `pnpm lint`: run configured lint tasks; currently applies to the client.
- `pnpm typecheck`: run TypeScript checks for packages that define them.
- `pnpm --filter backend seed:all`: seed backend roles and agile data.
- `pnpm --filter client preview`: preview the built Vite frontend.

Run commands from the root. For app-scoped work, prefer filters such as `pnpm --filter client build` or `pnpm --filter backend dev`.

## Coding Style & Naming Conventions

Prettier uses 2 spaces, double quotes, no semicolons, trailing commas, and a 100-character print width. `lint-staged` formats changed client/backend files and runs client ESLint fixes.

Use TypeScript for app code. Keep React components in PascalCase, hooks prefixed with `use`, and backend modules named by domain or responsibility. Put route handlers in `controllers/`, business logic in `services/`, schemas in `validation/`, and database shapes in `models/`.

## Testing Guidelines

No automated test runner is currently configured in root or app package scripts. Before adding tests, add the framework and scripts in the relevant app manifest, then expose the task through Turbo if it should run from the root. Prefer colocated names such as `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style prefixes, for example `feat: implement task activity feed logs`, `fix(lint): resolve ESLint errors`, and `ci: bump Node.js version`. Keep commits scoped and imperative.

Pull requests should include a short summary, affected apps, validation performed (`pnpm build`, `pnpm lint`, `pnpm typecheck`, manual checks), linked issues, and screenshots or recordings for UI changes.

## Security & Configuration Tips

Keep secrets in app-local `.env` files and update `.env.example` when adding required variables. Backend configuration includes MongoDB, session, OAuth, Stripe, Cloudinary, and frontend origin values. Do not commit credentials or runtime data.
