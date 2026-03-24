---
description: DB Schema Draft + API Route Map + Clean Folder Structure + SaaS Monetization Architecture
---

# 🗄️ 1️⃣ DATABASE SCHEMA 

All business tables MUST include:

```
id (UUID)
shop_id (UUID, FK)
created_at
updated_at
is_active (boolean)
```

---

## 👤 USERS

```
users
- id
- email (unique)
- password_hash
- full_name
- phone
- is_verified
- created_at
- updated_at
```

---

## 🏪 SHOPS

```
shops
- id
- owner_id (FK users)
- name
- gst_number
- address
- financial_year_start_month (default: 4)
- created_at
- updated_at
```

---

## 🏷️ PRODUCT CATEGORIES

```
product_categories
- id
- shop_id
- name
- description
- created_at
- updated_at
- is_active
```

---

## 📏 UOM (UNIT OF MEASURE)

```
uoms
- id
- shop_id
- name (e.g. Piece, Kilogram)
- symbol (e.g. pcs, kg)
- created_at
- updated_at
- is_active
```

---

## 📦 PRODUCTS

```
products
- id
- shop_id
- name
- sku (unique per shop)
- category_id (FK product_categories)
- uom_id (FK uoms)
- gst_percentage
- hsn_code
- selling_price
- purchase_price
- low_stock_threshold
- created_at
- updated_at
- is_active
```

---

## 📊 INVENTORY LOGS (Append Only)

```
inventory_logs
- id
- shop_id
- product_id
- uom_id (FK uoms)
- change_type (sale, purchase, adjustment)
- quantity_change
- reference_id (invoice_id or purchase_id)
- created_at
```

Never store stock directly. Always calculate from logs or maintain cached stock field.

---

## 🧾 INVOICES

```
invoices
- id
- shop_id
- invoice_number (unique per shop)
- customer_id
- gst_enabled (boolean)
- subtotal
- total_tax
- total_amount
- payment_status (paid, partial, unpaid)
- status (active, voided)
- created_at
```

---

## 🧾 INVOICE ITEMS

```
invoice_items
- id
- invoice_id
- product_id
- uom_id (FK uoms)
- quantity
- price
- gst_percentage
- tax_amount
- total
```

---

## 💰 PAYMENTS

```
payments
- id
- shop_id
- reference_type (invoice, salary, expense)
- reference_id
- amount
- mode (cash, upi, bank)
- created_at
```

---

## 👥 CUSTOMERS

```
customers
- id
- shop_id
- name
- phone
- credit_limit
- created_at
```

---

## 🚚 SUPPLIERS

```
suppliers
- id
- shop_id
- name
- phone
- created_at
```

---

## 📖 LEDGER ENTRIES (SOURCE OF TRUTH)

```
ledger_entries
- id
- shop_id
- entity_type (customer, supplier, expense, salary)
- entity_id
- debit
- credit
- reference_type
- reference_id
- created_at
```

Never store balance. Always compute.

---

## 💸 EXPENSES

```
expenses
- id
- shop_id
- category
- amount
- description
- created_at
```

---

# 🌐 2️⃣ API ROUTE MAP

All routes prefixed:

```
/api/v1/
```

---

## 🔐 Auth

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/reset-password
```

---

## 🏪 Shops

```
POST   /shops/
GET    /shops/
GET    /shops/{id}
```

---

## 📦 Products

```
POST   /products/
GET    /products/
PUT    /products/{id}
DELETE /products/{id}
```

---

## 🏷️ Product Categories

```
POST   /product-categories/
GET    /product-categories/
PUT    /product-categories/{id}
DELETE /product-categories/{id}
```

---

## 📏 UOMs

```
POST   /uoms/
GET    /uoms/
PUT    /uoms/{id}
DELETE /uoms/{id}
```

---

## 🧾 Billing

```
POST   /invoices/
GET    /invoices/
GET    /invoices/{id}
POST   /invoices/{id}/void
```

---

## 👥 Customers

```
POST   /customers/
GET    /customers/
GET    /customers/{id}/ledger
POST   /customers/{id}/payment
```

---

## 📊 Reports

```
GET /reports/daily
GET /reports/monthly
GET /reports/financial-year
```

All reports must require `shop_id` context.

---

# 🧱 3️⃣ CLEAN FOLDER STRUCTURE

```
dukaandari/
  apps/
    web/              # Next.js frontend
    api/              # Express backend (REST API)
  packages/
    shared/           # Shared types/validation/DTOs (Node + Web)
    components/       # Reusable React components (if shared)
    utils/            # Shared non-UI utilities (optional)
  tooling/
  scripts/
```

Business logic → service layer in `apps/api/`
Shop membership / authorization helpers → `packages/shared/permissions/` (or `apps/api/` if preferred)

Views should be thin.

---

# 💳 4️⃣ SaaS MONETIZATION ARCHITECTURE

Now we print money 💰

---

## 🪙 Subscription Tables

```
plans
- id
- name
- price
- max_shops
- features_json

subscriptions
- id
- user_id
- plan_id
- start_date
- end_date
- status
```

---

## Plan Enforcement Logic

Before:

* Creating shop → check max_shops
* Accessing analytics → check feature flag

---

## Suggested Plans

Starter

* 1 shop
* Basic reports

Growth

* 3 shops
* Full reports

Business

* Unlimited shops
* Advanced analytics

---

# 🧠 SYSTEM PRINCIPLES

1. Ledger is truth.
2. Inventory is log-driven.
3. No hard delete of financial records.
4. shop_id isolation mandatory.
5. Every financial action wrapped in DB transaction.
6. Test before feature expansion.

---