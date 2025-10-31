# 13. BRD Funcional Derivado

> Versión: 1.0
> 
> 
> **Origen:** Derivado del “Manual de Producto – Rewards Bolivia v1.0”
> 
> **Propósito:** Traducir la visión estratégica y los flujos definidos en requerimientos funcionales, casos de uso y criterios técnicos para construir el MVP.
> 
> **Ámbito:** MVP (etapa piloto: 2 ciudades, 1.000 usuarios, 50 negocios)
> 

---

## 🧭 1. Objetivos del Proyecto

- Lanzar el **ecosistema Rewards Bolivia MVP**, demostrando valor real para clientes y negocios.
- Validar la **economía circular de puntos (Bs 0.03 por punto)**.
- Garantizar una **experiencia instantánea, confiable y gamificada**.
- Establecer bases técnicas escalables (off-chain + blockchain audit).

---

## 👥 2. Actores del Sistema

| Actor | Descripción | Plataforma |
| --- | --- | --- |
| **Cliente** | Usuario final que acumula/redime puntos. | App móvil (iOS / Android) |
| **Negocio** | Comercio afiliado que emite y recibe puntos. | Dashboard Web / App QR |
| **Cajero** | Usuario autorizado dentro del negocio. | Panel POS |
| **Administrador Rewards** | Supervisa sistema y auditorías. | Panel interno |
| **Auditor externo** | Valida integridad de datos. | Portal público |

---

## 💡 3. Alcance Funcional del MVP

| Módulo | Incluido | Descripción breve |
| --- | --- | --- |
| Registro y autenticación | ✅ | Login social + email; roles dinámicos. |
| Emisión de puntos (QR) | ✅ | Generación, escaneo y registro instantáneo. |
| Redención de puntos | ✅ | Aplicación de descuento en tiempo real. |
| Transferencia simbólica entre clientes | ⚙️ | Activada solo en campañas. |
| Dashboard de negocio | ✅ | Emisión/redención, métricas y campañas. |
| Panel administrador Rewards | ✅ | Control, auditoría, planes. |
| Blockchain audit (off-chain → hash) | ✅ | Hash diario de operaciones. |
| Módulo campañas automáticas | ⚙️ | Beta posterior al MVP. |

---

## 🧩 4. Casos de Uso Funcionales (Resumen)

| ID | Caso de Uso | Actor principal | Descripción |
| --- | --- | --- | --- |
| CU01 | Registro y Login | Cliente / Negocio | Autenticación con email o cuenta social. |
| CU02 | Compra y Emisión de Puntos | Cliente / Negocio | Cliente escanea QR y recibe puntos instantáneamente. |
| CU03 | Redención de Puntos | Cliente / Negocio | Cliente usa puntos para obtener descuento. |
| CU04 | Visualización de Balance | Cliente | App muestra saldo, historial y animaciones. |
| CU05 | Creación de Campaña | Negocio | Negocio define promo (doble puntos, horarios, etc.). |
| CU06 | Transferencia simbólica | Cliente | Envío simbólico de puntos (limitado). |
| CU07 | Gestión de Roles y Permisos | Admin Rewards | Control de accesos y jerarquías. |
| CU08 | Auditoría y Hash Diario | Sistema / Admin Rewards | Publicación de snapshot hash on-chain. |
| CU09 | Métricas y Analítica | Negocio / Admin | Dashboards visuales, exportación CSV. |

---

## 🔧 5. Requerimientos Funcionales Detallados

### 🔹 5.1 Registro y Autenticación

- **RF-01:** El sistema debe permitir registro con Google, Apple ID o email/contraseña.
- **RF-02:** Los usuarios deben asignarse automáticamente a un rol (cliente, negocio, admin).
- **RF-03:** Debe existir recuperación de contraseña segura (token temporal).
- **RF-04:** Cada login genera un token JWT con expiración de 15 min.
- **RF-05:** Debe registrarse toda sesión iniciada en logs (fecha, IP, dispositivo).

---

### 🔹 5.2 Emisión de Puntos

- **RF-10:** El negocio podrá generar un QR dinámico por transacción.
- **RF-11:** El QR tendrá validez máxima de 60 segundos (anti-fraude).
- **RF-12:** Al escanearlo, el backend calculará puntos = monto × tasa del plan activo.
- **RF-13:** El cliente verá confirmación visual instantánea (“Has ganado +50 puntos”).
- **RF-14:** El backend registrará la operación en la DB off-chain con ID único.
- **RF-15:** El sistema debe bloquear reuso del mismo QR.

---

### 🔹 5.3 Redención de Puntos

- **RF-20:** El cliente puede seleccionar el monto de puntos a usar (mínimo 20).
- **RF-21:** El negocio confirma la redención antes de aplicarse.
- **RF-22:** Se aplicará un descuento máximo del 30% del ticket.
- **RF-23:** El negocio recibe esos puntos en su saldo interno.
- **RF-24:** El backend actualiza balances y genera hash de auditoría.
- **RF-25:** El cliente recibe notificación “Canje exitoso en [nombre negocio]”.

---

### 🔹 5.4 Dashboard del Negocio

- **RF-30:** Mostrar estadísticas: puntos emitidos, redimidos, ROI, visitas.
- **RF-31:** Permitir crear campañas con parámetros configurables.
- **RF-32:** Mostrar lista de clientes frecuentes (sin datos personales).
- **RF-33:** Exportar reportes a CSV o PDF.
- **RF-34:** Configurar usuarios internos (cajeros, analistas).

---

### 🔹 5.5 App Cliente

- **RF-40:** Mostrar saldo visual animado.
- **RF-41:** Timeline de movimientos (+/- puntos).
- **RF-42:** Escáner QR embebido.
- **RF-43:** Notificaciones push personalizadas (expiraciones, promos).
- **RF-44:** Visualización de badges y niveles.

---

### 🔹 5.6 Panel Administrador Rewards

- **RF-50:** Gestionar comercios, planes y suscripciones.
- **RF-51:** Revisar balances y auditoría contable.
- **RF-52:** Desplegar alertas de riesgo (emisión irregular, fraude).
- **RF-53:** Publicar hash diario de operaciones (on-chain).
- **RF-54:** Crear usuarios admin internos (seguridad de dos pasos).

---

### 🔹 5.7 Auditoría Blockchain

- **RF-60:** Generar snapshot diario consolidado de transacciones.
- **RF-61:** Publicar hash y resumen de conteo en Polygon/Hyperledger.
- **RF-62:** Proveer endpoint público para verificación (`GET /audit/hash/:id`).
- **RF-63:** Registrar auditoría en logs internos y archivo firmado digitalmente.

---

## ⚙️ 6. Requerimientos No Funcionales (Resumen)

| Categoría | Código | Requerimiento |
| --- | --- | --- |
| Seguridad | NFR-01 | Todos los datos viajan cifrados con TLS 1.3. |
| Rendimiento | NFR-02 | QR → Confirmación < 1.5 segundos. |
| Escalabilidad | NFR-03 | Microservicios desacoplados y autoescalables. |
| Legalidad | NFR-04 | Cumplimiento de Ley 164 (Protección de Datos Bolivia). |
| Disponibilidad | NFR-05 | Uptime mínimo 99.9%. |
| Observabilidad | NFR-06 | Logs centralizados, alertas y métricas (Grafana). |

---

## 🧠 7. Reglas de Negocio (RN)

| ID | Regla | Impacto |
| --- | --- | --- |
| RN-01 | 1 punto = Bs 0.03 (valor interno). | Base económica. |
| RN-02 | Máx. redención por compra = 30% del ticket. | Control financiero. |
| RN-03 | Puntos expiran a los 12 meses. | Balance contable. |
| RN-04 | Starter Pack no expira hasta plan pago. | Incentivo de conversión. |
| RN-05 | Transferencias P2P limitadas a campañas activas. | Prevención de abuso. |
| RN-06 | Hash diario obligatorio en blockchain. | Transparencia institucional. |

---

## 🧩 8. Requerimientos Técnicos (Infraestructura)

- **Backend:** Node.js / NestJS
- **Frontend Web:** React + Tailwind
- **App móvil:** Flutter (cross-platform)
- **DB principal:** PostgreSQL
- **Cache:** Redis
- **Blockchain Audit:** Polygon PoS / Hyperledger
- **Infraestructura:** Docker + Kubernetes
- **Monitoreo:** Prometheus + Grafana
- **CI/CD:** GitHub Actions + Canary Deploy

---

## 📱 9. Flujo de Datos Simplificado

```jsx
[Cliente App] → [API Gateway] → [Microservicio Transactions] → [DB Off-chain]
↓
[Audit Service → Blockchain]
[Dashboard Negocio] → [API Gateway] → [Microservicio Business]
```

---

## 🧾 10. Métricas de Éxito del MVP

| KPI | Objetivo |
| --- | --- |
| Latencia promedio | ≤ 1.5 s |
| % transacciones exitosas | ≥ 98% |
| Ratio redención | 25–45% |
| Negocios activos / mes | ≥ 70% |
| NPS (satisfacción cliente) | ≥ 75 |
| Conversión Starter → Pago | ≥ 40% |

---

## 🧱 11. Supuestos y Riesgos

### Supuestos

- Los negocios participantes tendrán conexión a internet estable.
- Los clientes usarán smartphones Android/iOS recientes.
- Los pagos de suscripción se procesarán mediante pasarelas certificadas.

### Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Baja adopción inicial | Incentivos Starter y campañas sociales. |
| Abuso o fraude | Límite de puntos, validación deviceID, logs. |
| Fallo en sincronización blockchain | Retry automático + hash de respaldo. |
| Costos de operación | Optimización de batch y uso off-chain. |

---

## 🚀 12. Roadmap del MVP (90 días)

| Semana | Hito | Entregable |
| --- | --- | --- |
| 1–2 | Setup infraestructura y CI/CD | Entorno cloud y repositorios |
| 3–4 | API Transactions + Auth | MVP backend básico |
| 5–6 | App Cliente (QR + balance) | Versión alfa |
| 7–8 | Dashboard Negocio (emisión/redención) | Versión beta |
| 9–10 | Auditoría blockchain + métricas | Piloto cerrado |
| 11–12 | Lanzamiento público en 2 ciudades | MVP oficial |

---

> 🧭 Resumen CEO:
> 
> 
> Este BRD funcional convierte la visión de Rewards Bolivia en un plan ejecutable, medible y escalable.
> 
> El MVP debe demostrar **fluidez de experiencia, integridad económica y confianza tecnológica**, con el propósito de fortalecer el comercio local y digitalizar la economía boliviana desde la base.
> 

---