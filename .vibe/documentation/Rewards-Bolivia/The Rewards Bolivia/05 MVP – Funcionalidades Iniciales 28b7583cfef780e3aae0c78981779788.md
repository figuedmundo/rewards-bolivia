# 05. MVP – Funcionalidades Iniciales

*(Primera versión con impacto inmediato y arquitectura preparada para escalar)*

El MVP debe demostrar **valor tangible desde el día 1**, tanto para el **cliente final** como para los **negocios afiliados**, sin requerir que entiendan blockchain.

La clave: **experiencia fluida, instantánea y confiable**, respaldada por una **infraestructura híbrida (off-chain + blockchain)**.

---

### 1️⃣ QR Code Universal (Emisión y Redención de Tokens)

### 🎯 Propósito:

Hacer que cada transacción de puntos sea **tan fácil como escanear un QR**, eliminando fricción tanto para clientes como para negocios.

### 💡 Best Practices:

- **Inspiración:** Starbucks App, WeChat Pay, MercadoPago.
- **Diseño UX:**
    - QR dinámico por transacción (válido 60 segundos, para seguridad).
    - Escaneo instantáneo por ambas partes (negocio o cliente).
    - Feedback visual inmediato: ✅ “+50 Tokens” / 🎁 “Canje exitoso”.
- **Seguridad:**
    - Tokens y transacciones firmadas digitalmente (HMAC o JWT).
    - Prevención de doble uso con timestamps y locks temporales.

### 🔧 Backend:

- API Gateway → microservicio `transactions` → registro off-chain.
- Auditoría on-chain cada 24h (batch settlement).

### 🧩 Resultado:

✅ El QR Code convierte cada interacción comercial en una **transacción de valor emocional y económico.**

---

### 2️⃣ App Móvil (Cliente Final)

### 🎯 Propósito:

Convertir la fidelización en una experiencia placentera y gamificada: **ver crecer tu saldo es sentir recompensa real.**

### 💡 Best Practices:

- **Inspiración:** Revolut, Sweatcoin, Starbucks, Apple Wallet.
- **Diseño UI:**
    - Tarjeta digital con saldo visual animado (tokens suben o bajan).
    - Historial tipo “timeline” con íconos y emociones (“☕ +15 puntos por tu café”).
    - Transferencias P2P con mensajes personalizados o stickers.
- **Gamificación:**
    - “Streaks” (bonos por visitas consecutivas).
    - “Niveles” (Bronze, Silver, Gold) con beneficios visibles.
    - “Challenges” sociales (“Gana 100 puntos invitando a un amigo”).
- **Notificaciones inteligentes:**
    - “Tienes 200 puntos a punto de expirar ☕”.
    - “Canjea tu desayuno gratis hoy en Café Bolivia.”

### 🔧 Infraestructura:

- Front-end Flutter / React Native.
- Auth federado (Google, Apple, email).
- Cache local + sincronización en tiempo real (Firebase o Supabase).

### 🧩 Resultado:

✅ El cliente **siente pertenencia y emoción**. Cada punto se vuelve una historia.

---

### 3️⃣ Dashboard Web (Negocios)

### 🎯 Propósito:

Proveer a los negocios de una herramienta de control y marketing que **demuestre retorno** sin esfuerzo.

### 💡 Best Practices:

- **Inspiración:** Shopify Dashboard, Meta Ads Manager, Binance Earn.
- **Diseño UX:**
    - Módulo “Emitir / Redimir Tokens” (con QR integrado).
    - Panel “Campañas Activas” con métricas en vivo.
    - Gráficas: nuevos clientes, tokens emitidos, tokens redimidos, ROI estimado.
    - Segmentación: edad, ubicación, frecuencia de visita.
- **Automatización:**
    - Campañas inteligentes (“Duplica puntos en horas bajas”).
    - Integración con POS y sistemas ERP vía API o plugin.
- **Gestión multi-sucursal** y usuarios con permisos diferenciados (gerente, cajero, analista).

### 🔧 Infraestructura:

- WebApp en React + backend en Node.js/NestJS.
- Integración directa con microservicios `loyalty`, `analytics` y `business`.

### 🧩 Resultado:

✅ El negocio **ve y entiende el valor** del sistema: más visitas, más ventas, más retención.

---

### 4️⃣ Base de Datos Off-chain (Velocidad y Escalabilidad)

### 🎯 Propósito:

Garantizar operaciones **instantáneas y sin fricción**, con auditoría garantizada.

### 💡 Best Practices:

- **Inspiración:** Coinbase, PolygonID, Layer-2 systems.
- **Diseño técnico:**
    - Base de datos transaccional (PostgreSQL o CockroachDB).
    - Ledger interno para balance de tokens (ACID + snapshots diarios).
    - Sincronización on-chain en bloques (batch settlements).
- **Ventajas:**
    - Costos mínimos.
    - UX fluida (sin esperas de blockchain).
    - Cumplimiento regulatorio al poder demostrar trazabilidad total.

### 🧩 Resultado:

✅ Los usuarios sienten inmediatez, y el sistema conserva la **transparencia y trazabilidad** que hace confiable a la Web3.

---

### 5️⃣ Blockchain Oculta (Auditoría y Settlement)

### 🎯 Propósito:

Usar blockchain como **garantía de integridad**, no como obstáculo de usabilidad.

### 💡 Best Practices:

- **Inspiración:** Polygon zkEVM, Optimism, Base.
- **Diseño técnico:**
    - Solo escritura on-chain de batch hashes (ej. cada 24h).
    - Smart contracts auditables para:
        - Emisión global de tokens.
        - Registro de redenciones.
        - Movimientos entre negocios.
    - API pública para auditores y reguladores.

### 🧩 Resultado:

✅ El ecosistema es **rápido como Web2** pero **tan confiable como Web3**.

---

### ⚙️ Arquitectura MVP – Overview

```
[Cliente App]  <->  [API Gateway]  <->  [Servicios: Users / Loyalty / Transactions]
                         |                    |
                    [Off-chain DB]       [Blockchain Layer]
                         |
                    [Dashboard Negocios]

```

---

### 💥 Valor Estratégico del MVP

| Stakeholder | Valor inmediato | Valor a mediano plazo |
| --- | --- | --- |
| **Cliente** | Experiencia fluida, recompensas visibles, transferencias fáciles. | Identidad y reputación digital (nivel, historial). |
| **Negocio** | Más tráfico, insights de clientes, marketing automatizado. | Fidelización inteligente con IA y campañas cooperativas. |
| **Ecosistema Rewards** | Tracción rápida y datos reales. | Base para tokenización avanzada, DAO y expansión regional. |

---