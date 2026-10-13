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

The API is mounted at `/api`. JSON success responses use a `{ "data": ... }` envelope. Errors use `{ "error": "..." }`; unexpected errors return a generic message and are logged by the server. Empty collections return `200` with an empty array.

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/api/boards` | List boards | Public |
| `POST` | `/api/boards` | Create a board (`slug`, `name`, optional `bumpLimit`, `maxThreads`) | Session required |
| `GET` | `/api/boards/:slug` | Get board details | Public |
| `GET` | `/api/boards/:slug/threads` | List threads on a board | Public |
| `POST` | `/api/boards/:slug/threads` | Create a thread (`board_id`, `subject`, `message`) | Public |
| `GET` | `/api/boards/:slug/threads/:threadId` | Get a thread | Public |
| `DELETE` | `/api/boards/:slug/threads/:threadId` | Delete a thread | Session required |
| `GET` | `/api/boards/:slug/threads/:threadId/posts` | List posts in a thread | Public |
| `POST` | `/api/boards/:slug/threads/:threadId/posts` | Add a post (`threadId`, `boardId`, `message`) | Public |
| `DELETE` | `/api/boards/:slug/threads/:threadId/posts/:postId` | Delete a post | Session required |
| `GET` | `/api/files/:fileId` | Display an uploaded image | Public |
| `POST` | `/api/auth/signin` | Sign in (`username`, `password`) | Public |
| `GET` | `/api/misc/thread-count` | Return the thread ID sequence's current value | Public |

Protected routes expect a session token in the raw `Authorization` header. Authentication is currently incomplete: the auth service calls moderator and session model methods that are not exported, so sign-in and protected requests may fail. There is no signup route in the current router. The middleware is intended to reject missing or expired sessions with `401`.

The route handlers currently use IDs from request bodies or paths without consistently checking that they belong to the board and thread named in the URL. Board-scoped moderator authorization and request validation are also not implemented. The thread count reports the sequence value, which can include IDs of deleted threads.

## Project layout

- `server.js`, `app.js`: load configuration, middleware, routes, and start Express.
- `routes/`, `controllers/`: API routing and request handlers.
- `models/`, `services/`: database queries and authentication helpers.
- `middleware/`: moderator session checks and poster IP hashing.
- `configs/dbConfig.js`: PostgreSQL connection pool.
- `docker-compose.yml`: PostgreSQL and pgAdmin services.
- `../docs/db.sql`: database schema; `../docs/er.png` shows the relationships.

## Current limitations

- Request validation, rate limiting, and sign-out are not implemented.
- Authentication is not fully wired to the current models, as described above.
- Passwords are currently hashed with SHA-256; replace this with a password hashing algorithm designed for passwords before deployment.
- Image uploads are stored in MinIO and served through `/api/files/:fileId`. Only JPEG, PNG, GIF, WebP, and AVIF files are displayed.
- Thread and post creation does not yet enforce board limits, thread lock state, or thread bump updates.
