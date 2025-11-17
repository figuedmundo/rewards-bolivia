# Product Mission

## Pitch

Rewards Bolivia is a modern loyalty and rewards platform that helps Bolivian businesses and consumers build trust and engagement through instant, transparent point transactions by providing a hybrid on-chain/off-chain system that delivers sub-1.5-second redemptions with blockchain-grade auditability.

## Users

### Primary Customers

- **Small to Medium Businesses (SMBs)**: Local businesses in Bolivia seeking to implement loyalty programs without complex infrastructure or high costs
- **Enterprise Merchants**: Larger retail chains and franchises requiring scalable, auditable point management systems
- **End Consumers**: Bolivian customers who want to earn, track, and redeem loyalty points across participating businesses

### User Personas

**Maria - Small Business Owner** (35-50)
- **Role:** Owner of a local coffee shop chain (3 locations)
- **Context:** Wants to reward repeat customers and compete with larger chains that have loyalty programs
- **Pain Points:** Cannot afford expensive loyalty software, lacks technical expertise, needs simple point issuance
- **Goals:** Increase customer retention by 30%, track customer engagement, issue points via simple QR codes

**Carlos - IT Manager at Retail Chain** (30-45)
- **Role:** Technology decision-maker at a mid-size supermarket chain
- **Context:** Managing loyalty program for 15+ locations with 50,000+ active customers
- **Pain Points:** Current system is slow, lacks transparency, difficult to audit, high transaction fees
- **Goals:** Sub-2-second redemption times, comprehensive audit trails for compliance, real-time economic monitoring

**Sofia - Loyal Consumer** (22-40)
- **Role:** Urban professional, frequent shopper
- **Context:** Shops at multiple participating businesses weekly
- **Pain Points:** Forgets physical loyalty cards, unclear point balances, slow redemption process at checkout
- **Goals:** Track all points in one place, instant balance updates, seamless redemption experience

**Regulatory Auditor - Juan** (40-55)
- **Role:** Financial compliance officer
- **Context:** Audits loyalty programs for regulatory compliance
- **Pain Points:** Incomplete audit trails, difficulty verifying transaction integrity, manual reconciliation
- **Goals:** Cryptographic proof of all transactions, immutable ledger access, automated compliance reporting

## The Problem

### Fragmented and Opaque Loyalty Systems

Bolivian businesses struggle to implement reliable loyalty programs. Traditional solutions are expensive, slow, and lack transparency. Customers lose trust when points disappear or balances are inconsistent. Businesses cannot track economic health of their point systems, leading to over-issuance or devaluation. Manual reconciliation is time-consuming and error-prone. This results in lost revenue, poor customer experience, and regulatory risk.

**Our Solution:** A hybrid architecture combining database speed (sub-1.5s transactions) with blockchain auditability (cryptographic proof). Every transaction is hashed and tracked in an immutable ledger, while real-time economic monitoring prevents system abuse.

### Lack of Economic Control and Transparency

Most loyalty platforms treat points like unlimited currency, leading to inflation, devaluation, and eventual program collapse. Businesses have no visibility into circulation ratios, burn rates, or redemption patterns. When programs fail, both businesses and consumers lose value.

**Our Solution:** Built-in Economic Control System that monitors key metrics in real-time (total supply, circulation ratio, burn rate, redemption velocity). Automated alerts prevent dangerous economic states. Admin tools provide semi-automated emission adjustment with safety thresholds.

### Poor Auditability and Trust

Existing systems use centralized databases with no cryptographic verification. Transactions can be altered or deleted. Businesses and regulators cannot independently verify ledger integrity. This creates distrust and regulatory complications.

**Our Solution:** Dual-level cryptographic hashing - every transaction gets a SHA256 hash for instant verification, while daily batch hashes prepare for blockchain anchoring. Complete audit trails with tamper-proof verification endpoints.

## Differentiators

### Hybrid On-chain/Off-chain Architecture

Unlike pure blockchain solutions (slow, expensive) or pure database solutions (no trust guarantees), we provide instant transactions with cryptographic auditability. This results in 10x faster redemptions than blockchain-only platforms while maintaining tamper-proof ledgers.

### Real-time Economic Monitoring

Unlike traditional loyalty platforms that treat points as infinite, we monitor economic health continuously. Circulation ratios, burn rates, and supply metrics are calculated in real-time with automated alerting. This prevents program collapse and maintains point value.

### Developer-First API with Auto-Generated SDK

Unlike legacy platforms with poor APIs, we provide OpenAPI-documented REST endpoints with auto-generated TypeScript clients. Integration takes days, not months. Type-safe SDK ensures frontend-backend consistency.

### Modular Monolith Architecture

Unlike microservices complexity or traditional monolith rigidity, we use a Modular Monolith with DDD principles. Each module (Auth, Users, Transactions) is independently testable with clear boundaries, but deployed as one unit. This reduces operational complexity while maintaining code quality.

### Dual-Level Audit System

Unlike single-hash systems, we provide per-transaction hashing (instant verification) and daily batch hashing (gas-efficient blockchain anchoring). Regulators can verify individual transactions or entire days with cryptographic proof.

## Key Features

### Core Features

- **Instant Point Transactions:** Sub-1.5-second earn and redeem operations with real-time balance updates
- **Immutable Ledger:** Every point movement recorded in tamper-proof ledger with SHA256 hashing
- **Wallet Dashboard:** Real-time balance tracking, transaction history with filters, and status indicators
- **Multi-Role Authentication:** JWT-based auth supporting consumers, business users, and admins with Google OAuth

### Business Features

- **Point Issuance:** Businesses issue points via QR codes, manual entry, or API integration
- **Redemption Management:** Configurable discount rates (0-30%), validation rules, and confirmation flows
- **Business Dashboard:** Track customer transactions, point issuance history, and redemption patterns
- **Business Plans:** Tiered plans (Starter/Basic/Pro/Premium) with blocked balance rules and eligibility constraints

### Economic & Admin Features

- **Economic Control System:** Real-time monitoring of circulation ratio, burn rate, total supply, and velocity metrics
- **Automated Alerts:** Configurable thresholds trigger warnings for economic anomalies (over-issuance, unusual redemption patterns)
- **Admin Console:** Search users, businesses, and transactions; view system-wide point statistics
- **Semi-Automated Emission Engine:** Admin tools for economy tuning with safety thresholds and approval workflows

### Audit & Compliance Features

- **Per-Transaction Verification:** Every ledger entry can be independently verified via API endpoint
- **Daily Audit Hashes:** Automated batch hashing at 3 AM UTC for entire day's transactions
- **Admin Audit Tools:** Query daily hashes, verify integrity, generate compliance reports
- **Ledger Export:** Export audit trails for regulatory submission in standardized formats

### Advanced Features

- **Point Expiration System:** Scheduled expirations with notifications and automatic EXPIRE ledger entries
- **Rate Limiting:** Redis-based API throttling with role-based limits to prevent abuse
- **Background Job Processing:** BullMQ workers handle scheduled tasks (expiration, alerts, daily hashes)
- **Blockchain Anchoring (Planned):** Daily batch hash submission to Polygon for long-term immutable proof
