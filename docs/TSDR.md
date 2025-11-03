# Tech Stack Decision Record (TSDR) - Rewards Bolivia MVP

**Status:** Proposed
**Date:** 2025-10-31

## 1. Context

This document outlines the technology stack for the Rewards Bolivia MVP. The primary goals of the MVP are:

-   **Speed to Market:** Rapidly develop and launch a functional product to validate the business model.
-   **Exceptional User Experience:** Ensure near-instantaneous transactions (sub-1.5-second latency) for a fluid user experience.
-   **Trust and Scalability:** Build on a foundation that is secure, auditable, and capable of scaling.
-   **Developer Velocity:** Enable the development team to be productive and maintain a high-quality codebase.

Based on these goals and the analysis in the project documentation, the chosen architectural pattern is a **Modular Monolith**. This approach provides a strong separation of concerns and clear internal boundaries without the operational and network overhead of a microservices architecture, making it ideal for the MVP phase.

## 2. Decision: The Proposed Tech Stack

| Layer                 | Technology                                    | Justification                                                                                                                                                                                                                           |
| --------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**           | **NestJS (Node.js + TypeScript)**             | A mature framework for building efficient and scalable server-side applications. Its module system is a perfect fit for our Modular Monolith architecture, and TypeScript ensures strong type safety, which is crucial for financial logic. |
| **Mobile App**        | **Flutter**                                   | A high-performance, cross-platform framework that allows us to build and maintain both iOS and Android apps from a single codebase, drastically increasing development speed. (Note: This is a planned feature and not part of the current MVP implementation.) |
| **Web App (Dashboard)** | **React (Vite + Tailwind CSS + shadcn/ui)**   | The industry standard for modern web frontends. Vite provides a superior development experience, Tailwind CSS enables rapid styling, and shadcn/ui offers accessible, high-quality components.                                |
| **Database (Primary)**  | **PostgreSQL**                                | A powerful, open-source object-relational database known for its reliability, robustness, and ACID compliance, which is essential for handling transactional data.                                                            |
| **ORM / DB Toolkit**  | **Prisma**                                    | A next-generation Node.js and TypeScript ORM that provides excellent type safety, intuitive data modeling, and simplified database access, reducing boilerplate code.                                                       |
| **Caching**           | **Redis**                                     | An in-memory data store used for caching frequently accessed data (like user balances) to ensure low-latency API responses.                                                                                                    |
| **Blockchain (Audit)**  | **Polygon (PoS)**                             | An EVM-compatible, low-cost, and high-speed network. Ideal for our `Proof-of-Audit` layer, where we will publish daily transaction hashes without impacting user experience.                                                     |
| **Infrastructure**      | **Docker & Kubernetes (K8s)**                 | The standard for containerizing and orchestrating applications. This ensures our environment is reproducible, scalable, and portable across different cloud providers.                                                             |
| **CI/CD**             | **GitHub Actions**                            | Tightly integrated with the source code repository, providing a seamless and powerful way to automate testing, builds, and deployments.                                                                                      |
| **Testing**           | **Jest (Unit), Playwright (E2E), k6 (Load)**  | A comprehensive testing suite. Jest for fast unit tests, Playwright for robust end-to-end browser tests, and k6 for performance and load testing to ensure we meet our latency goals.                                            |

## 3. Consequences

-   **Unified Language (TypeScript):** Using TypeScript across the stack (Backend with NestJS, a common choice for React and potentially Flutter integration) reduces context switching for developers and allows for potential code sharing.
-   **Strong Foundation for Scale:** While starting as a monolith, this stack and modular structure are designed to be broken out into microservices in the future if and when the scale of the business demands it. The use of Docker/K8s makes this transition manageable.
-   **Focus on Developer Experience:** Tools like NestJS, Prisma, Vite, and GitHub Actions are chosen to maximize developer productivity and happiness, which translates to a better, more reliable product, faster.
-   **Cost-Effectiveness:** This stack relies heavily on popular open-source technologies, and the monolith approach reduces infrastructure overhead compared to a distributed system, keeping costs down in the crucial MVP phase.

## 4. Alternatives Considered

-   **Microservices Architecture:** Rejected for the MVP phase due to increased operational complexity, network latency, and slower development velocity. The benefits did not outweigh the costs for our current stage.
-   **Go for Backend:** While Go offers excellent performance, the TypeScript/Node.js ecosystem has a larger talent pool and better synergy with the chosen frontend technologies, making NestJS a more pragmatic choice.
-   **React Native for Mobile:** Flutter was chosen over React Native for its generally higher performance and consistency across platforms, which is beneficial for a smooth UX.
