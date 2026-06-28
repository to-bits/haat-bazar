# Haat-Bazar Frontend

React + Vite SPA that talks to the Spring Boot microservices through the API gateway on `http://localhost:8080`.

## Requirements

- **Node.js ≥ 18** and **npm** on your `PATH`
- Backend services running (see below)

## Install & run

```bash
cd frontend
npm install          # one-time, installs react, vite, axios, react-router
npm run dev          # http://localhost:5173  ← open this in your browser
```

Other scripts:

```bash
npm run build        # production bundle in dist/
npm run preview      # serve the production bundle
```

## Backend must be running first

The Vite dev server proxies every `/api/**` request to `http://localhost:8080` (the gateway), so start your services in this order:

1. **Eureka server** — `http://localhost:8761`
2. **auth-service** — registered as `AUTH-SERVICE`
3. **product-service** — registered as `PRODUCT-SERVICE`
4. **order-service** — registered as `ORDER-SERVICE`
5. **payment-service** — registered as `PAYMENT-SERVICE`
6. **api-gateway** — `http://localhost:8080` (last so all routes resolve)

Confirm they all show up in Eureka (`http://localhost:8761`) before opening the UI.

## Quick smoke test in the UI

1. Open `http://localhost:5173`
2. Click **Register** → create an account, pick role `SELLER` (or `ADMIN`) for the first user so you can manage products/categories/inventory. Create a second account with role `CUSTOMER` to test buying.
3. **Login** → you'll land on the home page.
4. As **SELLER**: go to **Categories** → add one (e.g. `Vegetables`). Then go to **Products** → add a product under that category (price, stock). Then **Inventory** → set stock levels or reduce.
5. **Logout**, then **login as CUSTOMER**. Go to **Products** → click a product → **Add to cart**. Open **Cart** → **Proceed to checkout** → pick `CARD` / `BKASH` / `NAGAD` → **Pay & place order**.
6. The order detail page should show `status: PAID` and the inventory for that product should be decremented.

## Features

- Register / Login (JWT stored in `localStorage`)
- Role-aware UI: SELLER/ADMIN can manage products, categories, and inventory
- Browse products, view detail, add to cart
- Cart, checkout (CARD / BKASH / NAGAD), order list + detail
- Payment processing against `payment-service`
- Inventory dashboard (SELLER/ADMIN)
- Categories CRUD (SELLER/ADMIN)

See `API-DOC.md` at the repo root for the underlying endpoint contracts.

## Troubleshooting

- **CORS / network errors in the browser** → backend is not running, or the gateway is not on `:8080`. The dev proxy cannot forward if the gateway is down.
- **`401 Unauthorized`** → JWT expired or not present. Log out and log back in.
- **Empty product list** → product-service hasn't registered in Eureka yet. Wait a few seconds and refresh.
- **Port 5173 already in use** → Vite will offer to use another port, or run `npm run dev -- --port 5174`.