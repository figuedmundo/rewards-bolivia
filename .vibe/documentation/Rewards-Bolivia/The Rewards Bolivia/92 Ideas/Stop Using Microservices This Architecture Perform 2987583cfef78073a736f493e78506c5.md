# Stop Using Microservices .This Architecture Performs Better at Scale

![techWithNeer](https://dgi7vzg1pa0r4x.archive.is/kk4ie/699741dac471ba849e89c1e17df465135355d952.jpg)

*When everyone is busy breaking down their systems into a hundred services, we decided to do the opposite. Here’s why it worked.*

# **Introduction**

Microservices have been heralded as the ultimate solution to scaling software. Break things apart. Isolate them. Deploy independently. Scale independently. Everyone’s doing it , from startups to FAANG.

> But what if I told you that the very pattern you’ve been following is the reason your system is not scaling efficiently?
> 

Press enter or click to view image in full size

![](https://dgi7vzg1pa0r4x.archive.is/kk4ie/7d44bf8c6239c136cfd395b20515b29ae7ee47c4.webp)

We dumped our microservices architecture for a **modular monolith** and saw:

- **60% reduction in latency**
- **2x faster deployments**
- **70% fewer infrastructure costs**
- **Dramatic improvements in developer velocity**

Let me explain.

### **The Problem With Microservices at Scale**

### **1. Operational Complexity**

Every microservice introduces overhead:

- API contracts
- CI/CD pipelines
- Deployment coordination
- Observability tooling
- Retry logic and circuit breakers

> In a system of 12 microservices, the number of inter-service failure points exploded.
> 

### **2. Network Overhead and Latency**

Here’s a basic example of what a single user request might trigger:

```
[Gateway] --> [Auth Service] --> [User Profile Service] --> [Subscription Service] --> [Payment Service]
```

Each hop adds:

- Network latency
- Serialization/deserialization
- Security checks
- Potential retries on failure

Under load, this overhead becomes non-trivial.

### **Latency Benchmark:**

(Using `wrk` load testing on a user dashboard request)

```
| Architecture     | Avg Latency (ms) | 99th Percentile |
| ---------------- | ---------------- | --------------- |
| Microservices    | 320              | 610             |
| Modular Monolith | 118              | 190             |
```

### **The Architecture That Replaced It: Modular Monolith**

No, not the classic spaghetti monolith.

We’re talking about a **modular, well-isolated, layered monolith** with **internal APIs** that resemble service boundaries just without the networking overhead.

### **High-Level Architecture**

```
                         +-----------------------------+
                         |     HTTP / gRPC Gateway     |
                         +-----------------------------+
                                   |
          +------------------------+------------------------+
          |                        |                        |
+------------------+   +------------------+   +------------------+
| Auth Module      |   | Subscription Mod |   | Payment Module   |
+------------------+   +------------------+   +------------------+
          \                 /                      /
           \               /                      /
            +-------------+----------------------+
                          |
               +--------------------------+
               |   Shared Infrastructure  |
               | (DB, Cache, Logger, etc)|
               +--------------------------+
```

### **How Internal Calls Work**

Instead of HTTP or gRPC, module boundaries are preserved **via function interfaces** and **interfaces with dependency injection**.

```
// SubscriptionService.go

type SubscriptionService struct {
    repo SubscriptionRepo
}
func (s *SubscriptionService) GetUserSubscription(userID string) (*Subscription, error) {
    return s.repo.Fetch(userID)
}
```

> No HTTP. No JSON. Just direct function calls.
> 

### **How We Maintain Separation of Concerns**

We use **package-level boundaries** and **clean architecture principles**.

```
/internal
  /auth
    - service.go
    - handler.go
    - model.go
  /subscription
    - service.go
    - handler.go
    - model.go
```

Each module:

- Has its own models and services
- Communicates with other modules via **interfaces**
- Does not share database tables

### **Deployment: Monolith with Feature Flags**

One big binary, but smartly divided via configs:

```
enabled_modules:
  - auth
  - subscription
  - payment
```

> We deploy everything together, but only run what’s needed via flags (very useful in staging/testing environments).
> 

### **Why This Performed Better**

### **1. In-Memory Function Calls**

In our microservices setup:

- Every service call was a gRPC/HTTP call
- Required retries, backoff, and resilience logic

In modular monolith:

- Everything is in-process
- Latency dropped significantly

### **2. Single Database Transaction Across Modules**

In microservices, distributed transactions are a pain. We had to use the **Saga pattern** to coordinate changes across modules.

In monolith:

```
tx := db.Begin()
authRepo.WithTx(tx).CreateUser(user)
subscriptionRepo.WithTx(tx).CreateTrial(user.ID)
tx.Commit()
```

> All in one transaction. No external orchestrator needed.
> 

### **When Should You NOT Use Microservices?**

- When your **team size is under 100**
- When you’re not operating in **multiple dev teams with full autonomy**
- When you need **strong consistency**
- When you don’t want to hire a **full-time platform/infra team**

### **How to Transition**

1. **Keep microservice boundaries as modules**
2. **Build a monorepo and share interfaces**
3. **Avoid hard coupling to shared databases**
4. **Use internal APIs via function calls**
5. **Deploy as a single service with feature toggles**

### **Final Thoughts**

Microservices were built for **large organizations** with **complex teams** and **massive infra budgets**. For many startups and mid-size companies, they’re an **overkill**.

We replaced a 12-service setup with a single binary and scaled better, faster, and cheaper.

Stop blindly following architectural trends.

> Sometimes, the best architecture is the one that’s boring, simple, and fast.
> 

### **Bonus: Tools That Helped Us**

- **Go + Wire** for DI
- **Fx / Uber Zap** for service lifecycle and logging
- **GORM** with transaction-scoped repos
- **GitHub Actions + Docker Compose** for single-unit CI/CD
- **Flags + Configs** for module toggling

## En el projecto,  opinion

# ✅ ¿Qué me parece el documento?

- **Muy acertado.** Expone las debilidades reales del microservicio “por moda”: complejidad operativa, latencia por saltos y costes infra.
- **Los beneficios que reporta** (latencia menor, despliegues más rápidos, costes más bajos, mayor velocidad de desarrollo) son exactamente los que necesitamos para un MVP con alcance nacional: validar economía y UX rápido.
- **La propuesta del “modular monolith”** conserva separación de dominios (auth, transactions, business, audit) sin la sobrecarga de comunicación inter-servicio por red — ideal para mantener consistencia (transacciones ACID) y simplicidad operativa.

---

# 🔎 ¿Podemos usar algo así para Rewards Bolivia?

Sí — **recomiendo usar un monolito modular para el MVP** y diseñarlo desde el primer día para que sea fácilmente “splitteable” en microservicios cuando lo necesitemos. Ventajas clave para nosotros ahora:

- Menor latencia en emisión/redención (importante para UX QR < 1.5s).
- Transacciones ACID sencillas (Postgres + txs) — evita sagas complejas.
- Menor coste operativo y despliegues sencillos (uno o pocos binarios/containers).
- Mayor velocidad de desarrollo — ideal para iterar sobre la economía de puntos.

---

# 🔧 Cómo aplicarlo (Plan práctico, compatible con el TSDR que ya definimos)

## 1) Principio de diseño

Adoptar **Monorepo** + **Monolith modular**:

- **Módulos** por dominio: `auth`, `users`, `transactions`, `business`, `audit`, `analytics`.
- Cada módulo tiene su capa: `controllers/handlers`, `services/usecases`, `repos`, `models`.
- Comunicación entre módulos por **interfaces/DI** (llamadas en memoria), no por HTTP.

## 2) Tech mapping (coherente con tu TSDR)

Ya definimos Node + TypeScript + NestJS + Prisma + Postgres. Esto encaja perfectamente:

- **NestJS** soporta modular monolith muy bien (módulos, providers, inyección de dependencias).
- **Prisma + Postgres** permiten transacciones multi-repo con `tx` y migraciones controladas.
- **Redis** para cache / locks (evitar race conditions en QR).
- **Feature flags**: Unleash / LaunchDarkly / simple config + env flags para activar módulos en runtime.

## 3) Estructura física recomendada (monorepo)

```
/packages
  /api          -> NestJS app (entrypoint)
    /src
      /modules
        /auth
          auth.controller.ts
          auth.service.ts
          auth.module.ts
        /transactions
          transactions.service.ts
          transactions.controller.ts
          transactions.module.ts
        /business
        /audit
      /common
        /db
        /logging
        /errors
  /web (react)
  /mobile (react-native)
  /infra
    docker-compose.yml
    k8s/ (future)

```

## 4) Políticas DB

- Preferir **esquemas separados** dentro de la misma DB (Postgres schemas) o tablas con prefijo módulo — evita acoplamientos accidentales.
- Permitir transacciones globales: `prisma.$transaction([...])` o tx object pasado a repos para operaciones cross-module.
- Evitar compartir modelos/tabla sin contrato. Si hay necesidad de compartir, hacerlo vía repos/Interfaces.

## 5) Llamadas internas y contratos

- Exponer **servicios por interfaces** (TypeScript interfaces + DI).
- Ejemplo NestJS (simplificado):

```tsx
// transactions.service.ts
@Injectable()
export class TransactionsService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly txRepo: TransactionRepo,
    private readonly eventBus: EventBus,
  ) {}

  async emitTokens(businessId: string, userId: string, amount: number) {
    return await prisma.$transaction(async (tx) => {
      // validaciones, modificar saldo, registrar tx
      await tx.transaction.create({...});
      // publicar evento interno (no red)
      this.eventBus.publish(new TokensEmittedEvent(...));
      return { success: true };
    });
  }
}

```

## 6) Feature flags y despliegue

- Desplegar **un solo artifact** (imagen Docker) pero controlar módulos por flags en configuración:

```yaml
enabled_modules:
  auth: true
  transactions: true
  audit: true

```

- Useful para activar/excluir funcionalidades en staging y rollout progresivo.

## 7) Observabilidad y testing

- Logging estructurado (trace_id), métricas Prometheus por módulo, y tracing (OpenTelemetry).
- Testing: sigue la **Test Pyramid** definida — la arquitectura modular facilita tests unitarios por módulo, tests de integración para flujos multi-módulo y **E2E críticos** (emisión/redención).