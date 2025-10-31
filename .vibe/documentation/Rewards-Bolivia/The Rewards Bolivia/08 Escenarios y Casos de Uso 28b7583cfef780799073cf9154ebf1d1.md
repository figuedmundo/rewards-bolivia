# 08. Escenarios y Casos de Uso

> Propósito:
> 
> 
> Representar flujos reales de interacción entre clientes, negocios y el sistema Rewards Bolivia, validando la usabilidad, economía y sostenibilidad del modelo.
> 
> Estos escenarios sirven para **testing del MVP, entrenamiento de IA de soporte**, y **alineación de UX con reglas económicas**.
> 

---

## 🎟️ 1. Escenario Base: Compra y Recompensa

### Contexto

Un cliente frecuente visita un comercio afiliado y realiza una compra.

El sistema debe premiar el comportamiento positivo (compra real) de forma inmediata y sin fricción.

### Flujo paso a paso

| Paso | Actor | Acción | Resultado |
| --- | --- | --- | --- |
| 1 | Cliente A | Compra por **50 Bs** en *Café Aroma* | El POS genera ticket con QR Rewards |
| 2 | Cliente A | Escanea el QR con su app Rewards | App valida comercio y monto |
| 3 | Backend | Calcula puntos: **1 punto / Bs 1** → 50 puntos | Registra la transacción en DB y blockchain (batch) |
| 4 | Sistema | Envía confirmación visual + animación (“Has ganado 50 puntos ☕”) | Cliente siente progreso y satisfacción inmediata |
| 5 | Negocio | Su dashboard muestra la operación y la emisión automática | Control de stock de puntos actualizado |

💡 **Buenas prácticas aplicadas:**

- **Zero-friction UX:** 2 toques → recompensa validada.
- **Gamificación integrada:** feedback visual inmediato y positivo.
- **Auditoría backend:** toda emisión queda registrada para control contable y anti-fraude.

---

## 💸 2. Escenario: Redención de Puntos

### Contexto

El cliente desea usar parte de sus puntos para obtener un descuento directo en su consumo.

### Flujo

| Paso | Actor | Acción | Resultado |
| --- | --- | --- | --- |
| 1 | Cliente A | Indica en la app: “Usar 20 puntos en esta compra” | Solicitud de redención enviada al comercio |
| 2 | Negocio | Valida y aprueba la redención desde el dashboard | El sistema aplica **descuento de Bs 0.60** (20 × 0.03) |
| 3 | Sistema | Transfiere los 20 puntos de la cuenta del cliente → cuenta del negocio | Balance actualizado en tiempo real |
| 4 | Cliente | Recibe comprobante digital de la transacción | Sensación de transparencia |
| 5 | Backend | Actualiza ledger off-chain y registro on-chain consolidado | Cumplimiento contable y trazabilidad |

💡 **Best practice internacional:**

Redención **instantánea y visible**, con equivalencia fija (0.03 Bs/punto), reduce fricción cognitiva y refuerza la confianza.

Inspirado en la lógica de **“Starbucks Stars”** y **“Apple Wallet Passes”**.

---

## 🔁 3. Escenario: Redistribución de Puntos por el Negocio

### Contexto

Un negocio desea incentivar nuevas visitas y fidelizar a clientes existentes, utilizando los puntos que recibe de redenciones.

### Flujo

| Paso | Actor | Acción | Resultado |
| --- | --- | --- | --- |
| 1 | Negocio B | Ha acumulado **1,200 puntos** por redenciones | Los puntos se vuelven disponibles para reutilización |
| 2 | Negocio B | Lanza campaña: “10 puntos extra por café entre 15:00–18:00” | Incentivo visible en app del cliente |
| 3 | Cliente | Escanea QR en horario promocional | Recibe puntos adicionales automáticamente |
| 4 | Backend | Deduce los puntos usados del balance del negocio | Todo registrado en dashboard y ledger |
| 5 | Negocio | Observa aumento en visitas + estadísticas de engagement | Mejora percepción de ROI de la fidelización |

💡 **Inspirado en:** modelos híbridos tipo **Miles by Lufthansa** y **Klarna Loyalty** donde los puntos vuelven a circular como mecanismo de *network liquidity*.

---

## 🤝 4. Escenario: Transferencia entre Clientes

### Contexto

Fomentar viralidad y expansión orgánica mediante **microtransferencias entre usuarios** (regalos, agradecimientos, retos sociales).

> ⚠️ Nota: estas transferencias son simbólicas dentro del ecosistema —no monetarias— y pueden limitarse para evitar especulación.
> 

### Flujo

| Paso | Actor | Acción | Resultado |
| --- | --- | --- | --- |
| 1 | Cliente C | Abre perfil de amigo y selecciona “Enviar puntos” | Introduce monto: 10 puntos |
| 2 | Backend | Valida límites diarios y KYC interno | Anti-abuso y trazabilidad |
| 3 | Sistema | Ejecuta transferencia: C → D (10 puntos) | Actualiza balances y muestra animación tipo “gift send” 🎁 |
| 4 | Cliente D | Recibe notificación “Has recibido 10 puntos de tu amigo” | Aumento en engagement y retención emocional |
| 5 | Sistema | Log transaccional consolidado (off-chain + batch audit) | Control interno asegurado |

💡 **Best practice global:**

Similares dinámicas en **Cash App, Venmo, WeChat Rewards**, y **LINE Points**, donde el envío de pequeños valores impulsa retención social.

En Rewards Bolivia, esta mecánica fortalece comunidad local y promueve redención cruzada entre comercios.

---

## 🧠 5. Escenario de Control y Auditoría

### Contexto

Rewards Bolivia mantiene equilibrio entre emisión, redención y puntos activos para garantizar la sostenibilidad del ecosistema.

### Flujo

| Paso | Actor | Acción | Resultado |
| --- | --- | --- | --- |
| 1 | Sistema | Registra todas las transacciones (emisión/redención/transferencias) en DB off-chain | Operación rápida y escalable |
| 2 | Batch diario | Consolida datos → genera snapshot hash | Preparación para auditoría |
| 3 | Blockchain oculta | Publica hash y resumen contable | Garantía de transparencia sin exponer data privada |
| 4 | Panel de administración | Dashboard muestra métricas de salud: tasa de redención, puntos activos, puntos expirados | Gobernanza y control de pasivo digital |
| 5 | Auditoría externa (si aplica) | Puede verificar los hashes y estadísticas globales | Credibilidad institucional |

💡 **Best practice:**

Arquitectura tipo **Proof-of-Audit**, inspirada en modelos de **central bank digital sandbox** y **loyalty blockchain frameworks** (IBM, Mastercard Rewards).

---

## 🚀 6. Escenario de Onboarding de un Nuevo Negocio (Starter Pack)

| Paso | Actor | Acción | Resultado |
| --- | --- | --- | --- |
| 1 | Negocio Nuevo | Se registra en la web Rewards Bolivia | Recibe automáticamente **250 puntos Starter** |
| 2 | Cliente | Compra y escanea QR → recibe puntos Starter | Flujo igual que en plan pago |
| 3 | Negocio | Empieza a ver movimiento de puntos (bloqueados) | Percibe valor real del sistema |
| 4 | Negocio | Activa Plan Básico → desbloquea puntos redimidos | Empieza a emitir y monetizar |
| 5 | Sistema | Marca conversión Starter → Pago en métricas | Ciclo de crecimiento validado |

💡 **Estrategia validada por datos:**

Modelos de *freemium* en SaaS + incentivos tangibles → alta tasa de conversión (meta ≥ 40% a los 2 meses).

---

## 📈 7. Métricas Clave Derivadas de los Escenarios

| Indicador | Objetivo | Justificación |
| --- | --- | --- |
| % transacciones exitosas sin fricción | ≥ 98% | UX fluido genera confianza |
| Latencia promedio QR → confirmación | ≤ 1.5 s | Experiencia instantánea tipo fintech |
| Ratio de redención | 25–45% | Ciclo saludable de economía |
| Conversión Starter → Pago | ≥ 40% | Métrica central del modelo |
| Tasa de error contable | < 0.01% | Garantía de precisión y sostenibilidad |

---