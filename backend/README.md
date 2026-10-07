# Imageboard backend

Express API for the imageboard project. It uses PostgreSQL for boards, threads, posts, moderator accounts, and sessions. The API currently stores hashed poster IPs with posts; image upload and storage are not implemented yet.

## Requirements

- Node.js (ES modules supported)
- Docker Compose, for the included PostgreSQL and pgAdmin services

## Setup

Run these commands from the `backend` directory.

1. Copy `.env.example` to `.env` and fill in the database, pgAdmin, and `HASH_SECRET` values. Leave `PORT` blank to use the default port `3000`.
2. Start PostgreSQL with `docker compose up -d database`.
3. Apply the schema from the repository root:

   ```sh
   psql "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$DB_HOST:$DB_PORT/$POSTGRES_DB" -f ../docs/db.sql
   ```

   Load the `.env` values into your shell before running `psql`:

   ```sh
   set -a
   . ./.env
   set +a
   ```

   The schema is not applied automatically by Compose.
4. Install dependencies and run the API:

   ```sh
   npm install
   npm run dev
   ```

The API listens on port `3000` by default. Set `PORT` to change it. Start pgAdmin too with `docker compose up -d` if you want the database UI.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `DB_HOST` | Database host; also used as the host-side bind address in Compose |
| `DB_PORT` | Database port; also used as the host-side port in Compose |
| `HASH_SECRET` | Secret key used to HMAC-hash poster IP addresses |
| `PGADMIN_HOST` | Host-side bind address for pgAdmin |
| `PGADMIN_PORT` | Host-side port for pgAdmin |
| `PGADMIN_DEFAULT_EMAIL` | pgAdmin login email |
| `PGADMIN_DEFAULT_PASSWORD` | pgAdmin login password |
| `PORT` | Optional API listening port (defaults to `3000`) |

Use a long, random `HASH_SECRET`. Keep `.env` private. When the API runs directly on your machine, `DB_HOST` should generally be `127.0.0.1`; when the API runs in a container on the Compose network, use the service name `database`.

## API

All request and response bodies use JSON except where noted. Routes that create threads or posts are public. Moderator-protected routes expect the session UUID returned by sign-in as the raw `Authorization` header value.

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/` | List boards | Public |
| `POST` | `/` | Create a board (`slug`, `name`, optional `bumpLimit`, `maxThreads`) | Moderator |
| `GET` | `/:slug` | List threads on a board | Public |
| `POST` | `/:slug` | Create a thread (`board_id`, `subject`, `message`) | Public |
| `DELETE` | `/:slug/:threadId` | Delete a thread | Moderator |
| `GET` | `/:slug/:threadId` | List posts in a thread | Public |
| `POST` | `/:slug/:threadId` | Add a post (`threadId`, `board_id`, `message`) | Public |
| `DELETE` | `/:slug/:threadId/:postId` | Delete a post | Moderator |
| `POST` | `/auth/signup` | Create a moderator (`username`, `password`) | Public |
| `POST` | `/auth/signin` | Sign in (`username`, `password`) | Public |
| `GET` | `/threadCount` | Return the thread ID sequence's current value | Public |

Sign-in returns a `sessionToken` UUID and an `expiresAt` timestamp. For example, send `Authorization: <sessionToken>` on protected requests. Sessions are created with a seven-day expiry, though the current authentication middleware checks that the session exists and does not enforce `expires_at`.

Thread and post IDs are looked up/deleted by ID in their current handlers; route `slug` values are used to list threads but are not checked by the delete handlers. The `threadCount` endpoint reports the sequence value, which can include IDs of deleted threads.

## Project layout

- `server.js`, `app.js`: load configuration, middleware, routes, and start Express.
- `routes/`, `controllers/`: API routing and request handlers.
- `models/`, `services/`: database queries and authentication helpers.
- `middleware/`: moderator session checks and poster IP hashing.
- `configs/dbConfig.js`: PostgreSQL connection pool.
- `docker-compose.yml`: PostgreSQL and pgAdmin services.
- `../docs/db.sql`: database schema; `../docs/er.png` shows the relationships.

## Current limitations

- There is no input validation, rate limiting, sign-out endpoint, or session expiry enforcement.
- Passwords are currently hashed with SHA-256; this should be replaced with a password hashing algorithm designed for passwords before deployment.
- File metadata tables exist, but upload and image serving are not implemented.
- Board lookup by slug is not currently exposed as a dedicated route.
