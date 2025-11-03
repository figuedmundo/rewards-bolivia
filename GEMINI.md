# Rewards Bolivia Project

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

## Building and Running the Project

The project is managed as a monorepo using pnpm workspaces.

### Prerequisites

*   Node.js
*   pnpm
*   Docker

### Running the Application

1.  **Start the database and other services:**
    ```bash
    docker-compose -f infra/local/docker-compose.yml up -d
    ```

2.  **Install dependencies for all workspaces:**
    ```bash
    pnpm install
    ```

3.  **Run the backend API:**
    ```bash
    pnpm run api -- start:dev
    ```

4.  **Run the frontend web application:**
    ```bash
    pnpm run web -- dev
    ```

### Running Tests

*   **Backend (API):**
    ```bash
    pnpm run api -- test
    ```
*   **Frontend (Web):**
    ```bash
    pnpm run web -- test
    ```

## Development Conventions

*   The backend follows the standard NestJS project structure.
*   The frontend is a standard Vite-based React application.
*   The project uses a modular monolith architecture. It is important to maintain clean boundaries between modules.
*   Communication between modules should be done through defined public interfaces (services).
*   Use linting rules to prevent direct imports of internal components between modules.

---

## IMPORTANT AI Memories
- Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.
- Do not read the files in .vibe/prep until is requested explicitly

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
