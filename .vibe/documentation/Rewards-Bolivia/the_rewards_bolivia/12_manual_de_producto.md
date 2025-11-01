# 12. Manual de Producto

> Versión: v1.0
> 
> 
> **Propósito:** Documento integral que define la visión, funcionamiento, economía, arquitectura, gobernanza y requerimientos del ecosistema **Rewards Bolivia**.
> 
> **Destinatarios:** Equipo de producto, desarrollo, operaciones, partners y auditores.
> 

---

## 🧭 1. Visión General del Producto

### 🔹 Nombre del Producto

**Rewards Bolivia**

### 🔹 Objetivo

Crear un **ecosistema de fidelización local** que:

- Incentive a los clientes a comprar en negocios bolivianos mediante **puntos de recompensa**.
- Permita a los negocios **fidelizar sin perder valor**, con un sistema híbrido **off-chain / on-chain**.
- Ofrezca una experiencia **simple, gamificada e intuitiva**, mientras la tecnología blockchain se mantiene **oculta** (solo para auditoría y trazabilidad).

### 🔹 Propuesta de Valor

### Para Clientes

- Acumular puntos en compras reales.
- Redimir puntos en cualquier comercio afiliado.
- Gamificación: niveles, badges, retos.
- Transferencias simbólicas a amigos.

### Para Negocios

- Modelo híbrido de puntos (limitados + ilimitados).
- Dashboard con analítica y ROI en tiempo real.
- Redistribución de puntos como herramienta de marketing.
- Integración simple mediante QR o API.

### Para el Ecosistema

- Balance económico autosostenible.
- Auditoría blockchain como garantía de confianza.
- Arquitectura escalable y modular.

---

## 🔄 2. Flujos de Usuario y Negocio

### 🧍‍♀️ Cliente: “El Viaje del Usuario”

1. Compra → recibe tokens instantáneamente.
2. Redime puntos en cualquier negocio.
3. Visualiza su balance e historial tipo timeline.
4. (Opcional) Envía puntos simbólicos a amigos.

### 🏪 Negocio: “El Motor del Ecosistema”

1. Emite puntos desde su dashboard o QR.
2. Recibe puntos redimidos y los reutiliza.
3. Crea campañas promocionales (doble puntos, horarios).
4. Visualiza estadísticas y ROI en tiempo real.

### 🧩 Mapa Simplificado

```jsx
[Cliente compra] → [Negocio emite tokens] → [Cliente acumula y redime]
↓ ↑
[Cliente redime tokens] ← [Negocio recibe tokens / crea campañas]

```

---

## 💰 3. Economía de Puntos y Reglas

### ⚙️ Principios

| Principio | Descripción | Beneficio |
| --- | --- | --- |
| Valor estable | 1 punto = Bs 0.03 | Evita inflación del sistema |
| Círculo cerrado | Solo flujo interno (cliente ↔ negocio ↔ Rewards) | Control contable |
| Conversión limitada | Sin cambio a dinero real | Protección legal |
| Recompensa instantánea | Emisión/redención en segundos | Refuerzo emocional |
| Auditoría transparente | Registro auditable híbrido | Confianza institucional |

### 💰 Emisión

- Fuentes: planes de suscripción, paquetes extra, promociones.
- Costo contable: Bs 0.03 por punto (promedio).
- Puntos no usados en el mes caducan (excepto plan Premium).

### 🎁 Redención

- 1 punto = Bs 0.03 de descuento.
- Redención máxima: 20–30% del ticket.
- Negocio recibe los puntos → puede reutilizarlos.

### ⏳ Expiración

| Tipo | Expira | Regla |
| --- | --- | --- |
| Starter Pack | ❌ | Hasta activar plan pago |
| Puntos normales | ✅ | 12 meses |
| Promocionales | ✅ | 3–6 meses |
| Comprados | ✅ | 12 meses |

### 📊 Indicadores Económicos

| Indicador | Meta |
| --- | --- |
| Tasa de redención | 25–45% |
| Conversión Starter → Plan pago | ≥ 40% |
| Pasivo digital controlado | ≤ 80% puntos activos |
| Valor promedio por punto | 0.03 Bs |

---

## 🧱 4. Roles y Permisos

### 👥 Roles

| Rol | Descripción | Nivel |
| --- | --- | --- |
| Cliente | Usuario final de la app | Bajo |
| Cajero | Operador POS | Medio-bajo |
| Admin Negocio | Controla dashboard, campañas | Medio-alto |
| Admin Rewards | Supervisa todo el ecosistema | Alto |
| Auditor | Lectura de datos de auditoría | Lectura |

### 🔐 Permisos (Resumen)

| Acción | Cliente | Cajero | Admin Negocio | Admin Rewards | Auditor |
| --- | --- | --- | --- | --- | --- |
| Ver saldo propio | ✅ | ⛔ | ✅ | ✅ | ✅ |
| Emitir puntos | ⛔ | ✅ | ✅ | ✅ | ⛔ |
| Redimir puntos | ✅ | ✅ | ✅ | ✅ | ⛔ |
| Crear campañas | ⛔ | ⛔ | ✅ | ✅ | ⛔ |
| Auditoría blockchain | ⛔ | ⛔ | ⛔ | ✅ | ✅ |

> Sistema de roles basado en RBAC + JWT Claims.
> 
> 
> Logs de acceso inmutables y auditables.
> 

---

## 🔗 5. Integraciones Externas

### POS y Sistemas Comerciales

- API REST Rewards (`/emit`, `/redeem`)
- SDK JavaScript para WooCommerce / Shopify / TiendaNube
- Plugin Rewards Bolivia para POS nacionales

### Pasarelas de Pago

- Stripe / MercadoPago / Khipu
- Webhooks automáticos para cobro y renovación de planes

### Analítica y Comunicación

- BigQuery / ClickHouse para data lake
- Firebase / OneSignal para notificaciones push
- GA4 / Mixpanel para análisis de comportamiento

### Blockchain Auditoría

- Polygon PoS o Hyperledger Fabric
- Batch diario:

```json
{
  "date": "2025-10-26",
  "hash": "0xabc123",
  "txCount": 13450
}
```

---

## ⚙️ 6. Requerimientos No Funcionales (NFRs)

| Categoría | Requisito | Meta |
| --- | --- | --- |
| **Disponibilidad** | Uptime API | ≥ 99.9% |
| **Rendimiento** | QR → confirmación | ≤ 1.5 s |
| **Seguridad** | TLS 1.3 / AES-256 / JWT | Requerido |
| **Escalabilidad** | 5.000 tx/min MVP | Escalable |
| **Legal** | Cumplimiento GDPR + Ley 164 | Obligatorio |
| **Observabilidad** | Logs, métricas, alertas | Integrado |

Infraestructura:

- Docker + Kubernetes
- CI/CD (GitHub Actions)
- Logs centralizados (ELK / Datadog)
- Monitoreo: Prometheus + Grafana

---

## 🎨 7. UX/UI Reference Guide

### 🎯 Filosofía

> “Sencillez visual, emoción humana, confianza digital.”
> 

El usuario no debe sentir que usa blockchain; debe sentir **recompensa, progreso y pertenencia.**

### App Cliente (Wireframes conceptuales)

- **Inicio:** saldo animado + botón “Escanear QR”.
- **Historial:** lista tipo timeline con íconos.
- **Transferencias:** envíos simbólicos.
- **Perfil:** niveles, badges, métricas personales.

### Dashboard Negocio

- **Inicio:** métricas de día y semana.
- **Campañas:** creación en 2 pasos.
- **Analítica:** ROI, clientes activos, gráficos.
- **Configuración:** roles, límites, sucursales.

### Identidad Visual

- **Colores:** Verde esperanza (#1EB980), Dorado (#F2C94C), Blanco (#F5F5F5).
- **Tipografía:** Poppins / Nunito Sans.
- **Estilo:** minimalista, con animaciones suaves y tono local.

---

## 🏛️ 8. Gobernanza y Auditoría

### 🧩 Capas de Gobernanza

| Nivel | Actor | Función |
| --- | --- | --- |
| Rewards Bolivia | Define políticas y controla emisión | Estratégico |
| Negocios Afiliados | Emiten/redimen bajo normas | Operativo |
| Auditores Internos | Supervisan balances | Control |
| Auditoría Externa | Verifica hashes en blockchain | Transparencia |

### 🔗 Auditoría Híbrida

1. Transacciones off-chain → PostgreSQL.
2. Batch diario → snapshot hash.
3. Publicación on-chain.
4. Portal público: [auditor.rewards.bo](12%20Manual%20de%20Producto%202987583cfef780de8b16c3dd65bee1b2.md)

### 🧭 Comité de Gobernanza

Miembros:

- Rewards Bolivia (CEO / CTO)
- Negocios afiliados top
- Auditores independientes
- Expertos legales / fintech

Funciones:

- Validar políticas económicas.
- Supervisar pasivo digital.
- Aprobar integraciones y cambios estructurales.

### 📈 Indicadores de Transparencia

| Indicador | Frecuencia | Publicación |
| --- | --- | --- |
| Emisión total mensual | Mensual | Portal público |
| Ratio de redención | Mensual | Dashboard |
| Hash de auditoría | Diario | Blockchain Explorer |

### ⚖️ Principios Éticos

- Neutralidad financiera.
- Transparencia proactiva.
- Protección de usuarios y comercios.
- Impacto local y desarrollo sostenible.

---

## 🚀 9. MVP – Funcionalidades Iniciales

1. **QR Universal (emisión/redención)**
2. **App Cliente (Android/iOS)**
3. **Dashboard Web para Negocios**
4. **Base de Datos Off-chain (PostgreSQL + Redis)**
5. **Blockchain Oculta (Auditoría diaria)**

### Valor Estratégico

| Stakeholder | Día 1 | Mediano plazo |
| --- | --- | --- |
| Cliente | UX fluida, recompensas visibles | Reputación y nivel digital |
| Negocio | Métricas y marketing simple | Fidelización con IA |
| Ecosistema | Tracción y datos reales | DAO regional / expansión LATAM |

---

## 🧩 10. Métricas Globales de Éxito

| KPI | Meta |
| --- | --- |
| % transacciones exitosas | ≥ 98% |
| Latencia media | ≤ 1.5 s |
| Ratio redención | 25–45% |
| Negocios activos / mes | ≥ 70% |
| Conversión Starter → Pago | ≥ 40% |
| Satisfacción usuario (NPS) | ≥ 75 |

---