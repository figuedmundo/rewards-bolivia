# Gemini Project Memory: Rewards Bolivia

This document serves as my memory for the Rewards Bolivia project, helping me maintain context, track decisions, and understand the project structure.

## 0. Important Memories
- Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.



---

## 1. Project Overview

Rewards Bolivia is a local loyalty ecosystem for Bolivia, built on a hybrid off-chain/on-chain architecture. It aims to provide a fast, gamified user experience while ensuring trust and auditability through a "Proof-of-Audit" blockchain layer.

---

## 2. Key Architectural Decisions

1.  **Modular Monolith:** We are using a modular monolith architecture for the backend (built with NestJS) for the MVP. This prioritizes development speed and simplicity while maintaining clear domain boundaries, avoiding the premature complexity of microservices.
2.  **Hybrid Off-chain/On-chain Model:** Core transactions (earning/redeeming points) are handled in a high-speed off-chain PostgreSQL database. A daily hash of these transactions is posted to a blockchain (Polygon) for auditability. This provides Web2 speed with Web3 trust.
3.  **JWT with Access/Refresh Tokens:** Authentication is handled via a standard, secure pattern using short-lived access tokens and long-lived, revocable refresh tokens.
4.  **Monorepo Structure:** The project is organized as a monorepo (using npm workspaces) to manage the `api`, `web`, and future packages in a single repository.

---

## 3. Tech Stack Summary

-   **Backend:** NestJS (Node.js + TypeScript)
-   **Database:** PostgreSQL
-   **ORM:** Prisma
-   **Caching:** Redis
-   **Frontend (Web Dashboard):** React (Vite) + TypeScript + Tailwind CSS + shadcn/ui
-   **Frontend (Mobile App):** Flutter (planned)
-   **Local Infrastructure:** Docker

---

## 4. Key File & Directory Locations

-   **Project Root:** `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/personal/rewards-bolivia`
-   **API Package:** `packages/api`
-   **Web App Package:** `packages/web`
-   **Infrastructure as Code:** `infra/`
-   **Project Documentation:** `.vibe/documentation/`
-   **Task Plans:** `.vibe/tasks/`
-   **Docker Compose:** `docker-compose.yml`
-   **Prisma Schema:** `packages/api/prisma/schema.prisma`

---

## 5. Common Commands

-   **Start Local Services:** `docker-compose up -d`
-   **Run DB Migrations:** `npx prisma migrate dev --schema=./packages/api/prisma/schema.prisma --name <migration_name>`
-   **Initialize shadcn/ui (from `packages/web`):** `npx shadcn@latest init`

---

## 6. Pending Tasks & TODOs (from Sprint 1)

-   **Authentication:**
    -   [ ] Implement the full refresh token logic (generation, secure storage, rotation, and revocation).
    -   [ ] Implement the `POST /auth/logout` endpoint.
    -   [ ] Integrate Google OAuth2 as an alternative login method.
-   **Frontend:**
    -   [ ] Build the Login, Registration, and Password Recovery screens (T3.2).
    -   [ ] Connect the frontend forms to the authentication API (T3.3).
-   **CI/CD & QA:**
    -   [ ] Configure the initial CI/CD pipeline using GitHub Actions (T1.4).
    -   [ ] Expand test coverage for the authentication module (unit and integration tests).
