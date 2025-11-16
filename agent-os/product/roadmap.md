# Product Roadmap

1. [ ] Wallet UI with Point Balance Display — Create React component showing current point balance, transaction history with filters (date, type), and expiration warnings. Integrate with SDK wallet endpoints using TanStack Query for real-time updates. `M`

2. [ ] Point Redemption Flow Frontend — Build checkout interface allowing users to apply points to purchases, display real-time discount calculations (max 30% validation), and handle redemption confirmation with instant feedback. `M`

3. [ ] Transaction History Visualization — Implement paginated transaction list with type indicators (EARN/REDEEM/BURN), amount details, merchant information, and date/time stamps with search and filter capabilities. `M`

4. [ ] Business Point Issuance Interface — Create business-facing dashboard for issuing points to customers via QR code scan or customer ID input, with transaction amount entry and confirmation workflow. `L`

5. [ ] Admin Economic Dashboard — Build comprehensive admin view displaying real-time economic metrics (circulation ratio, burn rate, active points %), alert history, and emission rate recommendations with approve/reject actions. `L`

6. [ ] Automated E2E Test Suite — Implement Playwright tests covering complete user flows: registration, point earning, redemption with limit validation, and transaction history verification across user and business roles. `M`

7. [ ] Performance Validation with k6 — Create load testing suite targeting 100 req/s for 30 seconds on earn/redeem endpoints, validate sub-200ms p95 latency, and identify bottlenecks with automated reporting. `S`

8. [ ] Business Plan Feature with Point Blocking — Implement tiered business plans (Starter blocks 50% of points until verification) with backend logic for blocked balances, plan upgrades, and admin verification workflows. `L`

9. [ ] Point Expiration System — Add automated expiration logic with configurable timeframes (e.g., 365 days), scheduled jobs to mark expired points, ledger entries for EXPIRE transactions, and user notifications before expiration. `M`

10. [ ] Enhanced Alert System with Notifications — Extend economic alerts to send email/SMS notifications to admins, add alert configuration UI, implement alert resolution tracking, and create alert analytics dashboard. `M`

11. [ ] Blockchain Anchoring Integration — Implement daily batch submission of audit hashes to Polygon blockchain, create verification endpoints validating on-chain vs off-chain hashes, and add blockchain transaction tracking UI. `XL`

12. [ ] Multi-Business Point Transfer — Enable point transfers between businesses in the network, implement transfer fees and limits, add transfer approval workflows for businesses, and create transfer history tracking. `L`

13. [ ] Loyalty Tiers and Multipliers — Introduce customer tier system (Bronze/Silver/Gold) based on point activity, implement multiplier rates for different tiers (1.5x for Gold), and create tier progression UI with benefits display. `L`

14. [ ] Advanced Analytics and Reporting — Build business analytics showing customer retention rates, average transaction values, point issuance vs redemption trends, and export capabilities for custom date ranges. `M`

15. [ ] Mobile App (React Native) — Create mobile application with wallet features, QR code scanning for redemptions, push notifications for point earning/expiration, and offline-first architecture with sync. `XL`

16. [ ] API Rate Limiting and DDoS Protection — Implement rate limiting middleware with Redis-backed counters, create tiered limits by user role (higher for businesses), add IP-based throttling, and monitoring dashboard. `M`

17. [ ] Automated Emission Rate Adjustments — Upgrade semi-automated emission adjuster to fully automated with enhanced safety guardrails, multi-factor decision algorithms, automatic rollback on anomalies, and detailed audit logs. `L`

18. [ ] Customer Referral System — Build referral program allowing users to earn bonus points for referring new customers, generate unique referral codes, track referral success rates, and create leaderboard. `M`

> Notes
> - Order items by technical dependencies and product architecture
> - Each item should represent an end-to-end (frontend + backend) functional and testable feature
> - Items 1-7 complete current Sprint 2 work (Epic 7 frontend + Epic 8 QA)
> - Items 8-10 are Sprint 3 priorities focusing on business features and robustness
> - Items 11-14 are Sprint 4+ advanced features for scale and differentiation
> - Items 15-18 are future expansion features for growth phase
