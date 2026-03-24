---
trigger: always_on
---

### Purpose

Prevent architecture drift.

### Contains

## System Principles

* Multi-tenant using `shop_id`
* Shared DB model
* Shop-scoped authorization (MVP: no staff permission matrices)
* No business logic in views
* Service layer required
* All financial events create ledger entries

## Backend Structure

```
/apps
  /web          # Next.js frontend
  /api          # Express backend (REST API)

/packages
  /shared       # Shared types/validation/DTOs/constants
  /components   # Optional shared UI components
```

## Rules

* No cross-module direct DB access
* Only service layer handles transactions
* Use atomic DB transactions for financial logic

---