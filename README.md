# 🌟 TeamSync — B2B Teams Project Management Platform

**TeamSync** is a scalable, multi-tenant B2B project management platform built as a modern
TypeScript monorepo. It pairs a React 19 frontend with an Express + MongoDB API and an
optional AI agent, covering everything from workspaces and tasks to sprints, releases,
incidents, and deployments.

> Originally based on a [Tech With Emma](https://tinyurl.com/subcribe-to-techwithEmma)
> tutorial and extended into a full agile delivery platform.

---

## ✨ Features

**Core collaboration**

- 🔐 Authentication via Google OAuth, email, and password (Passport + cookie sessions)
- 🏢 Multi-tenant workspaces with member invitations
- 👥 Role-based access control (Owner, Admin, Member)
- 📊 Projects, epics, and tasks (CRUD, status, priority, assignee)
- 💬 Comments, mentions, attachments, and notifications
- 🔍 Filtering, search, and pagination
- 📈 Analytics dashboard

**Agile & delivery workflow**

- 🏃 Sprints, milestones, and timelines
- 🧩 Custom workflow states and Definition of Done (DoD)
- 📅 Standups, capacity planning, and time logging
- 🚀 Releases, pull requests, deployments, and incident tracking
- ⚙️ Automation rules and third-party integrations
- 📝 Documents, reviews, and audit logs

**Platform**

- 💳 Stripe billing
- ☁️ Cloudinary file storage
- 🤖 `eve-agent` — an AI assistant built on the Anthropic AI SDK
- 💾 Mongoose transactions and database seeding for reliable test data

---

## 🧱 Tech Stack

| Area          | Technologies                                                                          |
| ------------- | ------------------------------------------------------------------------------------- |
| **Frontend**  | React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/Radix UI, TanStack Query, Zustand |
| **Backend**   | Node.js (Express 5), TypeScript, MongoDB, Mongoose, Passport, Zod                     |
| **AI agent**  | `eve` framework, Anthropic AI SDK (`@ai-sdk/anthropic`)                                |
| **Services**  | Stripe (billing), Cloudinary (uploads), Google OAuth                                  |
| **Tooling**   | pnpm workspaces, Turborepo, Prettier, ESLint, Husky, lint-staged                      |

---

## 📁 Repository Structure

This is a [pnpm](https://pnpm.io/) + [Turborepo](https://turbo.build/) monorepo. Application
code lives under `apps/`:

```
apps/
├── client/      React 19 + Vite frontend
├── backend/     Express + MongoDB API (controllers, routes, models, services, seeders)
└── eve-agent/   AI agent (channels, tools, skills)
```

See [`AGENTS.md`](./AGENTS.md) for contributor guidelines and [`API.md`](./API.md) for the
full backend API reference.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **24.x**
- [pnpm](https://pnpm.io/) **10.x** (`npm install -g pnpm`)
- A [MongoDB](https://www.mongodb.com/) database (local or Atlas)

### 1. Install dependencies

From the repository root:

```bash
pnpm install
```

### 2. Configure environment variables

**Backend** — create `apps/backend/.env`:

```env
PORT=8000
NODE_ENV=development
BASE_PATH=/api
MONGO_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/teamsync_db"

SESSION_SECRET="your_session_secret"
SESSION_EXPIRES_IN="1d"

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

FRONTEND_ORIGIN=http://localhost:3000
FRONTEND_GOOGLE_CALLBACK_URL=http://localhost:3000/google/callback

# Optional integrations
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
STRIPE_PRICE_PRO_ID=<your-stripe-price-id>

CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

**Frontend** — create `apps/client/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Seed the database (optional)

Seed default roles and sample agile data:

```bash
pnpm --filter backend seed:all
```

### 4. Run the development servers

Start every app through Turborepo:

```bash
pnpm dev
```

Or run a single app:

```bash
pnpm --filter backend dev    # API at http://localhost:8000
pnpm --filter client dev     # Web app at http://localhost:3000
```

---

## 📜 Scripts

Run these from the repository root:

| Command           | Description                                |
| ----------------- | ------------------------------------------ |
| `pnpm dev`        | Run all app development servers via Turbo  |
| `pnpm build`      | Build all apps                             |
| `pnpm start`      | Start all apps in production mode          |
| `pnpm lint`       | Run configured lint tasks                  |
| `pnpm typecheck`  | Run TypeScript checks across the workspace |

Scope any task to a single app with `--filter`, e.g. `pnpm --filter client build`.

---

## 🌐 Deployment

1. Provision the environment variables above on your hosting platform (e.g. Vercel).
2. Build with `pnpm build` and deploy each app, or deploy them individually with
   `pnpm --filter <app> build`.

---

## 🤝 Contributing

Contributions are welcome! Please read [`AGENTS.md`](./AGENTS.md) for the project structure,
coding conventions, and commit/PR guidelines. The project uses Conventional Commit-style
messages, and `lint-staged` runs Prettier (and ESLint on the client) on changed files.

---

## 📄 License

See [`TECHWITHEMMA-LICENSE.md`](./TECHWITHEMMA-LICENSE.md) for licensing terms.

---

## ❤️ Support

If you find this project useful:

- ⭐️ Star this repository on GitHub
- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/techwithemmaofficial)
- 📺 [Subscribe to the channel](https://tinyurl.com/subcribe-to-techwithEmma)
