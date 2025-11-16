# 09. Documentación de Ejemplos y Tablas

> Propósito:
> 
> 
> Establecer una guía técnica y contable clara que permita verificar el correcto funcionamiento del sistema Rewards Bolivia en su MVP y durante las primeras fases operativas.
> 

> Objetivo adicional:
> 
> 
> Servir como base para auditorías, pruebas de QA Automation, y visualizaciones de datos en dashboards analíticos.
> 

---

## 🧾 1. Ejemplo de Flujo Diario de Tokens

| Hora | Evento | Actor | Entrada de Puntos | Salida de Puntos | Balance Cliente | Balance Negocio | Tipo de Transacción |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 08:30 | Compra desayuno (Bs 20) | Cliente A | +20 | — | 20 | -20 | Emisión |
| 09:15 | Compra café (Bs 30) | Cliente B | +30 | — | 30 | -30 | Emisión |
| 12:10 | Cliente A redime 10 pts | Cliente A / Café Aroma | -10 | +10 | 10 | +10 | Redención |
| 13:00 | Campaña doble puntos | Negocio | +20 (x2) | — | 30 | -20 | Promoción |
| 16:40 | Cliente C transfiere 5 pts a Cliente D | Cliente C → D | -5 | +5 | C: 15 / D: 5 | — | Transferencia |
| 20:00 | Expiran puntos promocionales (3 meses) | Sistema | - | -40 | — | — | Expiración programada |
| 21:00 | Auditoría diaria (hash on-chain) | Sistema | — | — | — | — | Batch Settlement |

**Interpretación:**

- Cada día genera un **ledger** de operaciones off-chain con snapshot on-chain.
- Los negocios pueden consultar su **saldo de puntos redimidos** y **emitidos** en tiempo real.
- Los clientes visualizan su flujo simplificado: ganados, usados, expirados.

💡 *Mejor práctica internacional:*

Basado en el modelo “daily ledger + batch audit” de **WeChat Pay Rewards** y **Rakuten Super Points**, donde cada día se consolida una operación contable completa con hash público para trazabilidad.

---

## 🏪 2. Tabla de Emisión y Redención por Plan de Negocio

| Plan | Costo Mensual | Puntos Incluidos | Valor Contable (Bs) | Precio Unitario | Ratio Sugerido (Pts/Bs Gastado) | Redención Máx. Ticket | Características |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Starter** | Gratis | 250 | 7.50 | 0.03 | 1 por Bs 10 | 20% | Puntos bloqueados hasta upgrade |
| **Básico** | 50 Bs | 1,000 | 30.00 | 0.03 | 1 por Bs 10 | 25% | Acceso a estadísticas básicas |
| **Pro** | 150 Bs | 3,000 | 90.00 | 0.03 | 2 por Bs 10 | 30% | Campañas promocionales automáticas |
| **Premium** | 300 Bs | 5,000 | 150.00 | 0.03 (0.025 al recargar) | 2–3 por Bs 10 | 30% | API avanzada, integración POS y visibilidad destacada |

💡 **Insights:**

- El costo contable se mantiene constante (0.03 Bs/pt), asegurando control financiero.
- Los planes más altos reducen el precio unitario y aumentan la flexibilidad de campañas.
- El **valor percibido** por el negocio aumenta con las herramientas de visibilidad y fidelización.

📈 *Benchmark:*

Este modelo replica la lógica de escalabilidad usada por **Square Loyalty**, **Shopify Rewards** y **Klarna Engage**: cuanto más engagement genera el comercio, más eficiente es su costo de adquisición de cliente (CAC).

---

## 🧪 3. Casos de Prueba MVP (QA Funcional y Económico)

> Estos casos aseguran que el MVP cumple los requerimientos básicos de estabilidad, precisión contable y experiencia fluida para cliente y negocio.
> 

| ID | Caso de Prueba | Descripción | Entrada Esperada | Resultado Esperado | Estado |
| --- | --- | --- | --- | --- | --- |
| TC-001 | Emisión estándar | Cliente compra Bs 50 → ratio 1:1 | 50 Bs | +50 puntos cliente / -50 puntos negocio | ✅ |
| TC-002 | Redención parcial | Cliente usa 20 pts (Bs 0.60) | 20 pts | -20 cliente / +20 negocio / descuento aplicado | ✅ |
| TC-003 | Expiración automática | Puntos 12 meses sin uso | — | Eliminados del balance y ledger actualizado | ✅ |
| TC-004 | Transferencia entre clientes | C → D (10 pts) | 10 pts | -10 / +10, log contable correcto | ✅ |
| TC-005 | Redención límite de ticket | 30% del valor | Ticket Bs 100 → máx 30 pts | Validación y rechazo si excede límite | ✅ |
| TC-006 | Campaña doble puntos | x2 durante ventana horaria | Compra Bs 10 → 20 pts | Emisión duplicada dentro del rango | ✅ |
| TC-007 | Anulación de compra | Redención revertida | Compra devuelta | Puntos restaurados automáticamente | ✅ |
| TC-008 | Auditoría on-chain | Hash diario verificado | Batch 24h | Registro en blockchain con hash verificable | ✅ |

💡 **QA Best Practice:**

Cada caso puede transformarse en test automatizado con frameworks tipo **RestAssured + TestNG (API)** y **Playwright (UI)** para asegurar consistencia en releases.

---

## 📊 4. Ejemplo de Consolidación Semanal (Backoffice)

| Semana | Puntos Emitidos | Puntos Redimidos | Puntos Expirados | Puntos Activos | % Redención | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 25,000 | 8,000 | 0 | 17,000 | 32% | Lanzamiento MVP |
| 2 | 29,000 | 9,500 | 200 | 19,300 | 33% | Alta adopción Starter |
| 3 | 33,000 | 10,200 | 1,000 | 21,800 | 31% | Activación Plan Básico |
| 4 | 37,500 | 12,800 | 500 | 24,200 | 34% | Inicio campañas doble puntos |

📈 **Indicadores derivados:**

- Ratio Emisión/Redención saludable (≈30–35%).
- Puntos expirados controlados (<5%).
- Crecimiento orgánico del 10–15% semanal.

---

## 🧮 5. Fórmulas Contables Simplificadas

| Concepto | Fórmula | Descripción |
| --- | --- | --- |
| **Valor contable de puntos emitidos** | `Puntos × 0.03 Bs` | Define el pasivo potencial |
| **Puntos activos** | `Emitidos - (Redimidos + Expirados)` | Base de circulación |
| **Tasa de redención** | `(Redimidos / Emitidos) × 100` | Mide liquidez del sistema |
| **Balance neto del negocio** | `Puntos recibidos - Puntos emitidos` | Determina uso y ROI del plan |
| **Valor redimido total** | `Puntos redimidos × 0.03 Bs` | Descuento económico aplicado al cliente |

💡 *Inspirado en modelos de contabilidad digital de Mastercard y Revolut Loyalty Accounting Standards.*

---

## 🧱 6. Recomendaciones para Escalabilidad de Datos

- Implementar **ETL diario** con snapshots históricos.
- Usar **identificadores UUID** únicos por punto emitido/redimido (como NFT sin exposición pública).
- Guardar todas las operaciones en un **Data Lake** (ex: BigQuery o Snowflake) con partición por día y tipo de transacción.
- Dashboard de BI con **indicadores de salud (emisión, redención, expiración)** visibles para admins y partners.
- Mantener auditorías en **formato hash (SHA256)** para validar consistencia sin sobrecargar blockchain.

---