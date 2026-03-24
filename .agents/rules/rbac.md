---
trigger: always_on
---

### Purpose

Stop permission chaos.

MVP authorization model (no staff permission matrices):

* Every request is scoped to `shop_id`
* API + service layer must verify the authenticated user is a member of that shop
* AuthZ failure returns a controlled error response (never raw DB errors)

Rule:
Permission must be checked at:

* API level
* Service level

Double lock.

---
