# 93. Some feedback

# Core problem summary

Customers pay cash at Store A. Store A wants to credit the customer with network points. Later the customer goes to Store B (cash-only) and wants to spend points for a discount — but Store B needs to be compensated (in cash or by receiving value from the network). How does Store B get paid so it isn’t losing money?

# Short recommendation (start here)

Use **merchant prepaid wallets** + **agent cash top-ups** as the primary settlement model. Merchants buy points in advance (cash or bank transfer) into the platform wallet and redeem those balances when they accept points. For flexibility, allow a small **negative credit limit** with basic KYC and risk rules so merchants can accept redemptions even when balance is low — but require replenishment within a short window.

Why: it’s simple, predictable for merchants, works with cash, avoids real-time bank settlement complexity, and keeps accounting clean.

---

# Full options (with pros/cons & when to use)

### Option A — Merchant prepaid wallet (recommended MVP)

Flow:

1. Merchant tops up wallet by paying cash to an **agent** (local person/company) or by bank transfer/QR into a company account; platform credits merchant account with X points (or points-purchase credit in local currency).
2. When a customer redeems points at Merchant B, the platform deducts equivalent points/value from Merchant B’s wallet.
3. Merchant B uses redeemed points as a discount to the customer (customer pays remaining in cash). Merchant B’s wallet balance decreases accordingly.
4. Agents or bank transfers replenish merchant wallets.

Pros:

- Predictable for merchants (they spent cash to buy points).
- No complex cross-merchant invoicing.
- Works with cash via agents and QR/bank for merchants who can bank.
    
    Cons:
    
- Requires agents or bank integration for cash collection.
- Merchants must pre-fund — possible barrier for tiny stores (mitigate with small initial credit or trial top-up).

Best for: informal markets; low-tech customers; quick MVP.

---

### Option B — Deferred settlement (credit + netting)

Flow:

- Merchants accept redemptions even if no balance; platform tracks liabilities and settles weekly/monthly by invoicing the merchants or taking funds via bank transfer/QR.
    
    Pros:
    
- Low friction for merchants (no upfront payment).
    
    Cons:
    
- Platform takes credit risk and needs collections; high operational overhead and risk of default in informal markets.

Use only if you have strong merchant relationships and collections capability.

---

### Option C — Inter-merchant clearing (barter-style)

Flow:

- Keep a central ledger and periodically net flows: if Merchant A issued 1,000 points and Merchant B accepted 900, you only settle the net amounts among merchants.
    
    Pros:
    
- Minimal cash movement.
    
    Cons:
    
- Complex bookkeeping and trust; needs mature network and frequent reconciliation.

Best for scale when many merchants have balanced flows.

---

### Option D — Platform pays merchants and collects from issuer merchants

Flow:

- Platform compensates merchant B in fiat for redeemed points and then invoices/collects from issuer merchant A (or the merchant who originally issued points).
    
    Cons:
    
- Complex, opens lots of disputes, and operationally heavy. Not recommended for MVP.

---

# Practical MVP flow (detailed steps — recommended)

1. **Merchant onboarding**
    - Merchant registers and chooses a top-up method:
        - Bank transfer/QR to platform account (for those with bank access).
        - Cash to a *local agent* (field agent, convenience store, or kiosk) who processes top-up and collects cash.
    - Merchant gets an initial trial credit (small amount) to start accepting redemptions immediately.
2. **Top-up / Purchase points**
    - Merchant pays X bolivianos → platform credits merchant wallet with `points = X * conversion_rate`.
    - Show clear wallet balance in merchant app.
3. **Issuing points to customer (when they pay cash)**
    - Customer shows in-app QR (or phone number).
    - Merchant scans QR, enters amount/points to award. Platform immediately increases the customer’s point balance and records a liability against the merchant (reduces merchant wallet).
    - If merchant has insufficient wallet balance, either:
        - Prevent awarding and prompt top-up (poor UX), or
        - Allow awarding but add to “negative balance” with limit and require merchant to settle within N days.
    
    Recommended: allow small negative balance (e.g., up to -1000 BOB equivalent) for trusted merchants, with alerts and automatic top-up reminders.
    
4. **Redeeming points at Store B (cash-only)**
    - Customer shows QR to redeem.
    - Merchant scans and redeems, platform deducts customer’s points and deducts equivalent value from merchant B’s wallet (or increases merchant B’s liabilities if negative credit allowed).
    - Merchant B collects the remaining amount in cash from the customer (if any) and gets immediate confirmation of redemption.
5. **Settlement & reconciliation**
    - Merchants can top up at any time via bank transfer or cash agent.
    - Platform sends weekly settlement statements and enforces auto-blocking for merchants with long overdue negative balances.
    - Agents collect cash and deposit to platform bank account; platform credits merchant wallets.
6. **Fees**
    - Charge a small fee on top-ups and a redemption fee or subscription — transparent to merchants.

---

# Fraud & dispute controls

- **Daily limits** per merchant and per customer for issuance and redemption.
- **Receipt matching**: allow merchants to optionally upload or reference a receipt/transaction ID for large redemptions.
- **Manual review queue** for unusual redemptions.
- **Agent controls**: agents must be KYC’d and monitored — cash top-up abuse is risky.
- **Negative-balance enforcement**: after X days overdue, block merchant, notify, and begin collections.

---

# UX notes (low friction)

- Use phone-number + OTP sign-in for customers; QR only for scanning.
- Show merchant wallet balance in big numbers in merchant app so they can see when to top up.
- Simple “Accept redemption? Yes/No” flow with clear confirmation and printed/WhatsApp receipt option to reduce disputes.
- Provide agents with a paper/printed receipt flow (for cash payments).

---

# Example numbers (for clarity)

- Conversion: 1 BOB = 10 points (decide whatever suits your economics).
- Merchant A sells 100 BOB worth of goods, awards 100*10 = 1000 points to customer.
- Merchant A’s wallet decreases by marketplace cost (maybe you account a merchant liability vs platform). If merchant prepaid, the wallet had been funded earlier so balance drops.
- Customer uses 500 points at Merchant B (50 BOB discount). Merchant B’s wallet reduces by 50 BOB value (or increases liability if negative credit).
- Platform takes 5% fee on top-ups and charges 2% settlement/processing fee.

---

# Operational suggestions for Bolivia’s cash market

- Build a small **agent network** in each pilot city: local shops, vendors, or your own field staff who accept cash and top-up merchant wallets for a small commission.
- Offer merchants an easy **bank-QR** option for those with bank accounts (growing but still limited).
- Start with low top-up minimums (e.g., 50–100 BOB) and low fees to reduce friction.
- Provide printed QR stickers and a quick onboarding visit — field sales are critical.

---

# KPIs to test this model quickly

- % of merchants that top-up via cash agent vs bank transfer.
- Average time between redemption and merchant wallet replenishment.
- Number of merchants using negative credit and % recovering within 7 days.
- Dispute rate per 1,000 redemptions.
- Agent cash collection reconciliation mismatch rate.

---

# Final practical checklist to implement now

1. Add a merchant wallet & balance to your data model.
2. Build top-up endpoints (bank/QR + agent).
3. Implement QR scan award/redeem flows that update customer balance and merchant wallet atomically.
4. Add negative-balance logic with configurable limits and alerts.
5. Create simple settlement statements and a manual collection flow.
6. Pilot with 5 merchants + 1 agent to prove cash top-up and redemption flows.

## 🧠 1. Why most loyalty apps fail (the core truth)

Here’s the cold reality:

99% of rewards programs are **boring, slow, and meaningless** for customers — and **operationally heavy** for small businesses.

### The key failure reasons:

1. **Points ≠ excitement**
    - Customers don’t value points unless they can *actually use them soon*.
    - “Spend €500 to get a €5 coupon” feels like a joke. Nobody changes behavior for that.
2. **No cross-merchant usability**
    - You get points only for *that* store — and people don’t shop there every week.
    - So balances stay low, rewards feel unreachable, and users forget about them.
3. **Bad UX and too many apps**
    - You need one app per store. People hate that. Nobody wants 20 loyalty apps.
4. **Lack of emotion**
    - People don’t get *emotional* about a slow “1% back” reward.
    - What *does* work is **status, gamification, social proof, or surprise gifts.**
5. **Merchants don’t see ROI**
    - If merchants can’t see sales or returning customers go up, they stop funding the program.
    - Loyalty programs die silently when merchants stop promoting them.