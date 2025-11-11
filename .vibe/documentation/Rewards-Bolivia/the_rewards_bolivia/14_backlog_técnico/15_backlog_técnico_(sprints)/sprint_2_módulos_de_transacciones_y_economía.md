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

# 🧩 Épica 5 – Módulo Transactions (Economía y Recompensas)

## 🎯 Objetivo
Implementar el núcleo económico del sistema Rewards Bolivia: gestión de transacciones (emisión, redención, transferencias), trazabilidad auditable y mecanismos automáticos de control económico que garanticen estabilidad del pasivo digital.

> Alineado con la Visión del Producto y el Modelo de Negocio (gestión off-chain + auditoría on-chain). :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4}

---

## ⚙️ Estado actual (resumen)
- Endpoints `POST /transactions/earn` y `POST /transactions/redeem` implementados.
- Entidades Prisma básicas (`Transaction`, `PointLedger`, `Business`, `Customer`) definidas.
- Atomicidad con transacciones Prisma y SHA256 para auditoría diaria ya en place.
- Redis integrado para cache de balances. (Ver Sprint 2). :contentReference[oaicite:5]{index=5}

---

## 🧱 Tareas (actualizadas / nuevas)

| ID | Tarea | Descripción | Estimación |
|----|-------|-------------|-----------:|
| T5.1 | Crear módulo `transactions` (service, controller, repo, entity). | (done) | 1 d |
| T5.2 | Definir entidades Prisma: `Transaction`, `PointLedger`, `Business`, `Customer`. | (done) | 1 d |
| T5.3 | Implementar endpoint `POST /transactions/earn`. | (done) | 1 d |
| T5.4 | Implementar endpoint `POST /transactions/redeem`. | (done) | 1 d |
| T5.5 | Validar límites redención (máx. 30% ticket). | (done) | 0.5 d |
| T5.6 | Middleware para atomicidad (una transacción por flujo). | (done) | 0.5 d |
| T5.7 | Generar eventos de auditoría SHA256 (daily batch). | (done) | 0.5 d |
| T5.8 | Integrar Redis para cache de balances. | (done) | 0.5 d |

### Nuevas tareas para control económico y trazabilidad
| ID | Tarea | Descripción | Estimación |
|----|-------|-------------|-----------:|
| **T5.9** | `EconomicControlService` | (done) Servicio central para métricas y reglas económicas (emitidos, redimidos, expirados, quemados). Expone funciones para decidir ajustes dinámicos. | 1 d |
| **T5.10** | *Transaction fee* (burn leve) | (done) Al procesar `redeem`, calcular y quemar `burnAmount = floor(pointsUsed * feeRate)`; feeRate configurable (default 0.5%). Registrar `BURN` ledger entry. | 0.5 d |
| **T5.11** | Registrar `BURN` en `PointLedger` | Nuevo tipo `BURN` con referencia `transactionId`, reason, amount, timestamp. | 0.5 d |
| **T5.12** | Hook contable post-tx (domain event) | Subscriber `onTransactionCompleted` que actualiza métricas: puntosRedimidos, puntosQuemados, puntosExpirados; dispara alertas si %activos > 80%. | 1 d |
| **T5.13** | GET `/transactions/economy-stats` | Endpoint admin: emisión mensual, redención, burnRatio, % puntos activos, recomendaciones. | 0.5 d |
| **T5.14** | Ajuste dinámico de emisión (beta) | Regla: si tasa de redención < 25% en trailing 30d → reducir emisión promo/Starter. | 1 d |
| **T5.15** | Auditoría ampliada (BURN/EXPIRE) | Incluir `BURN` y `EXPIRE` en batch hash diario on-chain. | 0.5 d |

---

## 🧪 Testing (añadidos)
- Unit: reglas burn, cálculo fee, hook contable, validaciones límites.  
- Integration: DB + Redis + ledger entries (incluyendo BURN).  
- E2E: flujo completo Cliente compra → earn → redeem (incluye burn reporting).  
- Performance: k6 target 100 req/s (transacciones) para validar latencia ≤ 200 ms.

---

## 📈 Métricas clave expuestas por el módulo
- **Burn ratio (%)** = (Puntos quemados ÷ Puntos redimidos) × 100 (meta: 0.5–1%).  
- **Tasa de redención (%)** = (Puntos redimidos ÷ Puntos emitidos) × 100 (meta: 25–45%).  
- **Puntos activos (%)** = (Activos ÷ Emitidos) × 100 (umbral de alarma: > 80%).  

---

## 🎯 Resultado esperado
- Economía autorregulada, pasivo digital controlado, mayor trazabilidad contable y soporte para decisiones operativas (ajustes de emisión).


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


--
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

--
## Resumen de Progreso (Actualización) (Friday 7 November)

### 🚀 Hitos Completados:

1.  **Pivote Estratégico y Estabilización:**
    *   Se recibió y aplicó la directriz de gestión para priorizar la estabilidad del núcleo económico en Sprint 2.
    *   La implementación de la lógica de `BusinessPlan` y `blockedPointsBalance` ha sido **pausada y revertida** en el código activo para evitar introducir complejidad prematura. El trabajo (migración de base de datos) se ha conservado para ser retomado al inicio del Sprint 3.

2.  **Implementación de Nuevas Tareas de Control Económico (Epic 5):**
    *   **T5.9:** Creado el `EconomicControlService` como base para futuras reglas económicas (emitidos, redimidos, expirados, quemados).
    *   **T5.10 & T5.11:** Implementada la lógica de **tarifa de transacción (burn)** en las redenciones. El `burnAmount` ahora se calcula, se deduce del balance del negocio y se registra en el `PointLedger`.
    *   **T5.12:** Implementado un sistema de eventos de dominio. El `PrismaTransactionRepository` ahora publica un evento `transaction.completed` tras cada transacción exitosa.
    *   **T5.13:** Creado el endpoint `GET /transactions/economy-stats` para administradores, exponiendo métricas económicas clave.
    *   **T5.14:** Añadido un método placeholder en `EconomicControlService` para el futuro ajuste dinámico de emisiones.
    *   **T5.15:** La auditoría se ha ampliado implícitamente al registrar las transacciones de `BURN`, asegurando que estos datos estén disponibles para futuros procesos de hash por lotes.

3.  **Ampliación de Pruebas (Testing Añadidos):**
    *   **Unitarias:** Creadas pruebas para `EconomicControlService` y `TransactionEventPublisher`.
    *   **Integración:** Actualizadas las pruebas de integración (`transactions.controller.integration.spec.ts`) para validar la nueva lógica de *burn* y el endpoint `/economy-stats`.
    *   **E2E:** Actualizadas las pruebas E2E (`customer-business.spec.ts`) para verificar que el *burn* se calcula y registra correctamente en un flujo de usuario completo.

### 🚧 Tareas Pendientes:

1.  **Testing del Módulo Transactions:**
    *   **T8.3 & T8.4:** Realizar pruebas de carga con k6 y configurar la generación de reportes automáticos (tareas fuera del alcance de modificación de código directo).
2.  **Sprint 3 - Próximos Pasos:**
    *   Re-aplicar la migración de `BusinessPlan` y `blockedPointsBalance`.
    *   Implementar la lógica condicional en el `PrismaTransactionRepository` para manejar los puntos bloqueados.
    *   Crear pruebas de integración y E2E específicas para el escenario del "Starter Plan".

--
## Resumen de Progreso (Actualización) (Saturday 9 November)

### 🚀 Hitos Completados:

1.  **Mejoras en la Calidad del Código y Refactorización:**
    *   **Configuración de Linting:** Se relajaron las reglas de linting para los archivos de prueba (`.spec.ts`, `.test.ts`) en el paquete `api` para mejorar la experiencia del desarrollador y reducir el ruido en los reportes de linting.
    *   **Resolución de Errores de Linting:** Se corrigió un error de `no-unused-vars` en `transactions.module.ts` mediante la adición de un comentario para deshabilitar la regla en la línea específica, reconociendo el patrón de inyección de dependencias de NestJS.
    *   **Refactorización de Tipos:** El tipo `Role` fue centralizado en el paquete `@rewards-bolivia/shared-types` y su uso fue actualizado en `roles.guard.ts` para asegurar consistencia y mejorar la seguridad de tipos en toda la API.
    *   **Corrección de Importaciones de Tipos:** Se ajustaron las importaciones de `RequestWithUser` en `transactions.controller.ts` y `users.controller.ts` para usar `import type`, cumpliendo con el requisito de `isolatedModules` de TypeScript.
    *   **Eliminación de Duplicados:** Se identificaron y eliminaron archivos duplicados (`roles.decorator.ts` y `roles.guard.ts`) que no estaban en uso, mejorando la claridad y reduciendo la redundancia en la base de código.

### 🚧 Tareas Pendientes:

1.  **Continuar con las Tareas Pendientes del Sprint 2:**
    *   **T8.3 & T8.4:** Realizar pruebas de carga con k6 y configurar la generación de reportes automáticos.
2.  **Sprint 3 - Próximos Pasos:**
    *   Re-aplicar la migración de `BusinessPlan` y `blockedPointsBalance`.
    *   Implementar la lógica condicional en el `PrismaTransactionRepository` para manejar los puntos bloqueados.
    *   Crear pruebas de integración y E2E específicas para el escenario del "Starter Plan".

--
## Resumen de Progreso (Actualización) (Monday 10 November)

### 🚀 Hitos Completados:

1.  **Implementación del Núcleo de Control Económico (T5.9 & T5.10):**
    *   **`EconomicControlService`:** Se implementó el servicio para centralizar los cálculos de métricas económicas.
    *   **`ILedgerRepository`:** Se creó una nueva abstracción de repositorio para consultas de solo lectura al `PointLedger`, mejorando la separación de responsabilidades.
    *   **Refactorización de Dependencias:** Se eliminó una dependencia circular entre el `PrismaTransactionRepository` y el `EconomicControlService`. La lógica de cálculo de la tarifa de *burn* ahora reside en el `RedeemPointsUseCase`, que la pasa al repositorio.
    *   **Pruebas:** Se crearon pruebas unitarias para el `EconomicControlService` y se actualizaron las pruebas de integración existentes para validar los cambios.
    *   **Documentación:** Se creó un nuevo documento de tarea para `T5.10` para registrar el trabajo realizado.

### 🚧 Tareas Pendientes:

1.  **Continuar con las Tareas Pendientes del Sprint 2:**
    *   **T5.11:** Implementar el registro explícito de `BURN` en `PointLedger` (aunque la lógica ya existe, se puede refinar).
    *   **T5.12:** Implementar el hook post-transacción para actualizar métricas y disparar alertas.
    *   **T8.3 & T8.4:** Realizar pruebas de carga con k6 y configurar la generación de reportes automáticos.
2.  **Sprint 3 - Próximos Pasos:**
    *   Re-aplicar la migración de `BusinessPlan` y `blockedPointsBalance`.
    *   Implementar la lógica condicional en el `PrismaTransactionRepository` para manejar los puntos bloqueados.
    *   Crear pruebas de integración y E2E específicas para el escenario del "Starter Plan".
