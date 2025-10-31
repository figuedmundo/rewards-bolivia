# 14. Backlog Técnico

**Versión:** 1.0

**Horizonte:** 90 días

**Basado en:** BRD Funcional Derivado v1.0

**Metodología:** Scrum – 6 Sprints de 2 semanas

---

## 🎯 Objetivo General del MVP

Desarrollar, probar y lanzar la primera versión funcional del ecosistema **Rewards Bolivia**, con los siguientes módulos:

1. App Cliente (emisión/redención/visualización)
2. Dashboard de Negocios
3. Backend API y microservicios base
4. Auditoría off-chain + blockchain (batch diario)
5. Sistema de roles, seguridad y autenticación

---

## 🧩 SPRINT 1 – Fundaciones Técnicas (Semana 1–2)

### 🎯 Objetivo del Sprint

Configurar infraestructura base, pipelines CI/CD, entornos y microservicios iniciales.

### 🧠 Historias de Usuario

| ID | Historia | Prioridad |
| --- | --- | --- |
| US01 | Como desarrollador, quiero un entorno CI/CD automatizado para que el código se despliegue sin fricción. | Alta |
| US02 | Como administrador, quiero que la API esté protegida con JWT para autenticar usuarios. | Alta |
| US03 | Como negocio o cliente, quiero registrarme con Google o email para acceder al sistema. | Alta |

### ✅ Criterios de Aceptación

- CI/CD funcional (GitHub Actions o equivalente).
- Deploy automático a entorno dev.
- Login + registro funcionando vía API.
- JWT válido por 15 min con refresh token.

### 🧱 Tareas Técnicas

- [ ]  Crear repositorios (frontend, backend, infra).
- [ ]  Configurar Docker Compose base (Postgres, Redis).
- [ ]  Definir microservicios: `auth-service`, `user-service`.
- [ ]  Implementar CI/CD (GitHub Actions, staging branch).
- [ ]  Endpoint `/auth/register` y `/auth/login`.
- [ ]  Generación y validación de JWT tokens.
- [ ]  Base de datos `users` con roles iniciales.

---

## 🧩 SPRINT 2 – Core de Transacciones (Semana 3–4)

### 🎯 Objetivo

Implementar la lógica de emisión y redención de puntos.

### 🧠 Historias de Usuario

| ID | Historia | Prioridad |
| --- | --- | --- |
| US04 | Como cliente, quiero escanear un QR en un negocio y recibir puntos al instante. | Crítica |
| US05 | Como negocio, quiero generar un QR dinámico para cada compra. | Crítica |
| US06 | Como cliente, quiero usar mis puntos como descuento al pagar. | Alta |

### ✅ Criterios de Aceptación

- QR válido por 60 segundos.
- Emisión/redención confirmada en <1.5 s.
- Transacción registrada en base off-chain.
- Bloqueo de reuso QR.

### 🧱 Tareas Técnicas

- [ ]  Crear microservicio `transactions-service`.
- [ ]  Endpoint `emitTokens` y `redeemTokens`.
- [ ]  Implementar QR dinámicos (UUID + TTL).
- [ ]  Validaciones antifraude (timestamp + deviceID).
- [ ]  Registros en `transactions` (emit, redeem).
- [ ]  Logs estructurados (Datadog o ELK).

---

## 🧩 SPRINT 3 – App Cliente (Semana 5–6)

### 🎯 Objetivo

Desarrollar la app móvil (Flutter) para clientes finales.

### 🧠 Historias de Usuario

| ID | Historia | Prioridad |
| --- | --- | --- |
| US07 | Como cliente, quiero ver mi saldo de puntos actualizado. | Alta |
| US08 | Como cliente, quiero un historial visual de mis transacciones. | Alta |
| US09 | Como cliente, quiero escanear QR para emitir/redimir puntos. | Crítica |
| US10 | Como cliente, quiero recibir notificaciones cuando gano o uso puntos. | Media |

### ✅ Criterios de Aceptación

- UI fluida y responsive (Android/iOS).
- Sincronización de balance en tiempo real.
- Push notifications (Firebase).
- Historial ordenado por fecha y tipo.

### 🧱 Tareas Técnicas

- [ ]  Crear proyecto Flutter (arquitectura MVVM).
- [ ]  Integrar Auth (Google / Email).
- [ ]  Implementar vistas: Home (saldo), Historial, Escanear QR, Perfil.
- [ ]  Conexión con API `/transactions/history`.
- [ ]  Configurar notificaciones (Firebase Cloud Messaging).
- [ ]  Animación “Has ganado +50 puntos”.

---

## 🧩 SPRINT 4 – Dashboard de Negocios (Semana 7–8)

### 🎯 Objetivo

Permitir que los negocios administren puntos, campañas y métricas.

### 🧠 Historias de Usuario

| ID | Historia | Prioridad |
| --- | --- | --- |
| US11 | Como negocio, quiero ver cuántos puntos emití y redimí hoy. | Alta |
| US12 | Como negocio, quiero crear campañas (doble puntos, horarios). | Media |
| US13 | Como negocio, quiero exportar mis reportes en CSV o PDF. | Media |
| US14 | Como administrador, quiero gestionar roles de empleados. | Alta |

### ✅ Criterios de Aceptación

- Dashboard web funcional (React).
- Campañas configurables (nombre, rango horario, multiplicador).
- Reportes descargables.
- Roles internos por sucursal.

### 🧱 Tareas Técnicas

- [ ]  Crear microservicio `business-service`.
- [ ]  UI React + Tailwind + Chart.js.
- [ ]  Implementar endpoints `/business/stats`, `/business/campaigns`.
- [ ]  Exportador CSV/PDF.
- [ ]  Módulo multiusuario (rol: cajero, gerente).
- [ ]  Filtros de rango de fechas y sucursales.

---

## 🧩 SPRINT 5 – Auditoría Blockchain y Panel Admin (Semana 9–10)

### 🎯 Objetivo

Implementar la capa de auditoría y el panel de administración Rewards Bolivia.

### 🧠 Historias de Usuario

| ID | Historia | Prioridad |
| --- | --- | --- |
| US15 | Como admin, quiero ver métricas globales del ecosistema. | Alta |
| US16 | Como sistema, quiero generar un hash diario de transacciones. | Crítica |
| US17 | Como auditor, quiero verificar el hash en blockchain. | Crítica |

### ✅ Criterios de Aceptación

- Hash diario registrado en Polygon/Hyperledger.
- Panel Admin con métricas globales y alertas.
- API pública `/audit/hash/:id`.

### 🧱 Tareas Técnicas

- [ ]  Crear `audit-service`.
- [ ]  Script batch diario (cronjob).
- [ ]  Integración con Polygon SDK (hash publish).
- [ ]  Panel Admin (Next.js / React Admin).
- [ ]  Métricas: emisión, redención, usuarios activos.
- [ ]  Endpoint público de verificación.

---

## 🧩 SPRINT 6 – Pruebas, Optimización y Despliegue (Semana 11–12)

### 🎯 Objetivo

Realizar pruebas integradas, optimización de performance y despliegue público piloto.

### 🧠 Historias de Usuario

| ID | Historia | Prioridad |
| --- | --- | --- |
| US18 | Como cliente, quiero usar la app sin errores ni esperas excesivas. | Crítica |
| US19 | Como negocio, quiero operar campañas y ver resultados en tiempo real. | Alta |
| US20 | Como admin, quiero monitorear el sistema y recibir alertas automáticas. | Alta |

### ✅ Criterios de Aceptación

- ≥ 98% de transacciones exitosas.
- Latencia < 1.5 s.
- Logs de errores centralizados.
- MVP estable para piloto en 2 ciudades.

### 🧱 Tareas Técnicas

- [ ]  Pruebas unitarias (Jest) y de integración (Postman).
- [ ]  Configurar Prometheus + Grafana.
- [ ]  Implementar alertas (errores, latencia, fraude).
- [ ]  Testing de carga (k6).
- [ ]  Deploy canary (staging → prod).
- [ ]  Generar documentación API (Swagger / Postman).

---

## 📊 KPI de Éxito Técnico

| Indicador | Objetivo | Fuente |
| --- | --- | --- |
| Tiempo medio QR → confirmación | ≤ 1.5 s | Prometheus |
| % éxito transacciones | ≥ 98 % | Logs / Datadog |
| Uptime sistema | ≥ 99.9 % | Status page |
| Bugs críticos en piloto | ≤ 3 | QA report |
| Latencia API promedio | ≤ 200 ms | Grafana |
| Retención usuario día 7 | ≥ 40% | Firebase Analytics |

---

## 🧱 Resumen de Arquitectura Final MVP

[Cliente App (Flutter)] ↔ [API Gateway (NestJS)] ↔ [Microservicios: Auth / Transactions / Business / Audit]
↓
[DB Off-chain (PostgreSQL + Redis)]
↓
[Blockchain Audit (Polygon PoS)]
[Dashboard Negocios] ↔ [Microservicio Business]
[Panel Admin Rewards] ↔ [Microservicio Audit]

yaml
Copy code

---

## 📦 Entregables Finales MVP

1. App móvil (Android/iOS) funcional con QR y balance.
2. Dashboard web de negocios con métricas y campañas.
3. Backend escalable (microservicios + auditoría).
4. Portal de auditoría blockchain con hashes públicos.
5. Documentación técnica + manual de uso.

---

> 🧠 Nota estratégica (CEO):
> 
> 
> Este backlog no solo construye una app: construye la infraestructura digital de confianza para el comercio boliviano.
> 
> Cada sprint entrega valor tangible que puede demostrarse, probarse y escalar regionalmente.
> 

---

# Sprints

[15. Backlog Técnico (Sprints)](14%20Backlog%20T%C3%A9cnico/15%20Backlog%20T%C3%A9cnico%20(Sprints)%202987583cfef7801d9d59fda31dd3fb84.md)