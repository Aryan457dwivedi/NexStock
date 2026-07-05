# kSphere — Inventory Management System

A premium, enterprise-grade inventory management UI built for warehouses, retail, and logistics operations. React + Tailwind, light/dark themes, command palette, and a design language built around operational clarity rather than decoration.

## What's here

- **Dashboard** — Inventory Health panel, Today's Operations, revenue & sales trend chart, activity timeline, low stock alerts, recent orders, top-selling products
- **Products** — Searchable/sortable table, category & status filters, bulk selection, quick-edit drawer, low-stock left-border indicators
- **Orders** — Expandable rows with order timeline, new-order modal, revenue summary strip, status filters
- **Customers** — Profile cards with segmentation tags (VIP/Repeat/New/At risk), spend & order history, purchase analytics
- **Global** — ⌘K command palette, notification center, light/dark theme toggle, collapsible sidebar, fully responsive

## Running it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Connecting to a backend

This UI is built against the FastAPI backend from the companion **Nexus/kSphere Inventory & Order Management System** (`/products/`, `/customers/`, `/orders/`, `/dashboard/stats` endpoints — see that project's own README for setup).

```bash
cp .env.example .env
# edit .env: VITE_API_URL=http://localhost:8000
```

**No backend running?** The app still works — every page falls back to built-in demo data so you can explore the full UI immediately.

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Structure

```
src/
├── components/
│   ├── layout/AppLayout.jsx       # Topbar, sidebar, page shell
│   └── ui/
│       ├── primitives.jsx         # Badge, Btn, Avatar, EmptyState, Skeleton...
│       ├── CommandPalette.jsx     # ⌘K search & quick actions
│       ├── NotificationCenter.jsx # Notification bell dropdown
│       └── Toast.jsx              # Toast notification system
├── lib/
│   ├── api.js                     # Axios client for the backend
│   └── theme.jsx                  # Light/dark theme context
├── pages/
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── Orders.jsx
│   └── Customers.jsx
└── index.css                      # Design tokens (light + dark)
```

## Design tokens

All colors are CSS custom properties in `src/index.css`, themed via `[data-theme="light"|"dark"]` on `<html>`. One accent color (deep instrument-blue) is used sparingly; status colors (ok/warn/danger) stay in their own lane and never mix with the brand accent. See that file to retheme.
