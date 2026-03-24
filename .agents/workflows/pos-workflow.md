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

* [ ] Single Account → Multiple Shops
* [ ] Each shop has isolated data via `shop_id`
* [ ] GST toggle per invoice
* [ ] Financial year configurable (default: April–March)
* [ ] Cloud-only (no offline for MVP)
* [ ] hardware integration (barcode printer/scanner)

## ❌ Explicitly Excluded in MVP

* [ ] No AI forecasting
* [ ] No mobile app
* [ ] No payment gateway integration
* [ ] No WhatsApp automation

Lock scope before moving forward.

---

# 🏗️ PHASE 2 – SYSTEM ARCHITECTURE DESIGN

## 🧠 Architecture Decision

* [ ] Backend: Express (REST API) + JWT
* [ ] Frontend: Next.js
* [ ] Database: PostgreSQL
* [ ] Auth: JWT
* [ ] Deployment: Docker (optional)
* [ ] Multi-tenant via `shop_id` column

---

## 🗄️ Database Schema Design

Create ER structure BEFORE coding endpoints.

### Core Tables

* [ ] users
* [ ] shops
* [ ] shop_members
* [ ] products
* [ ] product_categories
* [ ] uoms
* [ ] inventory_logs
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

* [ ] Register user
* [ ] Login with JWT
* [ ] Token refresh
* [ ] Password reset

## Step 2: Shop Creation

* [ ] User creates first shop
* [ ] Add additional shops

---

# 📦 PHASE 4 – INVENTORY MODULE

## Product Management

* [ ] Create product
* [ ] SKU required
* [ ] Create/select product category
* [ ] Create/select UOM (unit of measure)
* [ ] GST percentage field
* [ ] HSN optional
* [ ] Opening stock

## Inventory Tracking

* [ ] Stock increment on purchase
* [ ] Stock decrement on sale
* [ ] Maintain stock history log
* [ ] Low stock threshold alert flag

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
