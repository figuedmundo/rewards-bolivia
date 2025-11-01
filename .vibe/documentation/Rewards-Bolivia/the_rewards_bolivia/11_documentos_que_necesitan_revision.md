# 11. Documentos que necesitan revision

# 🧱 3️⃣ Roles y Permisos

*(Sistema de acceso, seguridad y responsabilidad)*

## 💡 Propósito

Definir claramente qué puede ver, hacer y administrar cada tipo de usuario dentro del ecosistema Rewards Bolivia, garantizando **seguridad**, **claridad operativa**, y **flujo de autoridad controlado**.

---

## 👤 1. Roles principales

| Rol | Descripción general | Nivel de acceso |
| --- | --- | --- |
| **Cliente** | Persona que usa la app Rewards para acumular, redimir y transferir puntos. | Bajo |
| **Negocio** | Propietario o representante de un comercio afiliado. | Medio |
| **Cajero / Operador POS** | Empleado autorizado por un negocio para emitir/redimir puntos. | Medio-Bajo |
| **Administrador de Negocio** | Usuario con acceso total al dashboard, campañas, métricas y configuración de sucursales. | Alto (solo dentro del negocio) |
| **Administrador Rewards Bolivia** | Equipo central que gestiona el ecosistema, planes, auditoría y soporte. | Muy Alto |
| **Auditor / Regulador (externo)** | Entidad o agente que revisa la trazabilidad del sistema. | Lectura (sólo lectura auditable) |

---

## 🔒 2. Matriz de permisos (resumen)

| Acción / Módulo | Cliente | Cajero | Admin Negocio | Admin Rewards | Auditor |
| --- | --- | --- | --- | --- | --- |
| Ver balance y transacciones propias | ✅ | ⛔ | ✅ | ✅ | ✅ |
| Emitir puntos | ⛔ | ✅ | ✅ | ✅ | ⛔ |
| Redimir puntos | ✅ | ✅ | ✅ | ✅ | ⛔ |
| Transferir puntos | ⚠️ *(solo Starter/Promo)* | ⛔ | ⛔ | ✅ *(modo test)* | ⛔ |
| Crear campañas | ⛔ | ⛔ | ✅ | ✅ | ⛔ |
| Ver estadísticas y analíticas | ✅ *(personales)* | ⛔ | ✅ | ✅ | ✅ *(anónimas)* |
| Gestionar usuarios / sucursales | ⛔ | ⛔ | ✅ | ✅ | ⛔ |
| Auditoría blockchain / hash logs | ⛔ | ⛔ | ⛔ | ✅ | ✅ |
| Modificar reglas de puntos | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |

> ⚙️ Los permisos se gestionan con JWT Claims y Roles RBAC, integrados en el User Service.
> 

---

## 🧠 3. Mejores prácticas aplicadas

- **Principio de menor privilegio** → cada actor solo accede a lo que necesita.
- **Seguridad basada en roles (RBAC)** + **atributos (ABAC)** para mayor granularidad.
- **Separación de ambientes** (producción, staging, auditoría).
- **Autenticación federada** (Google, Apple, correo) para reducir fricción.
- **Logs inmutables de acceso** → auditoría de quién hizo qué y cuándo.

---

# 🔗 4️⃣ Integraciones Externas

*(Conectividad y ecosistema ampliado)*

## 💡 Propósito

Permitir que Rewards Bolivia se integre con sistemas de terceros de forma segura, modular y escalable — potenciando el valor de la plataforma y facilitando adopción masiva.

---

## 🌐 1. POS y sistemas comerciales

| Tipo | Integración sugerida | Ejemplo / API |
| --- | --- | --- |
| **POS tradicionales** | API REST Rewards (emitir/redimir puntos) | POST `/api/v1/pos/emit` / `/redeem` |
| **POS modernos (API-based)** | Webhook + SDK Rewards | Plugin Rewards Bolivia para POS nacionales |
| **Tiendas online** | SDK Rewards (JavaScript/REST) | Integración con WooCommerce, Shopify, TiendaNube |
| **Apps de delivery** | API Partner Rewards | Bonos automáticos por consumo vía API |

---

## 💰 2. Pasarelas de pago

- **Integración opcional** con Stripe, MercadoPago o Khipu para cobro de planes de suscripción.
- Tokenización PCI-DSS, sin retener datos de tarjeta en el backend.
- Webhooks automáticos para renovar planes, generar facturas y emitir puntos de bonificación.

---

## 📊 3. Analítica y comunicación

- **BigQuery / ClickHouse** → almacenamiento de eventos para analítica avanzada.
- **Firebase Cloud Messaging / OneSignal** → notificaciones push segmentadas.
- **Mailgun / SendGrid** → comunicación transaccional y campañas.
- **Google Analytics 4 / Mixpanel** → funnels y cohortes de retención.

---

## 🪶 4. Blockchain (auditoría)

- **Polygon PoS** o **Hyperledger Fabric** según fase de despliegue.
- Integración mediante microservicio `audit-service`, con publicación de batch diario:
    
    ```json
    {
      "date": "2025-10-26",
      "hash": "0xabc123...",
      "txCount": 13245
    }
    
    ```
    
- API pública para validación (`GET /api/audit/:hash`).

---

## 🧱 5. Mejores prácticas

- **API-first Architecture.**
- **OAuth2 / JWT** para integraciones seguras.
- **Rate limits** y **API keys rotativas.**
- **Webhooks verificados por firma digital.**
- **OpenAPI / Swagger docs** para partners.

---

# ⚙️ 5️⃣ Requerimientos No Funcionales (NFRs)

## 💡 Propósito

Asegurar que Rewards Bolivia sea **rápido, confiable, seguro y escalable**, garantizando la calidad técnica y la confianza del ecosistema.

---

## 🚀 1. Rendimiento y disponibilidad

| Métrica | Objetivo | Descripción |
| --- | --- | --- |
| **Uptime API** | ≥ 99.9 % | Alta disponibilidad (multi-zone). |
| **Latencia QR → confirmación** | ≤ 1.5 s | Experiencia instantánea tipo fintech. |
| **Throughput máximo** | 5.000 tx/min | Capacidad inicial del MVP. |
| **Tiempo medio de recuperación (MTTR)** | < 10 min | Infraestructura resiliente. |

---

## 🔒 2. Seguridad

- Cifrado **TLS 1.3 / AES-256**.
- **JWT tokens** con rotación automática.
- **Rate limiting y detección de fraude** por IA.
- **Zero Trust Architecture** entre microservicios.
- Cumplimiento **GDPR + Ley 164 (Bolivia)**.

---

## 🧩 3. Escalabilidad y mantenibilidad

- Microservicios desacoplados (Docker / Kubernetes).
- CI/CD automatizado (GitHub Actions + Canary deploys).
- Infraestructura como código (Terraform).
- Logs centralizados (ELK Stack / Datadog).

---

## 🧠 4. Observabilidad y métricas

- **Prometheus + Grafana** → performance.
- **Sentry** → errores front/backend.
- **Datadog APM** → tiempos de respuesta.
- Alertas automáticas por SLA.

---

## 🧾 5. Legal y compliance

- Políticas de privacidad visibles en app.
- Protección de datos sensibles.
- Contrato marco con negocios afiliados.
- Auditorías semestrales de seguridad.

---

# 🎨 6️⃣ UX/UI Reference Guide

*(Diseño emocional y experiencia de confianza)*

## 💡 Filosofía de diseño

> “Sencillez visual, emoción humana, confianza digital.”
> 

El usuario no debe sentir que usa blockchain ni una fintech, sino una app **amistosa, local y gratificante**.

---

## 🎯 1. Principios UX

| Principio | Ejemplo | Resultado |
| --- | --- | --- |
| **Recompensa inmediata** | Animación “+50 puntos ☕” | Dopamina visual positiva |
| **Claridad económica** | Mostrar equivalencia Bs ↔ puntos en canje | Entendimiento instantáneo |
| **Gamificación natural** | Niveles (Bronze, Silver, Gold), badges por hábitos | Engagement sostenido |
| **Fricción mínima** | QR universal y validación automática | UX fluida y confiable |
| **Cultura local** | Íconos, colores, frases bolivianas | Identidad nacional fuerte |

---

## 📱 2. Wireframes (referencia textual)

### App Cliente

- **Pantalla Inicio:** saldo animado + botón “Escanear QR”.
- **Historial:** lista tipo timeline (+ puntos, - puntos, fecha, comercio).
- **Transferencias:** “Enviar” y “Recibir” tokens (solo promo).
- **Perfil:** nivel actual, badges, métricas personales.

### Dashboard Negocio

- **Inicio:** resumen diario (emitidos, redimidos, ROI).
- **Campañas:** creación simple (doble puntos, referidos, horarios).
- **Analítica:** gráficos dinámicos, exportar CSV/PDF.
- **Configuración:** sucursales, roles, límites de puntos.

---

## 🎨 3. Identidad visual

- **Colores:**
    - Verde esperanza (#1EB980) → crecimiento, confianza.
    - Dorado (#F2C94C) → valor y recompensa.
    - Blanco/Gris (#F5F5F5) → simplicidad moderna.
- **Tipografía:** Poppins / Nunito Sans.
- **Estilo:** minimalista, con ilustraciones locales y animaciones suaves (Framer Motion).

---

# 🏛️ 7️⃣ Gobernanza y Auditoría

## 💡 Propósito

Establecer la estructura de control, supervisión y transparencia que garantiza la sostenibilidad económica, la confianza de los usuarios y la integridad contable del sistema.

---

## 🧩 1. Capas de gobernanza

| Nivel | Rol | Responsabilidad |
| --- | --- | --- |
| **Rewards Bolivia (Operador)** | Define políticas, gestiona planes y supervisa emisión global. | Control contable y estratégico. |
| **Negocios afiliados** | Emiten y redimen puntos bajo reglas establecidas. | Responsabilidad operativa. |
| **Auditores internos** | Revisan balances, expiración y tasas de redención. | Control de riesgo. |
| **Auditoría externa / Blockchain** | Verifica integridad de hashes y balances. | Transparencia pública. |

---

## 🔗 2. Mecanismo de auditoría híbrida

1. **Transacciones Off-chain** → almacenadas en base PostgreSQL.
2. **Batch diario** → genera snapshot hash.
3. **Publicación on-chain (Polygon/Hyperledger)**.
4. **Panel público de auditoría** (auditor.rewards.bo).

Ejemplo:

```
Fecha: 2025-10-26
Hash: 0x9a7ef...
Total Tx: 12,342
Emitidos: 45,000 pts
Redimidos: 30,100 pts

```

---

## 🛡️ 3. Comité de gobernanza

- Representantes de:
    - Rewards Bolivia (operador)
    - Negocios afiliados top
    - Auditores independientes
    - Expertos legales / fintech
- Funciones:
    - Validar cambios de política económica.
    - Supervisar control de pasivo digital.
    - Aprobar expansiones o integraciones.

---

## 📈 4. Métricas de transparencia

| Indicador | Frecuencia | Publicación |
| --- | --- | --- |
| Emisión total mensual | Mensual | Portal auditor.rewards.bo |
| Ratio de redención | Mensual | Dashboard público |
| Puntos expirados | Trimestral | Reporte contable |
| Hash de auditoría | Diario | Blockchain Explorer |

---

## 🧭 5. Principios éticos

- **Neutralidad financiera:** Rewards Bolivia no especula con los puntos.
- **Transparencia proactiva:** cada dato relevante es auditable.
- **Protección del usuario:** datos y saldos siempre bajo cifrado.
- **Impacto local:** priorizar comercios bolivianos y economía circular.