# AI Task Template: Rewards Bolivia Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality, specifically tailored for the Rewards Bolivia project.

---

## 📋 Template Metadata

- **Template Version**: 1.1.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-11-02
- **Project Name**: Rewards Bolivia
- **Task ID**: BUG-001

---

## 🎯 Task Definition

### Issue Summary
**The frontend application fails to communicate with the backend API when running inside a Docker container due to an incorrect API base URL.**

### Reported Symptoms
List all observable problems:
- [x] The web application loads, but any functionality requiring API data (like login, fetching user data) fails.
- [x] Browser developer console shows network errors (e.g., `net::ERR_CONNECTION_REFUSED`) for API requests to `http://localhost:3000`.
- [x] The application is unusable in a containerized environment, which is the primary intended deployment method.

### User Impact
- **Severity**: Critical
- **Affected Users**: All users running the application via Docker.
- **Workaround Available**: No (unless running locally outside of Docker and the API is also on localhost).
- **Business Impact**: Blocks all development, testing, and deployment of the application using containers.

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Rewards Bolivia
Architecture: Monorepo (npm workspaces) with a modular monolith backend and a separate frontend.
Technology Stack:
  Backend:
    - Framework: NestJS (TypeScript)
    - Database: PostgreSQL
    - ORM: Prisma
    - Auth: Passport.js (JWT, Google OAuth 2.0)
  Frontend:
    - Framework: React (TypeScript)
    - Build Tool: Vite
    - Styling: Tailwind CSS
    - Components: shadcn/ui, lucide-react
    - Routing: React Router
  Testing:
    - Backend: Jest (Unit & E2E)
    - Frontend: Vitest, React Testing Library
  Infrastructure:
    - Containerization: Docker, Docker Compose
```

### Project Paths & Commands
```yaml
Project Paths:
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/personal/rewards-bolivia
  API (Backend): packages/api
  Web (Frontend): packages/web
  Prisma Schema: packages/api/prisma/schema.prisma
  Docker Compose: docker-compose.yml

Key Commands:
  - Install All Dependencies: `npm install`
  - Run API Dev Server: `npm run api -- start:dev`
  - Run Web Dev Server: `npm run web -- dev`
  - Run API Tests: `npm run api -- test`
  - Run API E2E Tests: `npm run api -- test:e2e`
  - Run Web Tests: `npm run web -- test`
  - Lint API: `npm run api -- lint`
  - Lint Web: `npm run web -- lint`
  - Generate Prisma Client: `npm run api -- postinstall`
```

---

## 🔍 PHASE 1: Initial Analysis

### Problem Understanding
**What**: The frontend Axios instance defaults to `http://localhost:3000` for the API URL, which is incorrect in a Docker multi-container setup.
**Expected**: The frontend should connect to the backend API container using its service name (e.g., `http://api:3000`) as defined in the Docker network.
**Actual**: The frontend container tries to connect to `localhost`, which is itself, and fails to find the API.
**Type**: Bug (Configuration / Networking)

### Affected Areas
**Layers Involved**:
- [x] Frontend API Service (`packages/web/src/lib/api.ts`)
- [x] Infrastructure / Configuration (`docker-compose.yml`, `packages/web/Dockerfile.prod`)

**Primary Files**:
- `packages/web/src/lib/api.ts`: Where the incorrect default URL is configured.
- `docker-compose.yml`: Where the container services and environment variables should be defined.
- `packages/web/Dockerfile.prod`: Where build-time environment variables might be needed.

### Root Cause Analysis

**Symptom**: API calls from the web container fail with connection refused errors.

**Immediate Cause**: The `axios` instance in `packages/web/src/lib/api.ts` is trying to connect to `http://localhost:3000`.

**Root Cause**: When running in Docker, `localhost` refers to the container's own network namespace, not the host machine or other containers. The `VITE_API_BASE_URL` environment variable is not being correctly set and passed to the Vite process at build or run time, causing the code to fall back to the incorrect `localhost` default.

**Evidence**:
1. The code in `packages/web/src/lib/api.ts` shows `baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'`.
2. The user report confirms this fails in a container setup, which is the expected outcome of using `localhost` for inter-container communication.
3. The reference `api.js` from the `resumator` project, while more complex, uses the same `VITE_API_URL || 'http://localhost:8000'` pattern, indicating the solution lies in configuring the environment variable, not just the code.

---

## 🎯 PHASE 2: Solution Planning

### Comparison of `api.ts` and `resumator/api.js`

- **Security**: The current `rewards-bolivia/api.ts` is more secure because it uses `withCredentials: true`, implying an httpOnly cookie strategy for refresh tokens. The `resumator/api.js` uses `localStorage` for tokens, which is less secure and vulnerable to XSS. **The cookie-based strategy should be kept.**
- **Robustness**: The `resumator/api.js` is far more robust. It is a full-fledged `ApiService` class that centralizes all API calls, includes request interceptors, handles various error types (like 429 rate limiting), and provides a clean singleton pattern.
- **Container Issue**: Neither file solves the container networking issue directly in the code. The fix is in the environment configuration.

**Conclusion**: The best approach is a **refactor** that combines the strengths of both. We will fix the immediate bug by ensuring the environment variable is correctly supplied and take the opportunity to refactor `api.ts` into a more robust service class like the `resumator` example, while retaining the more secure cookie-based authentication.

### Implementation Steps

#### Step 1: Correct Environment Variable for Docker
**Priority**: Critical
**Package**: `infra` / `web`
**Objectives**:
- [ ] Ensure the `web` service in `docker-compose.yml` can resolve the `api` service.
- [ ] Pass the correct API URL to the `web` container as an environment variable.
**Changes Required**:
- `docker-compose.yml`: Add an `environment` section to the `web` service to define `VITE_API_BASE_URL=http://api:3000`.
- `packages/web/Dockerfile.prod`: Ensure that build-time arguments are handled correctly if needed for production builds.
**Verification**:
- [ ] After `docker-compose up`, exec into the `web` container and run `env | grep VITE_API_BASE_URL` to confirm the variable is set.

---

#### Step 2: Refactor `api.ts` into a Robust Service
**Priority**: High
**Package**: `web`
**Dependencies**: None
**Objectives**:
- [ ] Convert the simple `axios` instance into a singleton `ApiService` class.
- [ ] Keep the existing interceptor logic for token refresh.
- [ ] Add a request interceptor to log requests for easier debugging.
- [ ] Provide a foundation for adding specific endpoint methods in the future.
**Changes Required**:
- `packages/web/src/lib/api.ts`: Overhaul the file to implement the class-based service structure.
**Verification**:
- [ ] The application still works as expected after the refactor (once Step 1 is complete).
- [ ] A new unit test for `api.ts` could be created to verify the instance configuration.

---

## 🛠️ PHASE 3: Implementation Guidance

### File: `docker-compose.yml`

**Issue in This Code**:
- The `web` service likely lacks the necessary environment variable to communicate with the `api` service.

**Required Changes**:
1. Add an `environment` key to the `web` service definition.
2. Define `VITE_API_BASE_URL` to point to the `api` service using its container name and port.

**Guidance**:
- This change needs to be applied to the `docker-compose.yml` file. A `replace` tool is not ideal here, but the change would look like this:

```diff
  web:
    build:
      context: ./packages/web
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./packages/web:/app
      - /app/node_modules
+   environment:
+     - VITE_API_BASE_URL=http://api:3000
    depends_on:
      - api
```

### File: `packages/web/src/lib/api.ts`

**Issue in This Code**:
- The current implementation is minimal and not easily extensible. It works, but it's not a robust, long-term pattern.

**Required Changes**:
1. Refactor the file to export a singleton instance of a new `ApiService` class.
2. Move the `axios` instance creation and interceptor logic inside the class constructor.
3. Keep the secure `withCredentials: true` setting.

**Guidance**:
- The goal is to adopt the structure of `resumator/api.js` but adapt it for TypeScript and the existing cookie-based auth. A full file replacement is more appropriate than a small `replace` call. The new file would be a great improvement for the project's maintainability.
