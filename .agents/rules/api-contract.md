---
trigger: always_on
---

### Purpose

Prevent breaking frontend every sprint.

## Rules

* All responses follow format:

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

* No raw DB errors returned
* Pagination required for list APIs
* Filtering must always include `shop_id`

## Versioning

All APIs must be prefixed:

```
/api/v1/
```

No silent contract change.

---
