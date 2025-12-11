# 03. Economía de Puntos y Reglas

## 💡 Propósito de esta sección

Definir el **modelo económico interno** que asegura que los puntos Rewards mantengan:

- valor percibido por el cliente,
- rentabilidad para los negocios,
- y sustentabilidad para Rewards Bolivia.

Este modelo combina principios de **economía circular**, **contabilidad digital** y **equilibrio financiero controlado**.

*(En Notion, esta página debe enlazarse con “Reglas de Puntos (Economía de Puntos)” y con “Modelo de Negocio y Monetización”).*

---

## ⚙️ 1. Principios de diseño económico

| Principio | Descripción | Beneficio |
| --- | --- | --- |
| **Valor estable** | 1 punto = Bs 0.03 (valor contable interno). | Evita inflación o devaluación del sistema. |
| **Círculo cerrado** | Los puntos solo circulan entre clientes ↔ negocios ↔ Rewards. | Control del flujo y del pasivo digital. |
| **Conversión limitada** | No hay conversión a dinero real. | Protección legal y contable. |
| **Recompensa instantánea** | Los puntos se entregan y redimen en segundos. | Refuerzo psicológico y hábito. |
| **Auditoría transparente** | Todas las transacciones quedan registradas en una base auditable. | Confianza para negocios y reguladores. |

---

## 🧮 2. Valor interno y referencia contable

- Cada punto tiene un **valor contable fijo de Bs 0.03**.
- Este valor no es visible para el usuario, pero se usa internamente para:
    - calcular balances,
    - medir circulación,
    - controlar riesgo de pasivo acumulado.

> 🎯 Objetivo financiero: mantener la proporción de puntos activos ≤ 80 % de los puntos emitidos (nivel saludable de circulación).
> 

- Valor contable: **1 punto = Bs 0.03** (no visible al usuario).
- Objetivo: mantener **% puntos activos ≤ 80%** del total emitido.

---

## 💰 3. Emisión de puntos (lado del negocio)

### 🔹 Fuentes de emisión

1. **Planes de suscripción** (mensualidad → incluye puntos preasignados).
2. **Compra de paquetes adicionales** a tarifa preferencial.
3. **Promociones especiales** (doble puntos, campañas, etc.).
4. **Regla de emisión dinámica**: `EconomicControlService` puede reducir automáticamente emisión promocional si la tasa de redención cae por debajo de umbral (configurable, default 25% en 30d).


### 🔹 Costos internos

| Tipo de emisión | Costo contable por punto | Observación |
| --- | --- | --- |
| Puntos incluidos en plan | 0.03 Bs | Valor estándar. |
| Puntos comprados extra | 0.025–0.03 Bs | Descuento según volumen. |
| Puntos promocionales | 0.00 Bs | Subvencionados por Rewards (por tiempo limitado). |

### 🔹 Expiración y control

- Los puntos no emitidos al final del mes **caducan automáticamente** (excepto en plan Premium).
- Esto mantiene un flujo económico saludable y evita acumulación pasiva.

---

## 🎁 4. Redención de puntos (lado del cliente)

### 🔹 Valor de redención

- 1 punto = Bs 0.03 de descuento sobre el consumo.
- Redención máxima por compra: **20 %–30 % del ticket** (configurable por el negocio).
- Mínimo para usar puntos: **20 puntos (≈ 0.60 Bs)**.

### 🔹 Flujo resumido

1. Cliente escanea QR del comercio.
2. Elige cuántos puntos usar.
3. Se aplica el descuento y se actualiza su saldo.
4. El negocio recibe esos puntos en su cuenta Rewards.

### 🔹 Efecto financiero

- El negocio **no pierde dinero directo**, porque los puntos redimidos pueden ser:
    - reutilizados (redistribuidos a otros clientes), o
    - liquidados en su cuenta de plan activo.

> 🔄 Resultado: el ecosistema mantiene circulación constante y valor estable.
> 

- 1 punto = Bs 0.03.
- Redención máxima configurable por negocio (20–30% del ticket).
- **Nuevo comportamiento:** al ejecutar una redención, se aplica un **burn fee** configurable (default 0.5%) que:
  - calcula `burnAmount = floor(pointsUsed * feeRate)`,
  - decrementa esos puntos del pool total (se registran como `BURN` en `PointLedger`),
  - reduce la cantidad de puntos que vuelven a la billetera del negocio en la misma proporción (para preservar contabilidad).

**Propósito:** desgastar ligeramente supply activo y desacoplar emisión ilimitada/promos del pasivo contable.


---

## ⏳ 5. Expiración de puntos

| Tipo de punto | Expira | Regla específica |
| --- | --- | --- |
| **Starter Pack** | ❌ No expira | Hasta activar un plan pago. |
| **Puntos normales** | ✅ 12 meses desde emisión | Ciclo estándar. |
| **Campañas promocionales** | ✅ 3–6 meses | Promueve rotación rápida. |
| **puntos promocionales** | ✅ 3–6 meses |(emisión con costo 0) al expirar se **eliminan (burn)** al 100% y deben registrarse como `EXPIRE` en `PointLedger`. |
| **Puntos comprados** | ✅ 12 meses | Según paquete. |
| **Clientes inactivos** | ✅ 18 meses sin actividad | Limpieza automática de cuentas. |

> 🧭 Razonamiento: la expiración mantiene el flujo económico vivo y reduce la carga contable.
> 


---

## 🔄 6. Transferencia y circulación

| Tipo de transferencia | Permitido | Motivo |
| --- | --- | --- |
| Cliente → Comercio | ✅ | Redención natural. |
| Comercio → Cliente | ✅ | Recompensa o campaña. |
| Cliente → Cliente | 🚫 | Evita especulación o abuso. |
| Comercio → Comercio | ⚠️ | Solo a través de clientes., solo a través de reglas controladas (API admin). |
| Starter → Cliente | ✅ | Permite experimentar el sistema. |

---

## 🧩 7. Control contable y auditoría

Rewards Bolivia mantiene un **sistema de doble registro contable digital**:

- **Off-chain:** base de datos operativa (transacciones rápidas).
- **On-chain (auditoría):** asentamiento periódico, inmutable y verificable.

Cada punto tiene:

- un ID único,
- trazabilidad completa,
- y un hash de auditoría pública.

> 🔐 Esto garantiza seguridad y transparencia sin requerir conocimientos técnicos del usuario o negocio.
> 

```md
- Doble registro:
  - **Off-chain:** DB operativa (fast reads/writes).
  - **On-chain (audit):** batch diario con hash SHA256 (incluye eventos EMIT, REDEEM, BURN, EXPIRE).
- Cada movimiento en `PointLedger` contiene:
  - `id` (UUID), `type` (EMIT/REDEEM/TRANSFER/BURN/EXPIRE), `amount`, `balanceBefore`, `balanceAfter`, `relatedTxId`, `timestamp`, `reason`, `hash`.
- `EconomicControlService` expone snapshot diario: emitidos, redimidos, expirados, quemados.
```

---

## 📈 8. Indicadores clave de salud económica

| Indicador | Definición | Meta |
| --- | --- | --- |
| **Tasa de emisión** | Puntos generados mensualmente | Crecimiento ≥ 10 % mensual |
| **Tasa de redención** | % de puntos efectivamente usados | 25 %–45 % |
| **Conversión Starter → Plan pago** | Negocios que pasan al plan pago tras usar Starter | ≥ 40 % después de 2 meses |
| **Pasivo digital controlado** | % de puntos activos sobre puntos emitidos | ≤ 80 % |
| **Valor promedio por punto** | Relación Bs / punto redimido | 0.03 constante |

Formulas

| Indicador | Fórmula | Meta |
|---|---:|---|
| Tasa de emisión | Pts emitidos / mes | ≥ 10% crecimiento objetivo |
| Tasa de redención | (Pts redimidos / Pts emitidos) × 100 | 25–45% |
| Burn ratio | (Pts quemados / Pts redimidos) × 100 | 0.5–1% (configurable) |
| Puntos activos (%) | (Activos / Emitidos) × 100 | ≤ 80% |

---

## 🌍 9. Filosofía del sistema económico

Rewards Bolivia se inspira en las mejores prácticas de programas globales como:

- **Miles & More** (Lufthansa) → estabilidad de valor.
- **Starbucks Rewards** → usabilidad instantánea.
- **Shopee Coins / Mercado Puntos** → gamificación + circularidad.
- **Polygon PoS** → seguridad auditable y escalable.

> Nuestra diferencia: combinamos la fluidez de un sistema Web2 con la integridad auditable de un sistema Web3,
> 
> 
> pero sin fricción, sin complejidad y sin lenguaje técnico.
> 

### Fórmulas y reglas automáticas (para backend)
- `burnAmount = floor(pointsUsed * feeRate)` (feeRate default = 0.005).
- Update ledger:
  - `PointLedger.create({ type: 'REDEEM', amount: pointsUsed, relatedTxId })`
  - `PointLedger.create({ type: 'BURN', amount: burnAmount, relatedTxId, reason: 'operational_fee' })`
- `EconomicControlService` recalcula diariamente y dispara alertas si `%activos > 80%` o `tasaRedención < 25%`.

---

## 🌍 10. Filosofía y nota final
Combinamos **fluidez UX** con **contabilidad estricta**: el usuario no percibe complejidad, pero el sistema mantiene la integridad del pasivo digital mediante expiraciones, quema operativa y reglas dinámicas de emisión. Esto está alineado con la propuesta de valor y arquitectura definidas. :contentReference[oaicite:8]{index=8} :contentReference[oaicite:9]{index=9}