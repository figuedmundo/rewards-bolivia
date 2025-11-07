# Sprint 2: Módulos de Transacciones y Economía

**Duración:** 2 semanas

**Objetivo:** Implementar el núcleo del sistema Rewards: transacciones, emisión/redención de puntos y control contable.

**Arquitectura:** Modular Monolith (NestJS + Prisma + PostgreSQL + Redis).

**Sprint Goal:** Completar el ciclo económico básico Cliente ↔ Comercio ↔ Rewards.

---

## 🎯 Historias de Usuario

| ID | Historia | Prioridad | Tipo |
| --- | --- | --- | --- |
| US05 | Como negocio, quiero emitir puntos a mis clientes por cada compra para fomentar fidelización. | 🔴 Alta | Backend |
| US06 | Como cliente, quiero redimir mis puntos en el momento del pago para obtener descuentos. | 🔴 Alta | Backend + Frontend |
| US07 | Como administrador, quiero ver auditorías y métricas de puntos para controlar la economía. | 🟡 Media | Backend |
| US08 | Como QA, quiero validar la integridad de las transacciones en una base auditable. | 🟡 Media | QA/Testing |

---

## ✅ Criterios de Aceptación Globales

- Ciclo de emisión/redención funcional end-to-end.
- Persistencia ACID con transacciones Prisma.
- Logs auditable (`on-chain hash` simulado).
- Latencia promedio de transacción ≤ 200 ms.
- Tests piramidales 60/30/10 respetados.
- Dashboard de auditoría básico disponible.

---

## 🧩 Épica 5 – Módulo Transactions (Economía y Recompensas)

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación | Progreso |
| --- | --- | --- | --- | --- |
| T5.1 | Crear módulo `transactions` (service, controller, repo, entity). | 1 d |  | ✅ Done |
| T5.2 | Definir entidades Prisma: `Transaction`, `PointLedger`, `Business`, `Customer`. | 1 d |  | ✅ Done |
| T5.3 | Implementar endpoint `POST /transactions/earn` (emisión puntos). | 1 d |  | ✅ Done |
| T5.4 | Implementar endpoint `POST /transactions/redeem` (redención puntos). | 1 d |  | ✅ Done |
| T5.5 | Validar límites redención (máx. 30 % ticket). | 0.5 d |  | ✅ Done |
| T5.6 | Agregar middleware para atomicidad (una transacción por flujo). | 0.5 d |  | ✅ Done |
| T5.7 | Generar eventos de auditoría con hash SHA256. | 0.5 d |  | ✅ Done |
| T5.8 | Integrar Redis para cachear balances. | 0.5 d |  | ⏳ In Progress |

### 🔍 Testing (Transactions)

| Tipo | Descripción | Estimación | Progreso |
| --- | --- | --- | --- |
| Unit (60 %) | Validar reglas de negocio (earn/redeem, límites). | 1 d | ✅ Done |
| Integration (30 %) | Flujo DB + Redis + API. | 1 d | ⏳ In Progress |
| E2E (10 %) | Escenario completo Cliente ↔ Comercio. | 0.5 d | ⬜ Not Started |

---

## 🧩 Épica 6 – Módulo Ledger & Auditoría

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación |
| --- | --- | --- | --- |
| T6.1 | Crear módulo `ledger` para registros contables. | 0.5 d |  |
| T6.2 | Implementar tabla `LedgerEntry` (punto, tipo, hash, timestamp). | 0.5 d |  |
| T6.3 | Generar hash SHA256 por transacción (`txId + amount + timestamp`). | 0.5 d |  |
| T6.4 | Endpoint `GET /ledger/audit` (solo admin). | 0.5 d |  |
| T6.5 | Integrar auditoría diaria automatizada (cron + Redis). | 0.5 d |  |

### 🔍 Testing (Ledger)

| Tipo | Descripción | Estimación |
| --- | --- | --- |
| Unit | Validar hash generation y consistencia. | 0.5 d |
| Integration | Insert/query consistentes en transacciones. | 0.5 d |

---

## 🧩 Épica 7 – Frontend (Puntos y Transacciones)

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación |
| --- | --- | --- | --- |
| T7.1 | Crear vista “Wallet de Puntos” (saldo, historial, caducidad). | 1 d |  |
| T7.2 | Crear vista “Transacción” (pago con puntos). | 1 d |  |
| T7.3 | Integrar API `/earn` y `/redeem`. | 0.5 d |  |
| T7.4 | Feedback visual instantáneo (toast + animación). | 0.5 d |  |
| T7.5 | Mostrar expiración de puntos en UI. | 0.5 d |  |
| T7.6 | Añadir visualización simple de auditoría (solo admin). | 0.5 d |  |

### 🔍 Testing (Frontend)

| Tipo | Descripción | Estimación |
| --- | --- | --- |
| Unit (60 %) | Validar hooks y stores (saldo, expiración). | 0.5 d |
| Integration (30 %) | Flujo earn/redeem vía API. | 0.5 d |
| E2E (10 %) | Cliente realiza compra y redime puntos. | 0.5 d |

---

## 🧩 Épica 8 – QA y Performance Testing

### 🧱 Tareas de Desarrollo

| ID | Tarea | Descripción | Estimación |
| --- | --- | --- | --- |
| T8.1 | Ampliar suite Jest + Supertest (Integration). | 0.5 d |  |
| T8.2 | Añadir E2E con Playwright: flujo emisión/redención. | 0.5 d |  |
| T8.3 | Cargar test con k6: 100 req/s durante 30 s. | 0.5 d |  |
| T8.4 | Generar reportes automáticos (Allure + CI). | 0.5 d |  |

---

## 📊 Métricas Sprint 2

| Indicador | Meta | Fuente |
| --- | --- | --- |
| Cobertura total tests | ≥ 75 % | Codecov |
| Latencia promedio `/transactions/earn` | ≤ 200 ms | k6 |
| Tiempo de commit → deploy | ≤ 10 min | CI/CD |
| Integridad transaccional | 100 % (sin fallos ACID) | Audit Logs |
| Errores críticos | 0 | QA |

---

## 🚀 Entregables Sprint 2

1. Módulos `transactions` y `ledger` operativos.
2. Flujo completo de emisión/redención (cliente ↔ comercio).
3. Auditoría digital de transacciones (hash SHA256).
4. Front “Wallet” + flujo de redención visual.
5. Redis implementado como capa de cache de balances.
6. Suite QA completa con Unit, Integration y E2E.
7. Tests de carga con métricas.

---

> 🧠 Testing Philosophy (reaplicada):
> 
> - Unit → Reglas de negocio y validaciones económicas.
> - Integration → ACID transactions (DB + Redis).
> - E2E → Ciclo cliente–comercio–recompensa.
> - Performance → Validar throughput y latencia en carga.
> 
> 🧩 **Resultado:** sistema económico estable, auditable y rápido. Base sólida para el Sprint 3 (Governance + Analytics).
>

---

# Progress 


## Resumen de Progreso (Actualización) (Thursday 6 November)

### 🚀 Hitos Completados:

1.  **Implementación del Flujo de Redención de Puntos:**
    *   Endpoint `POST /transactions/redeem` implementado y validado.
    *   Límites de redención (máx. 30% del ticket) validados.
    *   Atomicidad de las transacciones garantizada mediante el uso de `$transaction` de Prisma.
    *   Generación de hash de auditoría SHA256 implementada.
2.  **Testing del Módulo Transactions:**
    *   Pruebas de integración para el flujo de redención completadas.

### 🚧 Tareas Pendientes:

1.  **Optimización y Caching:**
    *   Integrar Redis para cachear balances.
2.  **Testing del Módulo Transactions:**
    *   Implementar pruebas de integración para el flujo DB + Redis + API.
    *   Desarrollar pruebas E2E para el escenario completo Cliente ↔ Comercio.

---

## Resumen de Progreso (Actualización) (Wednesday 5 November)

### 🚀 Hitos Completados:

1.  **Configuración Inicial del Módulo Transactions:**
    *   Módulo `transactions` creado (service, controller, repository, entity).
    *   Entidades Prisma `Transaction`, `PointLedger`, `Business`, `Customer` definidas.
    *   Endpoint `POST /transactions/earn` implementado para la emisión de puntos.

### 🚧 Tareas Pendientes:

1.  **Implementación del Flujo de Redención de Puntos:**
    *   Implementar endpoint `POST /transactions/redeem`.
    *   Validar límites de redención (máx. 30 % ticket).
2.  **Manejo de Transacciones y Auditoría:**
    *   Agregar middleware para atomicidad (una transacción por flujo).
    *   Generar eventos de auditoría con hash SHA256.
3.  **Optimización y Caching:**
    *   Integrar Redis para cachear balances.
4.  **Testing del Módulo Transactions:**
    *   Completar pruebas unitarias para reglas de negocio (earn/redeem, límites).
    *   Implementar pruebas de integración para el flujo DB + Redis + API.
    *   Desarrollar pruebas E2E para el escenario completo Cliente ↔ Comercio.
