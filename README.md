# Rewards Bolivia

![Project Banner](https://via.placeholder.com/1200x300.png?text=Rewards+Bolivia)

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/figuedmundo/bolivia-rewards/ci.yml?branch=main&style=for-the-badge" alt="Build Status">
  <img src="https://img.shields.io/github/license/figuedmundo/bolivia-rewards?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/github/last-commit/figuedmundo/bolivia-rewards?style=for-the-badge" alt="Last Commit">
</p>

> A modern loyalty and rewards platform for businesses and customers in Bolivia, built with a focus on speed, security, and user experience.

## ✨ Key Features

-   **Instantaneous Transactions:** Sub-1.5-second point redemptions for a seamless user experience.
-   **Hybrid On-chain/Off-chain Model:** Combines the speed of a traditional database with the trust and auditability of a blockchain.
-   **Modular Monolith Architecture:** A scalable and maintainable codebase that is easy to develop and deploy.
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

This project is a monorepo using npm workspaces. The main packages are:

```
/rewards-bolivia
├───e2e/             # End-to-end tests
├───infra/           # Infrastructure as Code (Docker, K8s)
├───packages/
│   ├───api/         # NestJS Backend (Modular Monolith)
│   ├───web/         # React Frontend (Dashboard)
│   ├───worker/      # Background job processor
│   ├───sdk/         # Auto-generated API client
│   ├───shared-types/# Shared TypeScript types and DTOs
│   ├───libs/        # Shared libraries (auth, logger, etc.)
│   └───test-utils/  # Test utilities and fixtures
└───docs/            # Project documentation
```

For a more detailed explanation of the architecture, please see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## 🏁 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or higher)
-   [npm](https://www.npmjs.com/) (v10 or higher)
-   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-github/your-repo.git
    cd rewards-bolivia
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    ```bash
    cp .env.example .env
    ```
    *Fill in the required variables in the `.env` file.*

## 🏃 Running the Project

1.  **Start the infrastructure (Database & Cache):**
    ```bash
    docker-compose -f infra/local/docker-compose.yml up -d
    ```

2.  **Run database migrations:**
    ```bash
    npm run -w api db:migrate
    ```

3.  **Start the development servers:**
    ```bash
    npm run dev
    ```
    *This will start the API backend, the web frontend, and the worker concurrently.*

The application will be available at the following URLs:
-   **Web App:** `http://localhost:5173`
-   **API:** `http://localhost:3001`

## 🧪 Running Tests

This project uses a comprehensive testing strategy. For more details, please see [`docs/TESTING.md`](./docs/TESTING.md).

-   **Run all tests:**
    ```bash
    npm test
    ```

-   **Run tests for a specific package:**
    ```bash
    # For the API
    npm run -w api test

    # For the Web App
    npm run -w web test
    ```

-   **Run E2E tests:**
    ```bash
    npm run test:e2e
    ```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) to get started.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 📞 Contact

-   **Project Maintainer:** [Your Name] - [figuedmundol@gmail.com]
-   **GitHub Issues:** [https://github.com/figuedmundo/bolivia-rewards/issues](https://github.com/figuedmundo/bolivia-rewards/issues)
