# kSphere — Inventory & Order Management System

A full-stack inventory, order, and customer management platform. FastAPI + PostgreSQL backend, a premium React/Tailwind frontend with light/dark themes and a command palette, all containerized with Docker Compose.

This is the merged project: the original **Nexus** backend (still the same working API) paired with the redesigned **kSphere** frontend that replaced the earlier UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12 + FastAPI |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | PostgreSQL 16 |
| Containerization | Docker + Docker Compose |

## Quick start

```bash
docker compose up --build
```

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:8000**
- API docs (Swagger): **http://localhost:8000/docs**

No `.env` file is required to start — sensible defaults are baked into `docker-compose.yml`. Copy `.env.example` to `.env` only if you want to override credentials or point the frontend at a different backend URL.

The frontend works immediately even before any data exists — every page falls back to built-in demo data if the API returns nothing, so the UI is always explorable.

## Project structure

```
ksphere/
├── backend/                 FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── main.py          App entrypoint, CORS, dashboard stats endpoint
│   │   ├── database.py      SQLAlchemy engine/session
│   │   ├── models/          ORM models (Product, Customer, Order, OrderItem)
│   │   ├── schemas/         Pydantic request/response validation
│   │   └── routes/          /products, /customers, /orders endpoints
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                 React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/AppLayout.jsx        Topbar, sidebar, page shell
│   │   │   └── ui/                          Badge, Button, CommandPalette,
│   │   │                                    NotificationCenter, Toast, etc.
│   │   ├── lib/
│   │   │   ├── api.js        Axios client
│   │   │   └── theme.jsx     Light/dark theme context
│   │   ├── pages/            Dashboard, Products, Orders, Customers
│   │   └── index.css         Design tokens (light + dark)
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
└── .env.example
```

## Features

- **Dashboard** — Inventory Health panel, Today's Operations, revenue & sales trend, activity timeline, low-stock alerts, recent orders, top-selling products
- **Products** — Sortable/searchable table, category & status filters, bulk selection, quick-edit drawer, SKU badges, low-stock indicators
- **Orders** — Expandable rows with order timeline, new-order modal with live stock validation, revenue summary
- **Customers** — Segmentation tags (VIP / Repeat / New / At risk), spend & order history
- **Global** — ⌘K command palette, notification center, light/dark theme toggle, collapsible sidebar, fully responsive

## Business logic (backend)

- SKU and customer email uniqueness enforced
- Orders rejected if requested quantity exceeds available stock
- Placing an order atomically deducts stock; cancelling restores it
- Order totals calculated server-side from current product prices, never trusted from the client

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST/GET/PUT/DELETE | `/products/`, `/products/{id}` | Product CRUD |
| POST/GET/DELETE | `/customers/`, `/customers/{id}` | Customer CRUD |
| POST/GET/DELETE | `/orders/`, `/orders/{id}` | Order placement, retrieval, cancellation |
| GET | `/dashboard/stats` | Summary stats + low-stock list |

Full interactive docs at `/docs` once the backend is running.

## Local development without Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt --break-system-packages
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

By default the frontend dev server calls a relative `/products/` etc. path. To point it at a locally-running backend instead, create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

## Deployment

### Backend → Railway
1. Push to GitHub, create a Railway project from the repo, root directory `backend`
2. Add a PostgreSQL plugin, set `DATABASE_URL=${{Postgres.DATABASE_URL}}`
3. Note the generated backend URL

### Frontend → Vercel
1. Import the repo, root directory `frontend`
2. Framework preset: Vite
3. Environment variable: `VITE_API_URL=https://YOUR-BACKEND-URL.up.railway.app`

### Docker Hub (backend image)
```bash
docker build -t YOUR_DOCKERHUB_USERNAME/ksphere-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/ksphere-backend:latest
```
