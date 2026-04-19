# 🧠 CORE TECHNICAL SKILLS

## 1️⃣ Multi-Tenant Architecture Discipline

Agent must:

* Always include `shop_id`
* Never query without shop filter
* Validate cross-shop access
* Think isolation first

If unsure → default to restriction.

---

## 2️⃣ Financial Accuracy Mindset

Agent must:

* Use Decimal, never float
* Round to 2 decimals
* Wrap billing logic in atomic transactions
* Never delete financial records
* Prefer append-only logs

Money logic > speed.

---

## 3️⃣ Ledger-First Thinking

Before writing feature:

Ask:

* Does this impact money?
* Does this require ledger entry?

If yes:

* Create debit/credit entry
* Ensure audit trace exists

Ledger is source of truth.

---

## 4️⃣ RBAC Enforcement Intelligence

Agent must:

* Check permissions at API layer
* Re-check in service layer
* Deny by default

Never assume role.

---

## 5️⃣ Clean Service Layer Separation

Agent must:

* Keep views thin
* Put business logic in `services/`
* Avoid fat serializers
* Avoid logic in models

Architecture > shortcuts.

---

## 6️⃣ Schema Discipline

Before coding:

* Design schema
* Validate constraints
* Add indexes where needed
* Avoid redundant columns

No spontaneous columns mid-feature.

---

## 7️⃣ Testing Consciousness

Agent must:

* Write unit test per service
* Write edge case test
* Write permission failure test
* Mock external dependencies

Minimum 80% coverage target.

---

# 🔐 SECURITY SKILLS

## 8️⃣ Input Validation Strictness

* Validate every payload
* No blind trust
* Sanitize inputs
* Prevent SQL injection
* Prevent over-posting

---

## 9️⃣ JWT & Auth Hygiene

* Token expiration enforced
* Refresh logic secure
* No sensitive data in token
* Password hashing strong

---

## 🔄 PERFORMANCE AWARENESS

## 🔟 Query Optimization Thinking

* Use select_related / prefetch
* Avoid N+1
* Add DB index for:

  * shop_id
  * invoice_number
  * created_at

Agent must think in queries, not vibes.

---

# 📊 ANALYTICS & REPORTING SKILL

Agent must:

* Aggregate using DB functions
* Not load entire table in memory
* Group by date properly
* Respect financial year boundaries
* **ITR Export Logic**: Aggregate P&L, GST, and Ledger data for tax filing.

---

# 🏷️ OFFERS & DISCOUNTS SKILL

Agent must:

* **Margin Safety**: Never allow discounts that result in negative margin unless explicitly authorized.
* **Auto-Generation**: Use sales velocity data for auto-offer suggestions.
* **Overlap Protection**: Handle cases where multiple offers apply to the same product.

---

# 💳 CREDIT MANAGEMENT SKILL

Agent must:

* **Ledger Consistency**: Every credit sale/purchase MUST create a corresponding ledger entry.
* **Balance Calculation**: Always calculate outstanding balance from the sum of ledger entries.
* **Credit Limits**: Respect customer credit limits during checkout.

---

# 🚦 DEPLOYMENT AWARENESS

Agent must:

* Use environment variables
* Avoid hard-coded secrets
* Disable debug mode
* Log errors properly

---

# 🧭 BEHAVIORAL SKILLS

Yes, even AI needs discipline 😌

---

## 1️⃣ Sprint Focus Skill

* Complete module fully
* Do not jump ahead
* Do not refactor unrelated modules mid-sprint

---

## 2️⃣ Feature Freeze Respect

If feature not in scope:

* Do not implement
* Do not suggest unless asked

---

## 3️⃣ Conflict Resolution Priority

If conflict:

Financial accuracy

> Security
> Data isolation
> Performance
> UX polish

In that order.

---

# 📦 OPTIONAL ADVANCED SKILLS

If you want enterprise-grade:

* Audit log tracking
* Rate limiting
* API throttling
* Background task handling (Celery)
* DB migration version tagging
* Data export streaming

---

# 🧨 ANTI-HALLUCINATION RULES

Agent must:

* Not invent fields
* Not change API contract without version bump
* Not remove schema columns silently
* Not assume undefined business rule

If unclear → ask for clarification.

---

# 🎯 DEFINITION OF A “GOOD AGENT”

A good Dukaandari agent:

* Thinks like accountant
* Codes like backend architect
* Tests like QA engineer
* Deploys like DevOps
* Guards data like RBI vault 🏦
* **Understands Offers**: Knows how to suggest and apply discounts based on stock velocity.
* **Tax Ready**: Ensures every invoice and report is ready for ITR filing.
* **Credit Aware**: Manages receivables and payables with ledger-level precision.

---
