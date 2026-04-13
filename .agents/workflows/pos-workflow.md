---
description:  Retail POS SaaS – AI Agent Workflow Checklist
---

## 🎯 Project Objective

Build a **Multi-Shop POS & Business Management SaaS** with:

* Billing (GST / Non-GST)
* Inventory Control
* Customer & Supplier Management
* Expenses
* Daily / Weekly / Monthly Analytics
* Financial Year Reports
* Multi-shop under one account
* Shop membership / authorization via `shop_id`

Strict Rule:

* Do NOT skip phases.
* Do NOT add features not defined.
* Complete one module fully before starting next.

---

# 🧱 PHASE 1 – REQUIREMENT FREEZE

## ✅ Define Scope

* [x] Single Account → Multiple Shops
* [x] Each shop has isolated data via `shop_id`
* [x] GST toggle per invoice
* [x] Financial year configurable (default: April–March)
* [x] Cloud-only (no offline for MVP)
* [x] hardware integration (barcode printer/scanner)

## ❌ Explicitly Excluded in MVP

* [x] No AI forecasting
* [x] No mobile app
* [x] No payment gateway integration
* [x] No WhatsApp automation

Lock scope before moving forward.

---

# 🏗️ PHASE 2 – SYSTEM ARCHITECTURE DESIGN

## 🧠 Architecture Decision

* [x] Backend: Express (REST API) + JWT
* [x] Frontend: Next.js
* [x] Database: PostgreSQL
* [x] Auth: JWT
* [x] Deployment: Docker (optional)
* [x] Multi-tenant via `shop_id` column

---

## 🗄️ Database Schema Design

Create ER structure BEFORE coding endpoints.

### Core Tables

* [x] users
* [x] shops
* [x] shop_members
* [x] products
* [x] product_categories
* [x] uoms
* [x] inventory_logs
* [ ] customers
* [ ] suppliers
* [ ] invoices
* [ ] invoice_items
* [ ] payments
* [ ] expenses
* [ ] financial_years

Rules:

* Every business table must contain `shop_id`
* Foreign keys enforced
* Soft delete using `is_active`

Do NOT write business logic before schema finalized.

---

# 🔐 PHASE 3 – AUTH & MULTI-SHOP FOUNDATION

## Step 1: Authentication

* [x] Register user
* [x] Login with JWT
* [x] Token refresh
* [x] Password reset

## Step 2: Shop Creation

* [x] User creates first shop
* [x] Add additional shops

---

# 📦 PHASE 4 – INVENTORY MODULE

## Product Management

* [x] Create product
* [x] SKU required
* [x] Create/select product category
* [x] Create/select UOM (unit of measure)
* [x] GST percentage field
* [x] HSN optional
* [x] Opening stock

## Inventory Tracking

* [x] Stock increment on purchase
* [x] Stock decrement on sale
* [x] Maintain stock history log
* [x] Low stock threshold alert flag

Do not connect to billing until inventory fully tested.

---

# 🧾 PHASE 5 – BILLING ENGINE

## Invoice Creation

* [ ] GST toggle
* [ ] Auto invoice numbering per shop
* [ ] Add multiple items
* [ ] Auto tax calculation
* [ ] Discount per item or total
* [ ] Return/refund flag

## Tax Logic

If GST enabled:

* Split CGST/SGST or IGST
  If GST disabled:
* No tax fields calculated

Test with:

* 0% GST
* Mixed GST items
* High quantity items

Invoice must:

* Update inventory
* Create payment entry
* Save tax breakdown

---

# 👥 PHASE 6 – CUSTOMER & SUPPLIER MODULE

## Customer

* [ ] Profile creation
* [ ] Credit limit
* [ ] Ledger view
* [ ] Payment entry
* [ ] Outstanding balance auto-calc

## Supplier

* [ ] Supplier profile
* [ ] Purchase entry
* [ ] Payables tracking
* [ ] Ledger history

Ledger must be transaction-based, not static balance.

---

# 💸 PHASE 7 – EXPENSE TRACKING

* [ ] Expense category
* [ ] Shop linked
* [ ] Date
* [ ] Amount
* [ ] Notes

Expenses must reflect in:

* Monthly analytics
* Profit calculation

---

# 📊 PHASE 8 – ANALYTICS & REPORTING

## Daily Report

* [ ] Total sales
* [ ] Tax collected
* [ ] Expenses
* [ ] Net revenue

## Weekly & Monthly

* [ ] Aggregated sales
* [ ] Top products
* [ ] Outstanding credits
* [ ] Payables

## Financial Year Report

* [ ] Total revenue
* [ ] Total GST collected
* [ ] Total expenses
* [ ] Net profit
* [ ] Export CSV

No advanced charts before backend aggregation verified.

---

# 🧪 PHASE 9 – TESTING

## Unit Testing

* [ ] Tax calculations
* [ ] Inventory updates
* [ ] Ledger balance

## Integration Testing

* [ ] Invoice → Inventory → Ledger flow
* [ ] Multi-shop data isolation

## Security

* [ ] Shop authorization failure handling
* [ ] No cross-shop access
* [ ] SQL injection protection

---

# 🚀 PHASE 10 – DEPLOYMENT

* [ ] Dockerize backend
* [ ] Dockerize frontend
* [ ] Environment variables secured
* [ ] SSL enabled
* [ ] Daily DB backup scheduled

---

# 📈 PHASE 11 – POST-MVP IMPROVEMENT (Optional)

Only after stable production:

* [ ] Subscription billing
* [ ] Hardware integration
* [ ] WhatsApp invoice share
* [ ] Advanced analytics
* [ ] AI restock suggestions

---

# ⚠️ AI AGENT HARD RULES

1. Do NOT invent new features.
2. Do NOT skip schema design.
3. Do NOT write UI before backend stable.
4. Do NOT combine multiple modules in one sprint.
5. Always complete tests before moving phase.
6. Always use `shop_id` isolation.
7. Every financial action must create a ledger entry.

---

# 🧠 Definition of Done (Per Module)

A module is complete only if:

* Database schema finalized
* CRUD APIs tested
* Business logic validated
* Edge cases tested
* Shop authorization verified
* No console errors
* No TODO left in code

---

# 🏁 Final Goal

Deliver:

* Stable multi-tenant POS
* Accurate GST logic
* Clean financial reporting
* Fully isolated shop architecture
* Production-ready deployment

No chaos.
No feature creep.
No hallucinated magic.

Build like an accountant.
Ship like a SaaS founder. 💼🚀
