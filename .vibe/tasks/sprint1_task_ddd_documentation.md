# AI Task Template: Rewards Bolivia Feature Development

> **Purpose**: This template provides a systematic framework for planning and executing new features for the Rewards Bolivia project. It ensures consistency, quality, and alignment with the project's architectural and product goals.

---

## 1. Task Overview

### Task Title
**Title:** T1.6 Documentar estructura DDD y naming conventions.

### Goal Statement
**Goal:** To create a clear and comprehensive document that outlines the Domain-Driven Design (DDD) structure and naming conventions for the Rewards Bolivia project. This will ensure consistency and maintainability as the codebase grows.

---

## 2. Strategic Analysis & Solution Options

### Recommendation and Justification

**Recommended Solution:** Create a new markdown file in the `.vibe/documentation` directory.

**Why this is the best choice:**
1.  **Centralized Documentation:** The `.vibe/documentation` directory is the designated location for all project-related documentation.
2.  **Markdown Format:** Markdown is a simple and effective format for creating technical documentation.
3.  **Version Controlled:** The document will be version controlled with the rest of the codebase, ensuring that it stays up-to-date.

---

## 3. Project Context & Current State

### Technology Stack & Architecture
This feature will be built within the established Rewards Bolivia technical environment.

```yaml
Project Name: Rewards Bolivia
Technology Stack:
  Backend: NestJS (Node.js + TypeScript)
  Web App (Dashboard): React (Vite + Tailwind CSS + shadcn/ui)
  Database (Primary): PostgreSQL
  ORM / DB Toolkit: Prisma
  Caching: Redis
  Infrastructure: Docker & Kubernetes (K8s)
  CI/CD: GitHub Actions
  Testing: Jest (Unit), Playwright (E2E), k6 (Load)
Key Architectural Patterns:
  - Modular Monolith
```

### Current State
The project has a basic structure, but there is no formal documentation outlining the DDD structure and naming conventions. This can lead to inconsistencies and make it difficult for new developers to onboard.

---

## 4. Feature Definition

### Problem Statement
As the project grows, it is crucial to have a clear and consistent structure and naming conventions. This will improve code readability, maintainability, and developer productivity.

### Success Criteria (MVP)
- [ ] A new markdown file is created in the `.vibe/documentation` directory.
- [ ] The document outlines the DDD structure for the NestJS backend.
- [ ] The document defines the naming conventions for files, classes, methods, and variables.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** The document should be written in Spanish.
- **System Requirement 2:** The document should be clear, concise, and easy to understand.

---

## 6. Data & Database Changes
No database changes are required for this task.

---

## 7. API & Backend Changes
No API or backend changes are required for this task.

---

## 8. Frontend Changes
No frontend changes are required for this task.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Create Documentation
- **Task 1.1:** Create a new markdown file named `ddd_y_convenciones_de_nomenclatura.md` in the `.vibe/documentation/Rewards-Bolivia/the_rewards_bolivia` directory.
- **Task 1.2:** Write the content of the document, outlining the DDD structure and naming conventions.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Incomplete or Unclear Documentation** | Medium | Medium | Review the document with the team to ensure that it is complete and easy to understand. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading the entire plan.
2.  **Create Documentation:** Create the new markdown file and write the content.
3.  **Review:** Review the document for clarity and completeness.

### Communication Preferences
- Provide a concise summary of the plan before starting.
- Announce the completion of each major milestone.
- If you encounter a blocker or a significant ambiguity, stop and ask for clarification.
