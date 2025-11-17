# Rewards Bolivia

![Project Banner](https://via.placeholder.com/1200x300.png?text=Rewards+Bolivia)

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/figuedmundo/rewards-bolivia/ci.yml?branch=main&style=for-the-badge" alt="Build Status">
  <img src="https://img.shields.io/github/license/figuedmundo/rewards-bolivia?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/last-commit/figuedmundo/rewards-bolivia?style=for-the-badge" alt="Last Commit">
</p>

> A modern loyalty and rewards platform for businesses and customers in Bolivia, built with a focus on speed, security, and user experience.

## ✨ Key Features

-   **Instantaneous Transactions:** Sub-1.5-second point redemptions for a seamless user experience.
-   **Hybrid On-chain/Off-chain Model:** Combines the speed of a traditional database with the trust and auditability of a blockchain.
-   **Dual-Level Audit System:** Per-transaction SHA256 hashing plus daily batch hashing for comprehensive auditability.
-   **Wallet Dashboard:** Real-time point balance tracking and transaction history with TanStack Query integration.
-   **Auto-Generated SDK:** TypeScript-Axios client for type-safe API integration across frontend applications.
-   **Modular Monolith Architecture:** A scalable and maintainable codebase following DDD principles and Clean Architecture.
-   **Economic Control System:** Real-time monitoring and validation of point economics to prevent system abuse.
-   **Modern Tech Stack:** Built with NestJS, React, Flutter (planned), and other modern technologies.
-   **Comprehensive Testing:** A robust testing strategy ensures code quality and reliability.

## 🚀 Tech Stack

-   **Backend:** NestJS (Node.js + TypeScript)
-   **Frontend (Web Dashboard):** React (Vite + Tailwind CSS + shadcn/ui)
-   **Mobile App (Planned):** Flutter
-   **Database:** PostgreSQL
-   **ORM:** Prisma
-   **Caching:** Redis
-   **Blockchain (Proof-of-Audit):** Polygon (PoS)
-   **Infrastructure:** Docker, Kubernetes
-   **CI/CD:** GitHub Actions

## 📂 Project Structure

This project is a monorepo using pnpm workspaces. The main packages are:

```
/rewards-bolivia
├───agent-os/             # Agent-OS configuration and documentation
│   ├───product/          # Product documentation (mission, roadmap, tech-stack)
│   └───standards/        # Coding standards (backend, frontend, testing, global)
├───e2e/                  # End-to-end tests
├───infra/                # Infrastructure as Code (Docker, K8s)
├───packages/
│   ├───api/              # NestJS Backend (Modular Monolith)
│   ├───web/              # React Frontend (Dashboard with Wallet UI)
│   ├───worker/           # Background job processor (BullMQ/Redis)
│   ├───sdk/              # Auto-generated TypeScript-Axios API client
│   ├───shared-types/     # Shared TypeScript types and DTOs
│   ├───libs/             # Shared libraries
│   │   ├───auth/         # Authentication utilities
│   │   ├───logger/       # Shared logging library
│   │   └───utils/        # Common utilities
│   ├───test-utils/       # Test utilities and fixtures
│   └───infra-scripts/    # Infrastructure utility scripts
└───docs/                 # Project documentation
    ├───api/              # API-specific documentation (ledger endpoints, etc.)
    ├───Rewards_Bolivia/  # Product and business documentation
    └───RUNBOOKS/         # Operational procedures
```

For a more detailed explanation of the architecture, please see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
See the full implementation plan in [`docs/PROPOSED_ROADMAP.md`](./docs/PROPOSED_ROADMAP.md).

## 🏁 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or higher)
-   [pnpm](https://pnpm.io/) (v8 or higher)
-   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/figuedmundo/rewards-bolivia.git
    cd rewards-bolivia
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    ```bash
    cp .env.example .env
    ```
    *Fill in the required variables in the `.env` file.*

## 🏃 Running the Project

You can run this project in two ways: using Docker Compose for the entire stack, or running the backend and frontend services locally while using Docker for the database and cache.

### Option 1: Run Everything with Docker (Recommended)

This method uses Docker Compose to build and run the entire application stack, including the API, web frontend, database, and cache. It's the simplest way to get started.

1.  **Ensure Docker is running.**
2.  **Build and start the services:**
    ```bash
    docker-compose -f infra/local/docker-compose.yml --env-file .env up --build
    ```
    This command will:
    -   Build the Docker images for the `api` and `web` services.
    -   Start all the services defined in the `docker-compose.yml` file.
    -   Automatically apply database migrations.
    -   Mount your local source code into the containers, so changes will trigger hot-reloading.

### Option 2: Hybrid Setup (Local Development)

This method is for developers who prefer to run the Node.js services (API, web, worker) directly on their host machine for easier debugging, while still using Docker for the database and cache.

1.  **Start the infrastructure (Database & Cache):**
    ```bash
    docker-compose -f infra/local/docker-compose.yml up -d postgres redis
    ```
    *This starts only the `postgres` and `redis` services.*

2.  **Run database migrations:**
    ```bash
    pnpm --filter api exec prisma migrate dev
    ```

3.  **Start the development servers:**
    Run each of the following commands in a separate terminal:

    ```bash
    # Terminal 1: Start the API backend
    pnpm --filter api start:dev

    # Terminal 2: Start the web frontend
    pnpm --filter web dev

    # Terminal 3: Start the worker
    pnpm --filter @rewards-bolivia/worker dev
    ```

### Accessing the Application

Once the application is running (using either method), it will be available at the following URLs:
-   **Web App:** `http://localhost:5173`
-   **API:** `http://localhost:3001`

## 🧪 Running Tests

This project uses a comprehensive testing strategy. For more details, please see [`docs/TESTING.md`](./docs/TESTING.md).

-   **Run all unit and integration tests:**
    ```bash
    pnpm test
    ```

-   **Run tests for a specific package:**
    ```bash
    # For the API
    pnpm --filter api test

    # For the Web App
    pnpm --filter web test
    ```

-   **Run E2E tests:**
    ```bash
    pnpm --filter e2e test
    ```
    - To run in headed mode: `pnpm --filter e2e test:headed`
    - To open the Playwright UI: `pnpm --filter e2e test:ui`
    - To run tests for a specific browser (e.g., Chromium): `pnpm --filter e2e test --project=chromium`
    - To view the last report: `pnpm --filter e2e report`

### Code Coverage

This project uses `vitest` to generate code coverage reports for the `web` package. The report is generated in LCOV format, which provides a detailed, interactive HTML view of your test coverage.

**What is an LCOV Report?**

LCOV is a tool that creates a graphical front-end for `gcov`, a code coverage analysis tool. The `lcov-report` is a directory containing a set of HTML files that allow you to visualize your code coverage. You can browse through your source code and see exactly which lines of code have been executed by your tests and which have not. This is an invaluable tool for identifying gaps in your testing and improving the quality of your codebase.

**How to Generate the Report**

To generate the code coverage report for the `web` package, run the following command from the root of the project:

```bash
pnpm run --filter=web test -- --coverage
```

This command runs the tests for the `web` package with the `--coverage` flag, which instructs `vitest` to collect coverage data and generate the report.

**Viewing the Report**

Once the command has finished, you will find the generated report in the `packages/web/coverage/` directory. To view the report, open the `index.html` file in that directory in your web browser:

```bash
# On macOS
open packages/web/coverage/index.html

# On Windows
start packages/web/coverage/index.html

# On Linux
xdg-open packages/web/coverage/index.html
```

This will open the interactive HTML report, where you can explore the coverage data for each file in the `web` package.

## 💅 Code Quality and Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality standards and consistent commit messages. The following Git hooks are configured:

-   **`pre-commit`:** Before each commit, `lint-staged` is run to automatically lint and format staged files. This ensures that no code that violates the project's style guide is committed.
-   **`commit-msg`:** When you write a commit message, `commitlint` checks it to ensure it follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

You don't need to do anything to activate these hooks; they run automatically when you commit your changes.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) to get started.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 📞 Contact

-   **Project Maintainer:** Edmundo Figueroa - [figuedmundo@gmail.com]
-   **GitHub Issues:** [https://github.com/figuedmundo/rewards-bolivia/issues](https://github.com/figuedmundo/rewards-bolivia/issues)
