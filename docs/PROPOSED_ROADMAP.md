# PROPOSED PRODUCT FEATURE ROADMAP

---

### **Phase 1 — Core Wallet Experience (MVP)**

1. **Wallet Core API + Balance Logic** — Implement wallet balance retrieval, ledger aggregation, blocked balances, and expiration-safe calculations. `M`
2. **Transaction Engine v1** — Implement earn, redeem, burn, expire transactions with validation, business rules, and audit ledger. `L`
3. **Wallet UI (Balance + Ledger)** — Display current balance, transaction list (earn/redeem/burn), with filters and statuses. `M`

---

### **Phase 2 — Merchant & Redemption Flows**

4. **Merchant Authentication + Roles** — Business onboarding, login, role enforcement, merchant permissions. `M`
5. **Point Redemption UI** — Checkout interface, apply points, discount calculation (0–30%), validation, confirmations. `M`
6. **Business Point Issuance UI + API** — Issue points to users, QR / ID input, manual amounts, confirmation flow. `L`

---

### **Phase 3 — User + Business History & Transparency**

7. **Transaction History Visualization** — Pagination, filters, merchant names, timestamps, type indicators. `M`
8. **Business Dashboard v1** — View customers, transactions, point issuance history, redemption logs. `M`

---

### **Phase 4 — Admin & Economic Engine**

9. **Admin Console v1** — Search users, merchants, transactions, point stats. `M`
10. **Admin Economic Dashboard** — Circulation ratio, burn rate, alert history, trend metrics. `L`
11. **Semi-Automated Emission Adjuster** — Admin knobs for economy tuning, safety thresholds, approval/reject flow. `L`
12. **Enhanced Alert System** — Alerts + notifications, configuration UI, severity levels, resolution tracking. `M`

---

### **Phase 5 — Business Plans & Advanced Wallet Logic**

13. **Business Plan Engine** — Starter/Basic/Pro/Premium plans with blocked balance rules & eligibility constraints. `L`
14. **Point Expiration System** — Scheduled expirations, notifications, EXPIRE ledger entries. `M`

---

### **Phase 6 — Scaling & Multi-Entity Features**

15. **Performance Validation with k6** — Test earn/redeem endpoints at scale with defined thresholds. `S`
16. **API Rate Limiting** — Redis counters, roles-based limits, IP-based throttling. `M`
17. **Multi-Business Point Transfer** — Transfer fees, approval workflows, transfer history. `L`

---

### **Phase 7 — Differentiating Features (Post-MVP)**

18. **Loyalty Tiers System** — Bronze/Silver/Gold tiers, multipliers, progression UI. `L`
19. **Advanced Analytics** — Business retention, transaction value trends, issuance vs redemption charts. `M`
20. **Customer Referral System** — Referral codes, bonus points, tracking, leaderboard. `M`

---

### **Phase 8 — Long-Term Expansion**

21. **Blockchain Anchoring** — Daily batch hash submission to Polygon, verification endpoints, UI explorer. `XL`
22. **Mobile App (React Native)** — Wallet, QR scanning, offline-first sync, push notifications. `XL`

---

# BACKEND ENGINEERING ROADMAP

---

### **Foundation Layer**

1. **Monorepo Foundation** — TurboRepo, workspaces, standard configs. `S`
2. **API Architecture (NestJS + DDD)** — Domain modules, exception filters, pipes, logging. `M`
3. **Prisma Schema Foundation** — Users, merchants, wallet, ledger, business plans. `M`
4. **Config System** — Schema validation, env onboarding, dynamic config loader. `S`

---

### **Core Engine & Horizontal Features**

5. **Transaction Domain Engine** — Earn/redeem/burn/expire logic with state transitions. `L`
6. **Ledger Consistency** — DB constraints, transaction atomicity, isolation levels. `M`
7. **Redis Caching Layer** — Wallet caching, ledger caching, invalidation rules. `M`
8. **Background Worker System** — Queue processing, scheduler for expirations. `M`
9. **Notification Service Foundation** — Email/SMS provider integration. `S`

---

### **Security & Access Control**

10. **RBAC System** — User roles, merchant roles, admin roles. `M`
11. **Rate Limiting Layer** — Redis counters, API throttling. `M`
12. **Auth Hardening** — Refresh tokens, session management, API key support. `M`

---

### **Admin + Internal Tools**

13. **Admin API** — Search users, merchants, transactions. `M`
14. **System Audit Trail** — Activity logs, admin changes, economic adjustments. `M`
15. **Internal Simulation Tools** — Economy simulator, point injection playground. `L`

---

### **Economic Engine**

16. **Emission Engine Base** — Data model, calculation functions, thresholds. `L`
17. **Alert Engine** — Economic indicators, triggers, severity. `M`
18. **Business Plan Engine Base** — Plan logic, blocked balance calculation. `M`
19. **Expiration Engine** — Daily job, event creation, ledger EXPIRE entries. `M`

---

### **Observability & Operations**

20. **Logging + Tracing** — OpenTelemetry, structured logs. `M`
21. **Metrics** — Prometheus/Grafana dashboards for endpoints, queues, DB. `S`
22. **Audit Exporter** — Export ledger for regulators. `M`

---

### **Production Hardening**

23. **CI/CD Pipeline** — Tests, builds, migrations, deploy. `M`
24. **DB Migration Workflow** — Safe migrations, rollback plans. `S`
25. **Error Management** — Global error shape, Sentry integration. `S`
26. **Production Dockerization** — Optimized Docker images. `S`

---

# **🚀 UNIFIED MASTER ROADMAP**

### **Stage 1 — Foundations**

1. Monorepo + CI
2. NestJS architecture
3. Prisma schema v1
4. Config + Env system
5. Redis + caching foundation
6. Migration + logging + error handling

---

### **Stage 2 — Core Wallet Engine**

7. Transaction engine v1 (earn/redeem/burn)
8. Ledger consistency + atomicity
9. Wallet balance API
10. Admin API foundations
11. Background worker system

---

### **Stage 3 — Wallet Experience**

12. Wallet UI
13. Transaction history UI
14. Merchant authentication
15. Business issuing (UI + API)
16. Redemption flow (UI + API)

---

### **Stage 4 — Administration**

17. Admin dashboard v1
18. Search users/merchants
19. Economic metrics
20. Alert system
21. Semi-automated emission engine

---

### **Stage 5 — Advanced Economy Logic**

22. Business plan engine
23. Expiration engine
24. Point blocking
25. Notifications
26. Scheduled jobs
27. Rate limiting

---

### **Stage 6 — Scaling & Multi-Entity**

28. Performance testing (k6)
29. Multi-business transfer
30. Loyalty tiers
31. Advanced analytics

---

### **Stage 7 — Expansion**

32. Referral system
33. Blockchain anchoring
34. Mobile app

---
