# Sprint 1:  Fundaciones Técnicas

**Duración:** 2 semanas

**Objetivo:** Configurar la base técnica del monolito modular: entorno, arquitectura, autenticación y pipeline de QA.

**Arquitectura:** Modular Monolith (NestJS + TypeScript + Prisma + PostgreSQL + Redis).

**Testing Philosophy:** Test Pyramid (60 % Unit / 30 % Integration / 10 % E2E).

**Sprint Goal:** Entorno unificado, autenticación funcional y suite de pruebas rápida (< 5 min).

---

## 🎯 Historias de Usuario

| ID | Historia | Prioridad | Tipo |
| --- | --- | --- | --- |
| US01 | Como desarrollador, quiero un entorno Dockerizado y reproducible con CI/CD para trabajar sin fricciones. | 🔴 Alta | Infraestructura |
| US02 | Como administrador, quiero que la API central tenga autenticación segura JWT/OAuth2 para usuarios y negocios. | 🔴 Alta | Backend |
| US03 | Como usuario o negocio, quiero registrarme e iniciar sesión para acceder a mis datos. | 🔴 Alta | Backend + Frontend |
| US04 | Como QA, quiero una suite de pruebas automatizada según la pirámide para detectar errores tempranamente. | 🟡 Media | QA/Testing |

---

## ✅ Criterios de Aceptación Globales

- Repositorios configurados en monorepo (`/packages/api`, `/packages/web`, `/infra`).
- CI/CD ejecuta Unit + Integration tests automáticamente.
- Autenticación JWT + Google OAuth2 funcional.
- Login / Registro desde el Front conectado al backend.
- Cobertura ≥ 70 %.
- Build completa < 5 min.
- Documentación Swagger lista.

---

## 🧩 Épica 1 – Infraestructura & Entorno (Modular Monolith Setup)

### 🧱 Tareas de Desarrollo

| ID | Tarea | Responsable | Estimación |
| --- | --- | --- | --- |
| T1.1 | Crear monorepo (`api`, `web`, `infra`) con Yarn Workspaces o Nx. | DevOps | 1 d |
| T1.2 | Configurar Docker Compose (Postgres, Redis, API, Web). | DevOps | 1 d |
| T1.3 | Estructurar proyecto NestJS con módulos iniciales: `auth`, `users`, `common`. | Backend Lead | 1 d |
| T1.4 | Configurar CI/CD (GitHub Actions) con testing y build Docker. | DevOps | 1 d |
| T1.5 | Configurar Prisma ORM + migraciones automáticas. | Backend Dev | 0.5 d |
| T1.6 | Documentar estructura DDD y naming conventions. | Tech Lead | 0.5 d |

### 🔍 Testing (Infraestructura)

| Tipo | Descripción | Estimación |
| --- | --- | --- |
| Integration | Build + Deploy staging sin errores. | 0.5 d |
| Integration | Validar rollback automático. | 0.5 d |

---

## 🧩 Épica 2 – Autenticación & Seguridad (Auth Module)

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación |
| --- | --- | --- | --- |
| T2.1 | Crear módulo `auth` con controlador, servicio y repos. | 1 d |  |
| T2.2 | Endpoints `/auth/register` y `/auth/login`. | 1 d |  |
| T2.3 | JWT (Access 15 min + Refresh 30 d) + Hash bcrypt. | 1 d |  |
| T2.4 | Integrar Google OAuth2. | 1 d |  |
| T2.5 | Middleware de roles (client, business, admin). | 0.5 d |  |
| T2.6 | Documentar en Swagger. | 0.5 d |  |

### 🔍 Testing (Auth)

| Tipo | Descripción | Estimación |
| --- | --- | --- |
| Unit (60 %) | Validar servicios Auth: hash, JWT, validaciones. | 1 d |
| Integration (30 %) | Flujo register → login → refresh. | 1 d |
| E2E (10 %) | Flujo login → dashboard dummy. | 0.5 d |

---

## 🧩 Épica 3 – Frontend Básico (Web)

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación |
| --- | --- | --- | --- |
| T3.1 | Crear app React (Vite + Tailwind + shadcn/ui). | 1 d |  |
| T3.2 | Pantallas Login, Registro, Recuperar Contraseña. | 1.5 d |  |
| T3.3 | Conectar con API Auth. | 0.5 d |  |
| T3.4 | Integrar Google OAuth. | 0.5 d |  |
| T3.5 | Token storage seguro (LocalStorage + Refresh Flow). | 0.5 d |  |

### 🔍 Testing (Frontend)

| Tipo | Descripción | Estimación |
| --- | --- | --- |
| Unit (60 %) | Validaciones de formularios y hooks. | 0.5 d |
| Integration (30 %) | Llamadas API Auth + render UI. | 0.5 d |
| E2E (10 %) | Login → Home vacía. | 0.5 d |

---

## 🧩 Épica 4 – QA Pipeline Automatizado

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación |
| --- | --- | --- | --- |
| T4.1 | Configurar Jest + Supertest (NestJS). | 0.5 d |  |
| T4.2 | Configurar Playwright mínimo para flujos críticos. | 0.5 d |  |
| T4.3 | Integrar reportes de cobertura Codecov. | 0.5 d |  |
| T4.4 | Añadir linting y pre-commit checks. | 0.5 d |  |

---

## 📊 Métricas Sprint 1

| Indicador | Meta | Fuente |
| --- | --- | --- |
| Cobertura tests | ≥ 70 % | Codecov |
| Tiempo pipeline | ≤ 5 min | GitHub Actions |
| Latencia login API | ≤ 200 ms | k6 |
| Builds exitosos | 100 % | CI/CD |
| Errores críticos | 0 | QA Report |

---

## 🚀 Entregables Sprint 1

1. Monorepo funcional (API + Web + Infra).
2. Arquitectura modular NestJS implementada (Auth + Users).
3. Autenticación JWT + Google OAuth2 operativa.
4. Front básico (login/registro).
5. CI/CD automático con tests piramidales.
6. Cobertura ≥ 70 %, pipeline < 5 min.
7. Documentación Swagger + Readme arquitectónico.

---

> 🧠 Testing Principles:
> 
> - Unit: lógica interna de módulos.
> - Integration: API + DB (Postgres en Docker).
> - E2E: flujos críticos (login).
> - Feedback loop rápido < 5 min CI/CD.
> 
> 🧩 Resultado: una base técnica robusta, rápida y modular lista para escalar a transacciones en Sprint 2.
>