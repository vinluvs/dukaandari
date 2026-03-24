---
trigger: always_on
---

### Purpose

Protect math from becoming Bollywood fiction 🎬

## Tax Rules

* GST toggle per invoice
* IGST if interstate
* CGST/SGST if intrastate
* Tax rounding to 2 decimals

## Invoice Flow

Create Invoice →

* Validate stock
* Calculate totals
* Create ledger entry
* Reduce inventory
* Save tax breakdown
* Create payment record

If any step fails → rollback transaction.

---

