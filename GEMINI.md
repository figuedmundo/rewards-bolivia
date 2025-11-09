# Rewards Bolivia Project

---

## IMPORTANT AI Memories
- Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.
- Do not read the files in .vibe/prep until is requested explicitly
- When asking to create a commit message, please always read  `CONTRIBUTING.md` so the message is aligned with the project standards, and please return the message inside a code block 
```md 
message
``` 
please follow the rules below
- subject must not be sentence-case, start-case, pascal-case, upper-case [subject-case]
- Important project documents `docs/ARCHITECTURE.md`, `docs/DB_MIGRATIONS.md`, `docs/TESTING.md`, `docs/TSDR.md`.

---

## Development Workflow & Best Practices

- **Prioritize Type Safety:** Avoid using `any` wherever possible. Immediately define a clear `interface` or `type` for any data structures that lack them, especially for decoded JWT payloads, strategy validation results, and untyped request/response objects.
- **Incremental Linting & Building:** After each small, logical change, run the linter and build command for the affected package (e.g., `pnpm --filter api lint` and `pnpm --filter api build`). This catches errors early and makes them easier to fix.
- **Heed All Linter Rules:** Pay close attention to rules like `no-floating-promises`, `no-misused-promises`, and `unbound-method`. These rules prevent subtle but significant bugs. Ensure all promises are handled correctly (with `await` or `.catch()`) and that `this` is properly scoped.
- **Assess Configuration on Refactor:** Before moving code between packages, inspect the `tsconfig.json` and linting configurations of both the source and destination to anticipate any new, stricter rules that will be applied.

---

## Project Overview

This project is a monorepo for the "Rewards Bolivia" platform, a loyalty and rewards program. The application is architected as a modular monolith with a backend and a frontend. It leverages a hybrid on-chain/off-chain data model, using a traditional PostgreSQL database for performance-critical operations and a blockchain for ensuring trust and auditability through a `Proof-of-Audit` hash.

### Key Technologies

*   **Backend:**
    *   Framework: NestJS
    *   Database: PostgreSQL
    *   ORM: Prisma
    *   Authentication: JWT
*   **Frontend:**
    *   Framework: React
    *   Build Tool: Vite
    *   Styling: Tailwind CSS
*   **Infrastructure:**
    *   Containerization: Docker, Docker Compose
    *   Caching: Redis

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

## Development Conventions

*   The backend follows the standard NestJS project structure.
*   The frontend is a standard Vite-based React application.
*   The project uses a modular monolith architecture. It is important to maintain clean boundaries between modules.
*   Communication between modules should be done through defined public interfaces (services).
*   Use linting rules to prevent direct imports of internal components between modules.


---

## Key File & Directory Locations

-   **Project Root:** `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/personal/rewards-bolivia`
-   **API Package:** `packages/api`
-   **Web App Package:** `packages/web`
-   **Infrastructure as Code:** `infra/`
-   **Project Documentation:** `.vibe/documentation/`
-   **Task Plans:** `.vibe/tasks/`
-   **Docker Compose:** `infra/local/docker-compose.yml`
-   **Prisma Schema:** `packages/api/prisma/schema.prisma`

---
