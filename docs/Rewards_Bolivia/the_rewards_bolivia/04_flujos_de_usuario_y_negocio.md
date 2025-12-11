# 04. Flujos de Usuario y Negocio

Esta sección describe cómo **clientes** y **negocios** interactúan dentro del ecosistema Rewards Bolivia.

Cada flujo combina **interacción UX**, **procesos de negocio**, y **eventos técnicos**, garantizando una experiencia coherente, trazable y rentable para todos los participantes.

---

## A. Cliente – “El Viaje del Usuario”

> El flujo está diseñado para que cada interacción genere valor emocional y económico, creando hábito y sentido de pertenencia.
> 

### 🔹 1️⃣ Compra y Recepción de Tokens

### **Flujo UX**

1. Cliente realiza una compra en un negocio afiliado.
2. El POS o app del negocio genera un **QR dinámico** (con el monto de compra).
3. El cliente lo escanea desde su app Rewards.
4. Se confirma visualmente la emisión: “🎉 Has ganado 75 tokens.”
5. El saldo se actualiza en tiempo real en la app.

### **Backend**

- Emisión off-chain instantánea (`emitTokens` endpoint).
- Firma digital de la transacción (para trazabilidad).
- Batch de auditoría on-chain diario.

### **Valor Generado**

- El cliente **recibe recompensa inmediata**.
- El negocio **consolida datos de compra** y fidelización.
- El ecosistema **aumenta actividad transaccional** (engagement metric).

---

### 🔹 2️⃣ Redención de Tokens en Cualquier Negocio

### **Flujo UX**

1. El cliente selecciona “Canjear tokens”.
2. Escanea el QR del negocio.
3. Confirma el monto a redimir.
4. Recibe confirmación visual (“✅ Canje exitoso en Café Chaco”).

### **Backend**

- Validación de saldo en tiempo real.
- Actualización off-chain inmediata.
- Registro de redención en ledger de negocio y cliente.
- Liquidación on-chain en batch diario.

### **Valor Generado**

- Experiencia **friccional cero** (sin esperas blockchain).
- Ecosistema **interoperable** (cross-business redemption).
- Mayor percepción de **utilidad del token** → retención alta.

---

### 🔹 3️⃣ Transferencia entre Usuarios

### **Flujo UX**

1. En la app, el cliente selecciona “Enviar tokens”.
2. Busca un contacto o escanea su QR personal.
3. Introduce el monto y mensaje opcional (“Gracias por el café ☕”).
4. Transacción instantánea (push notification para el receptor).

### **Backend**

- Operación off-chain segura (firma de ambas partes).
- Antifraude (límite diario, device ID, timestamp).
- Integración con push-service para confirmación inmediata.

### **Valor Generado**

- Tokens se vuelven **sociales y virales**.
- Fomenta **transferencias naturales** entre comunidades.
- Crea **network effect** sin costo adicional.

---

### 🔹 4️⃣ Visualización de Balance e Historial

### **Flujo UX**

- En la pantalla principal:
    - Balance animado.
    - Historial tipo timeline (“+30 tokens en Panadería Paz”).
    - Filtros: “Emitidos / Redimidos / Transferidos.”
- Botón “Ver auditoría” para explorar registro en blockchain (transparencia).

### **Backend**

- Consulta desde API `transactions/history`.
- Integración con cache Redis para respuesta instantánea.
- Auditoría disponible vía explorer público (solo hashes).

### **Valor Generado**

- Fomenta **confianza total**.
- Mejora **engagement visual** (el usuario ve su progreso).
- Facilita **autoaprendizaje del sistema de recompensas**.

---

## B. Negocio – “El Motor del Ecosistema”

> Cada negocio es un emisor, receptor y analista de tokens, dentro de un sistema que aumenta retención, tráfico y gasto promedio.
> 

---

### 🔹 1️⃣ Emisión de Tokens a Clientes

### **Flujo UX**

1. El negocio abre su dashboard web.
2. Ingresa monto de compra o selecciona “Escanear QR cliente”.
3. El sistema calcula automáticamente la recompensa según su plan (ej. 5%).
4. Cliente recibe tokens instantáneamente.

### **Backend**

- API `business/emitTokens`.
- Validación de plan de lealtad activo.
- Registro automático en balance del cliente.
- Dashboard muestra tokens emitidos hoy / esta semana / total.

### **Valor Generado**

- Incentivo directo al gasto.
- Visibilidad inmediata del impacto.
- Alineación de incentivos negocio-cliente.

---

### 🔹 2️⃣ Recepción y Canje de Tokens

### **Flujo UX**

1. Cliente escanea QR del negocio.
2. Negocio confirma redención en su panel.
3. Saldo de tokens se acredita al negocio.
4. Dashboard muestra resumen: “+250 tokens recibidos hoy”.

### **Backend**

- API `business/redeemTokens`.
- Validación de identidad y autenticidad del QR.
- Registro cruzado cliente ↔ negocio ↔ ecosistema.

### **Valor Generado**

- Los tokens vuelven a circular → **efecto multiplicador**.
- Negocio obtiene **liquidez en puntos**, sin pérdida de valor.

---

### 🔹 3️⃣ Redistribución o Canje por Beneficios

### **Flujo UX**

- Desde el panel:
    - Opción 1: redistribuir tokens a nuevos clientes (promoción).
    - Opción 2: convertir tokens en créditos del ecosistema.
    - Opción 3: “burn” (reducir supply y mejorar escasez).

### **Backend**

- Microservicio `settlement` ejecuta lotes on-chain.
- Registro contable ajustado automáticamente.

### **Valor Generado**

- Negocios pueden **usar tokens como herramienta de marketing**.
- Ecosistema **mantiene balance económico**.

---

### 🔹 4️⃣ Campañas y Analítica

### **Flujo UX**

- Módulo “Campañas”:
    - Crear promociones (doble puntos, happy hour, referidos).
    - Definir duración, segmentos y objetivos.
- Módulo “Estadísticas”:
    - Tokens emitidos/redimidos.
    - Clientes activos y frecuencia de visita.
    - ROI y comparación entre sucursales.

### **Backend**

- Integración con `analytics engine` (BigQuery o Clickhouse).
- Recomendaciones automáticas (AI-based campaigns).

### **Valor Generado**

- Negocios pueden **ver claramente el retorno** de sus acciones.
- Se crea un **bucle de mejora continua** basado en datos.

---

## 🧩 Síntesis Visual (Mapa Simplificado del Flujo)

```
[Cliente compra] → [Negocio emite tokens] → [Cliente acumula y transfiere]
     ↓                                      ↑
[Cliente redime tokens] ← [Negocio recibe tokens / crea campañas]

```

---

## 💼 Valor Estratégico

| Dimensión | Cliente | Negocio | Ecosistema |
| --- | --- | --- | --- |
| **Engagement** | Gamificación, recompensas visibles | Campañas dinámicas | Mayor volumen transaccional |
| **Liquidez** | Tokens interoperables | Redistribución flexible | Economía circular |
| **Transparencia** | Historial auditable | Dashboard de métricas | Confianza general |
| **Escalabilidad** | UX fluida | Integración POS/API | Arquitectura híbrida |

---