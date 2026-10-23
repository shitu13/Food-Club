# Food Club API

Express 5 + MongoDB (Mongoose) REST API for the Food Club restaurant website.
Handles staff login (JWT), manager accounts and the dish menu.

## Quick start

```bash
cd backend
npm install
cp .env.example .env      # then edit the values (see below)
npm run dev               # http://localhost:5000
```

On first start the API creates the **super admin** from `SUPERADMIN_NAME`,
`SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` (it does nothing if that email already exists).
You can also run it by hand with `npm run seed:superadmin`.

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | no | `development` (default), `production` or `test` |
| `PORT` | no | Port to listen on (default `5000`; Render sets it for you) |
| `TRUST_PROXY` | no | Number of proxies in front of the app (default `1`, correct for Render) |
| `MONGODB_URI` | yes | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | yes | Random string, at least 32 characters |
| `JWT_EXPIRES_IN` | no | Token lifetime, e.g. `12h` (default) |
| `BCRYPT_ROUNDS` | no | Password hashing cost (default `12`) |
| `CLIENT_URL` | no (set in production) | Frontend origin(s) allowed by CORS, comma separated, e.g. `http://localhost:5173` |
| `SUPERADMIN_NAME` / `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` | first run | Creates the first super admin |

The app validates these at startup and refuses to boot with a clear message if something is wrong.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start with auto-restart |
| `npm start` | Start for production |
| `npm run seed:superadmin` | Create the super admin from env and exit |
| `npm test` | API tests (see note below) |

> The tests run the real routes, validation and Mongoose models against an in-memory
> stand-in for the database, so they need no MongoDB. They do not replace trying the
> API once against your real database.

## Structure

```
src/
  app.js            Express app (middleware, routes)
  server.js         Boot: env, DB, super admin, listen, graceful shutdown
  config/           env validation, DB connection
  constants/        roles, dish categories/menus
  controllers/      request handlers
  middleware/       auth, validate, rate limiters, 404, error handler
  models/           User, Dish
  routes/           one file per resource + index
  scripts/          seedSuperAdmin
  services/         superAdmin bootstrap
  utils/            ApiError, logger, token, query helpers
  validators/       zod schemas
tests/              node:test API tests
```

## API

Base path: `/api/v1`. Send `Authorization: Bearer <token>` on protected routes.

Success: `{ "success": true, "data": { ... } }`
Error: `{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "..." }] }`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | public | Health check |
| POST | `/auth/login` | public | Email + password → token and user |
| GET | `/auth/me` | any staff | Current user |
| PATCH | `/auth/password` | any staff | Change own password (invalidates old tokens) |
| GET | `/users` | super admin | List managers (`search`, `isActive`, `page`, `limit`) |
| POST | `/users` | super admin | Create a manager |
| PATCH | `/users/:id` | super admin | Edit name, phone, active state |
| PATCH | `/users/:id/password` | super admin | Reset a manager's password |
| DELETE | `/users/:id` | super admin | Delete a manager |
| GET | `/dishes` | public | List dishes (`search`, `category`, `menu`, `isAvailable`, `page`, `limit`). Visitors only see available dishes |
| GET | `/dishes/:id` | public | One dish |
| POST | `/dishes` | super admin | Add a dish |
| PATCH | `/dishes/:id` | super admin | Edit a dish |
| DELETE | `/dishes/:id` | super admin | Delete a dish |
| GET | `/stats` | super admin | Counts for the dashboard |

To let managers edit dishes too, add `ROLES.MANAGER` to the `authorize(...)` calls in
`src/routes/dish.routes.js`.

## Security notes

- Passwords are hashed with bcrypt; they are never returned by the API.
- JWTs carry a `tokenVersion`. Changing or resetting a password, or deactivating a user, immediately invalidates their existing tokens.
- Helmet, CORS allow-list, request body size limit, rate limiting (failed logins are limited more strictly).
- Input is validated with zod; unknown fields (such as `role`) are stripped.
- Remove `SUPERADMIN_PASSWORD` from your environment after the first successful boot.
- Dish photos are stored as URLs only. Render's disk is ephemeral, so use an image host (e.g. Cloudinary) when you add uploads.

## Deploying to Render

1. Create a MongoDB Atlas cluster, a database user, and allow network access (`0.0.0.0/0` works on Render's free plan).
2. New **Web Service** from your repo with **Root Directory** `backend`.
3. Build command `npm install`, start command `npm start`, health check path `/api/v1/health`.
4. Set the environment variables above: `NODE_ENV=production`, `TRUST_PROXY=1`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your deployed frontend URL, no trailing slash), and the `SUPERADMIN_*` values.
5. On the frontend, set `VITE_API_URL=https://<your-api>.onrender.com/api/v1` and add an SPA rewrite rule (`/*` → `/index.html`) so `/login` and `/dashboard` work on refresh.

The free plan sleeps when idle, so the first request after a pause can take about a minute.
