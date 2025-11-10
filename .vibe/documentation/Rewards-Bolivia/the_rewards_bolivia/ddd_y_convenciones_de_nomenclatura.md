# Estructura DDD y Convenciones de Nomenclatura

> **Propósito**: Este documento define la estructura de directorios y las convenciones de nomenclatura a seguir en el proyecto Rewards Bolivia. El objetivo es mantener un código limpio, consistente y fácil de mantener a medida que el proyecto escala.

---

## 1. Estructura de Directorios (Backend - NestJS)

El backend sigue una arquitectura de Monolito Modular inspirada en los principios de Domain-Driven Design (DDD). Cada módulo de NestJS representa un **Bounded Context** del dominio.

```
/packages/api/src/
├───app.module.ts
├───main.ts
├───[nombre-del-modulo]/                # Bounded Context (e.g., auth, users, transactions)
│   ├───application/                    # Lógica de aplicación (Casos de Uso)
│   │   ├───dto/                        # Data Transfer Objects (DTOs)
│   │   │   ├───[nombre-del-caso-de-uso].dto.ts
│   │   └───[nombre-del-caso-de-uso].use-case.ts
│   ├───domain/                         # Lógica y entidades del dominio
│   │   ├───entities/                   # Entidades de dominio (Rich Models)
│   │   │   └───[nombre-de-la-entidad].entity.ts
│   │   ├───repositories/               # Interfaces de repositorios
│   │   │   └───[nombre-de-la-entidad].repository.ts
│   │   └───services/                   # Servicios de dominio
│   │       └───[nombre-del-servicio].service.ts
│   ├───infrastructure/                 # Implementaciones de infraestructura
│   │   ├───controllers/                # Controladores de API (HTTP)
│   │   │   └───[nombre-del-modulo].controller.ts
│   │   ├───repositories/               # Implementación de repositorios (e.g., Prisma)
│   │   │   └───[nombre-de-la-entidad].prisma.repository.ts
│   │   └───gateways/                    # Gateways a servicios externos
│   │       └───[nombre-del-gateway].gateway.ts
│   └───[nombre-del-modulo].module.ts
└───prisma/                             # Schema y migraciones de Prisma
    └───schema.prisma
```

### Descripción de las Capas:

*   **Domain:** Contiene la lógica de negocio pura y las entidades del dominio. No debe tener dependencias de ninguna otra capa.
*   **Application:** Orquesta los casos de uso de la aplicación. Utiliza los servicios de dominio y los repositorios para ejecutar la lógica de negocio.
*   **Infrastructure:** Contiene las implementaciones concretas de las interfaces definidas en la capa de dominio (e.g., controladores, repositorios de base de datos, gateways a servicios externos).

---

## 2. Convenciones de Nomenclatura

### General

*   **Idioma:** Inglés para todo el código (variables, funciones, clases, etc.).
*   **Formato:** `camelCase` para variables y funciones, `PascalCase` para clases y tipos.

### Archivos

*   **Módulos:** `[nombre-del-modulo].module.ts` (e.g., `auth.module.ts`)
*   **Controladores:** `[nombre-del-modulo].controller.ts` (e.g., `auth.controller.ts`)
*   **Servicios:** `[nombre-del-servicio].service.ts` (e.g., `auth.service.ts`)
*   **Casos de Uso:** `[nombre-del-caso-de-uso].use-case.ts` (e.g., `login-user.use-case.ts`)
*   **DTOs:** `[nombre-del-dto].dto.ts` (e.g., `login-user.dto.ts`)
*   **Entidades:** `[nombre-de-la-entidad].entity.ts` (e.g., `user.entity.ts`)
*   **Repositorios (Interfaz):** `[nombre-de-la-entidad].repository.ts` (e.g., `user.repository.ts`)
*   **Repositorios (Implementación):** `[nombre-de-la-entidad].prisma.repository.ts` (e.g., `user.prisma.repository.ts`)
*   **Guards:** `[nombre-del-guard].guard.ts` (e.g., `jwt-auth.guard.ts`)
*   **Strategies:** `[nombre-de-la-estrategia].strategy.ts` (e.g., `jwt.strategy.ts`)
*   **Decorators:** `[nombre-del-decorador].decorator.ts` (e.g., `roles.decorator.ts`)

### Clases

*   **Nombres:** Usar sustantivos en `PascalCase`.
*   **Sufijos:**
    *   `Module` para módulos de NestJS (e.g., `AuthModule`).
    *   `Controller` para controladores (e.g., `AuthController`).
    *   `Service` para servicios (e.g., `AuthService`).
    *   `UseCase` para casos de uso (e.g., `LoginUserUseCase`).
    *   `Dto` para Data Transfer Objects (e.g., `LoginUserDto`).
    *   `Entity` para entidades de dominio (e.g., `UserEntity`).
    *   `Repository` para interfaces de repositorios (e.g., `UserRepository`).
    *   `PrismaRepository` para implementaciones de repositorios con Prisma (e.g., `UserPrismaRepository`).
    *   `Guard` para guards (e.g., `RolesGuard`).
    *   `Strategy` para strategies de Passport (e.g., `JwtStrategy`).

### Métodos y Funciones

*   **Nombres:** Usar verbos en `camelCase` que describan la acción (e.g., `getUser`, `createTransaction`).

### Variables

*   **Nombres:** Usar sustantivos en `camelCase` que describan el contenido de la variable (e.g., `user`, `transactionAmount`).

---

## 3. Ejemplo Práctico

A continuación, se muestra un ejemplo de cómo se aplicarían estas convenciones en el módulo `auth`:

*   **Módulo:** `auth.module.ts`
*   **Controlador:** `auth.controller.ts`
*   **Caso de Uso (Login):** `login.use-case.ts`
*   **DTO (Login):** `login.dto.ts`
*   **Entidad de Dominio:** `user.entity.ts`
*   **Repositorio (Interfaz):** `user.repository.ts`
*   **Repositorio (Implementación):** `user.prisma.repository.ts`
