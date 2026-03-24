---
trigger: always_on
---

Purpose

Prevent UI inconsistency.

Dashboard Principles

Single shop switch dropdown

Clear financial summary

No hidden actions

Confirmation modal for destructive actions

Data Tables

Always sortable

Always filterable

Always paginated

---

## Frontend UI Stack

Use `shadcn/ui` components with `TailwindCSS` for styling.
Use `lucide-react` icons throughout.
Use `framer-motion` for page transitions, hover effects, and empty/loading states.
Use `@tanstack/react-query` for server state (queries + mutations).
Use `sonner` to show success/error toasts from a global error handler.
Use responsive layout patterns (mobile-first) so the POS is usable on small screens.

---

## App Shell (Common Layout)

All pages must share:

* Left `SideMenu` with navigation links
* Top `Navbar` with:
  * `Shop` select dropdown (`shop_id` context)
  * Primary action buttons: `Add Sale` and `Add Purchase`
  * Optional user avatar/menu on the right

Sidebar behavior:

* The `Shop` dropdown must drive all data queries (shop-scoped requests)
* When shop changes, clear/close any POS draft cart state and refetch shop-scoped lists

---

## Routing / Page Map (Frontend)

Home page is the POS sale entry page:

* `/pos` (Sales entry / POS)
* `/pos/checkout` (Checkout + customer selection + bill)
* `/pos/invoice/[id]` (Invoice view with print option)

Other pages:

* `/inventory` (tabbed views: Products, Low Stock, UOM, Categories)
* `/credit` (tabbed views: Customers Credit Due, Suppliers Credit Due)
* `/credit/customer/[id]` (Customer transaction detail)
* `/credit/supplier/[id]` (Supplier transaction detail)
* `/reports` (financial stats + line graphs)
* `/expenses` (expense management)
* `/purchase` (Purchase entry, similar to Sales entry)
* `/account` (account details + edit)
* `/settings` (current shop details + edit + logout)

---

## Sales POS Page (`/pos`)

Top section:

* Search bar (product search by name/sku/barcode)
* Category filter dropdown
* Barcode scanner control (camera-based scanning)
* Checkout cart button that always shows:
  * Selected item count
  * Current total cost

Product grid section:

* Product cards showing:
  * Product photo
  * Name
  * Price
  * Quantity controls

Quantity control rules:

* Default quantity is `0` for each product
* “Decrease” must never make quantity negative
* “Increase” adds to quantity in the local POS draft cart

Card interactions:

* Scan to find a product and auto-increment its quantity
* Search result click adds/increments quantity

---

## Checkout Page (`/pos/checkout`)

Displayed content:

* List of all selected items with:
  * product name
  * price
  * quantity
  * line total
* Customer selection:
  * Default customer is `Walk-in Customer`
  * Allow customer search/selection
  * Allow “Add new customer” as a modal directly on this page

Bill action:

* `Bill` button performs the full transaction flow:
  * Validate stock based on selected items
  * Record sale transaction
  * Update inventory from the created transaction
  * Create ledger entries and any related financial records
* After success:
  * Navigate to `/pos/invoice/[id]`
  * Provide a print button on the invoice page

---

## Invoice Page (`/pos/invoice/[id]`)

Requirements:

* Show all invoice details (header + line items + totals)
* Show customer details
* Provide “Print” action that renders a print-friendly view
* Do not allow editing a finalized invoice (only backend-supported voiding if applicable)

---

## Inventory Page (`/inventory`)

Use tabbed views:

* Products tab:
  * Filter by category
  * Search by name/sku/barcode
  * Support “low stock” filtering
* UOM tab:
  * Manage UOMs (add/edit)
* Categories tab:
  * Manage product categories (add/edit)
  * Add barcode to a product using camera scanning (camera capture flow)

UX requirements:

* Forms must use `shadcn/ui` components and show validation errors inline
* Destructive actions require confirmation modals

---

## Credit Page (`/credit`)

Tabbed views:

* Customers Credit Due:
  * Show customers with outstanding balance
  * Clicking a customer opens `/credit/customer/[id]`
* Suppliers Credit Due:
  * Show suppliers with payables
  * Clicking a supplier opens `/credit/supplier/[id]`

---

## Credit Detail Pages

On customer/supplier detail pages show:

* Identity header + credit due summary
* Transaction list/table (sales invoices, purchase bills, payments, etc. depending on backend)
* Optional filters for transaction type and date range (if supported)

---

## Reports Page (`/reports`)

Requirements:

* Financial stats cards (total sales, tax collected, expenses, net profit, etc.)
* Line graphs for time-series data (daily/weekly/monthly)
* Graphs must come from backend aggregated endpoints (no heavy client computation)
* Loading skeletons and empty states for every section

---

## Expenses Page (`/expenses`)

Requirements:

* Add expense form
* Expense list table with filters (date range, category)
* Destructive actions require confirmation modal

---

## Purchase Page (`/purchase`)

Must be similar to Sales POS flow:

* Search + category filter + barcode scanning
* Quantity controls with default `0` and non-negative decreases
* Entry/checkout page with supplier selection (and “Add supplier” modal)
* Record purchase transaction, update inventory, and update ledger
* Show receipt/invoice view with print option

---

## Account and Settings

Account (`/account`):

* View user account details
* Provide edit option for editable fields

Settings (`/settings`):

* View current shop details
* Provide edit option for shop profile fields
* Logout button must be visible in sidebar or settings area
