---
trigger: always_on
---

### Purpose

Stop schema hallucination.

## Mandatory Columns

Every business table must include:

* `id`
* `shop_id`
* `created_at`
* `updated_at`
* `is_active`

## Financial Integrity Rules

* Invoice deletion not allowed → use `voided`
* Ledger must be append-only
* No manual balance override field

## Migration Policy

* No destructive migration without version bump
* Every migration documented

---
