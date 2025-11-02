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

| ID | Tarea | Responsable | Estimación | Status |
| --- | --- | --- | --- | --- |
| T1.1 | Crear monorepo (`api`, `web`, `infra`) con npm workspaces. | Gemini | 1 d | [x] |
| T1.2 | Configurar Docker Compose (Postgres, Redis). | Gemini | 1 d | [x] |
| T1.3 | Estructurar proyecto NestJS con módulos iniciales: `auth`, `users`. | Gemini | 1 d | [x] |
| T1.4 | Configurar CI/CD (GitHub Actions) con testing y build Docker. | Gemini | 1 d | [x] |
| T1.5 | Configurar Prisma ORM + migraciones automáticas. | Gemini | 0.5 d | [x] |
| T1.6 | Documentar estructura DDD y naming conventions. | Tech Lead | 0.5 d | [ ] |

### 🔍 Testing (Infraestructura)

| Tipo | Descripción | Estimación | Status |
| --- | --- | --- | --- |
| Integration | Build + Deploy staging sin errores. | 0.5 d | [ ] |
| Integration | Validar rollback automático. | 0.5 d | [ ] |

---

## 🧩 Épica 2 – Autenticación & Seguridad (Auth Module)

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación | Status |
| --- | --- | --- | --- | --- |
| T2.1 | Crear módulo `auth` con controlador, servicio y repos. | Gemini | 1 d | [x] |
| T2.2 | Endpoints `/auth/register` y `/auth/login`. | Gemini | 1 d | [x] |
| T2.3 | JWT (Access 15 min + Refresh 30 d) + Hash bcrypt. | Gemini | 1 d | [x] |
| T2.4 | Integrar Google OAuth2. | Gemini | 1 d | [x] |
| T2.5 | Middleware de roles (client, business, admin). | Backend Dev | 0.5 d | [x] |

### 🔍 Testing (Auth)

| Tipo | Descripción | Estimación | Status |
| --- | --- | --- | --- |
| Unit (60 %) | Validar servicios Auth: hash, JWT, validaciones. | 1 d | [x] |
| Integration (30 %) | Flujo register → login → refresh. | 1 d | [x] |
| E2E (10 %) | Flujo login → dashboard dummy. | 0.5 d | [x] |

---

## 🧩 Épica 3 – Frontend Básico (Web)

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación | Status |
| --- | --- | --- | --- | --- |
| T3.1 | Crear app React (Vite + Tailwind + shadcn/ui). | Gemini | 1 d | [x] |
| T3.2 | Pantallas Login, Registro, Recuperar Contraseña. | Frontend Dev | 1.5 d | [x] |
| T3.3 | Conectar con API Auth. | Gemini | 0.5 d | [x] |
| T3.4 | Integrar Google OAuth. | Gemini | 0.5 d | [x] |
| T3.5 | Token storage seguro (LocalStorage + Refresh Flow). | Frontend Dev | 0.5 d | [x] |

### 🔍 Testing (Frontend)

| Tipo | Descripción | Estimación | Status |
| --- | --- | --- | --- |
| Unit (60 %) | Validaciones de formularios y hooks. | 0.5 d | [ ] |
| Integration (30 %) | Llamadas API Auth + render UI. | 0.5 d | [ ] |
| E2E (10 %) | Login → Home vacía. | 0.5 d | [x] |

---

## 🧩 Épica 4 – QA Pipeline Automatizado

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación | Status |
| --- | --- | --- | --- | --- |
| T4.1 | Configurar Jest + Supertest (NestJS). | Gemini | 0.5 d | [x] |
| T4.2 | Configurar Playwright mínimo para flujos críticos. | QA/Dev | 0.5 d | [ ] |
| T4.3 | Integrar reportes de cobertura Codecov. | DevOps | 0.5 d | [ ] |
| T4.4 | Añadir linting y pre-commit checks. | DevOps | 0.5 d | [ ] |

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

# Progress 

---

## ✅ Resumen de Progreso (Actualización) (Friday 31 October)

Hemos completado las siguientes tareas y hitos clave en el Sprint 1:

### 🚀 Hitos Completados:

1.  **Configuración Inicial del Proyecto (Monorepo & Docker):**
    *   Monorepo inicializado con `npm workspaces`.
    *   Paquetes `api` (NestJS) y `web` (React/Vite) scaffolded.
    *   `docker-compose.yml` configurado para `PostgreSQL` y `Redis` con persistencia de datos.
    *   Archivos `.env` y `.gitignore` creados.
    *   Servicios Docker verificados y funcionando.

2.  **Implementación del Core de Autenticación (JWT & Login/Registro):**
    *   Configuración de Prisma en el proyecto `api`.
    *   Modelos `User` y `RefreshToken` definidos en `prisma/schema.prisma`.
    *   Migración inicial de Prisma (`init`) aplicada a la base de datos.
    *   Módulos `AuthModule` y `UsersModule` creados en NestJS.
    *   Utilidad de hash de contraseñas (`bcrypt`) implementada.
    *   `AuthService` implementado con lógica de registro y login.
    *   `AuthController` con endpoints `POST /auth/register` y `POST /auth/login`.
    *   `class-validator` y `class-transformer` instalados y `ValidationPipe` global habilitado.
    *   `JwtStrategy` y `JwtAuthGuard` implementados para protección de rutas.
    *   Ruta de ejemplo protegida (`GET /users/me`) en `UsersController`.
    *   Tests E2E básicos (`auth.e2e-spec.ts`) para registro y login creados.

### 🚧 Tareas Pendientes en Autenticación:

*   Implementación completa de la lógica de `refresh token` (generación, almacenamiento seguro, rotación, revocación).
*   Implementación del endpoint `POST /auth/logout`.
*   Integración de `Google OAuth2` (según US03).
*   Expansión de la cobertura de pruebas para incluir todos los flujos de autenticación y casos de borde.

---

## ✅ Resumen de Progreso (Actualización) (Saturday 1 November)

Continuando con el Sprint 1, hoy hemos logrado los siguientes avances significativos:

### 🚀 Hitos Completados:

1.  **Integración de Google OAuth2 (End-to-End):**
    *   **Backend:**
        *   Implementada la estrategia de Passport.js para Google OAuth2 (`GoogleStrategy`).
        *   Configurado el `AuthModule` para cargar las variables de entorno (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) de forma segura.
        *   Añadidos los endpoints `/auth/google` y `/auth/google/callback` en el `AuthController`.
        *   Implementada la lógica en `AuthService` para validar usuarios de OAuth, crearlos si no existen y generar JWTs.
    *   **Frontend:**
        *   Creado el botón de "Sign in with Google" y la lógica de redirección.
        *   Configurado el proxy de Vite para comunicar el frontend con el backend en el entorno de desarrollo.
        *   Implementada la página de callback para recibir los tokens del backend.

2.  **Configuración y Mejora del Entorno de Testing Frontend:**
    *   Configurado `vitest` para la ejecución de pruebas unitarias y de integración en el paquete `web`.
    *   Solucionados múltiples problemas de configuración con PostCSS, Tailwind CSS y el entorno de ejecución de pruebas.
    *   Creada una estructura de directorios de testing (`__tests__`) para mantener el código fuente limpio.
    *   Añadidas las dependencias necesarias para testing (`@testing-library/user-event`).

3.  **Corrección de Errores y Refactorización:**
    *   Solucionados errores de compilación en el backend relacionados con la configuración de NestJS, tipos de TypeScript y dependencias faltantes.
    *   Resuelto el problema de carga de variables de entorno en un entorno monorepo.
    *   Corregidos errores de 404 y 500 en la comunicación frontend-backend.

---

## ✅ Resumen de Progreso (Actualización) (Saturday 1 November - Tarde)

Hoy hemos completado la implementación del flujo de `refresh token`:

### 🚀 Hitos Completados:

1.  **Implementación del Flujo de Refresh Token (End-to-End):**
    *   **Backend:**
        *   Implementada la lógica de generación, almacenamiento (hasheado) y rotación de `refresh tokens`.
        *   Añadido el endpoint `POST /auth/refresh` para obtener nuevos `access tokens`.
        *   Añadido el endpoint `POST /auth/logout` para invalidar los `refresh tokens`.
        *   Configurado el envío de `refresh tokens` a través de cookies `HttpOnly` para mayor seguridad.
        *   Añadidas y actualizadas las pruebas unitarias y de integración para cubrir el nuevo flujo.
    *   **Frontend:**
        *   Creado un cliente API (`axios`) con un interceptor para gestionar automáticamente la renovación de `access tokens` al recibir un error 401.
        *   Implementado un `AuthContext` para gestionar el estado de autenticación de forma centralizada.
        *   Creadas las páginas de `Login` y `Home`, junto con un `ProtectedRoute` para las rutas que requieren autenticación.
        *   Actualizada la funcionalidad de `logout` para que llame al nuevo endpoint del backend.

### 🚧 Tareas Pendientes en Autenticación:

*   Expansión de la cobertura de pruebas para incluir todos los flujos de autenticación y casos de borde.

---

## ✅ Resumen de Progreso (Actualización) (Saturday 1 November - Noche)

Hoy hemos configurado el pipeline de CI/CD con GitHub Actions:

### 🚀 Hitos Completados:

1.  **Configuración de CI/CD con GitHub Actions:**
    *   Creado el workflow `ci.yml` en `.github/workflows`.
    *   El workflow se dispara en `push` y `pull_request` a la rama `main`.
    *   Configurado un job `build-and-test` que instala dependencias, ejecuta tests de la API y el linter del frontend.
    *   Añadido un servicio de `postgres` al job de testing para las pruebas de integración.
    *   Configurado un job `build-docker-images` que, si los tests pasan en la rama `main`, construye y sube las imágenes de la API y el frontend a DockerHub.
    *   Añadidos los `Dockerfiles` para los paquetes `api` y `web`.

2.  **Configuración de Entornos Docker (Desarrollo y Producción):**
    *   Creado `docker-compose.yml` para el entorno de desarrollo con hot-reloading para `api` y `web`.
    *   Creado `docker-compose.prod.yml` para el entorno de producción.
    *   Creados `Dockerfile.dev` para los paquetes `api` y `web`.
    *   Actualizados y optimizados `Dockerfile.prod` para `api` (multi-stage build) y `web` (custom Nginx).

---

## ✅ Resumen de Progreso (Actualización) (Sunday 2 November)

Hemos completado la implementación del middleware de roles:

### 🚀 Hitos Completados:

1.  **Implementación del Middleware de Roles (End-to-End):**
    *   **Backend:**
        *   Actualizado `prisma/schema.prisma` para incluir el campo `role` en el modelo `User`.
        *   Ejecutada la migración de Prisma para aplicar los cambios a la base de datos.
        *   Creado el decorador `@Roles` para definir los roles requeridos por un endpoint.
        *   Implementado `RolesGuard` para verificar los roles del usuario.
        *   Actualizado `AuthService` para incluir el rol del usuario en el payload del JWT.
        *   Actualizado `JwtStrategy` para extraer el rol del usuario del payload del JWT.
        *   Añadido un endpoint de prueba (`GET /users/admin-only`) en `UsersController` para demostrar el uso del `RolesGuard`.
        *   Añadidas pruebas unitarias para `RolesGuard`.

### 🚧 Tareas Pendientes en Autenticación:

*   Expansión de la cobertura de pruebas para incluir todos los flujos de autenticación y casos de borde.