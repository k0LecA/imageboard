# Imageboard backend

Express API for boards, threads, posts, moderator accounts, and sessions. PostgreSQL stores application data; MinIO stores uploaded images. Poster IP addresses are HMAC-hashed before they are stored with posts.

## Requirements

- Node.js with ES module support
- Docker Compose, for PostgreSQL, pgAdmin, and MinIO

## Setup

Run these commands from the `backend` directory.

1. Copy `../.env.example` to `../.env` for Docker Compose and `.env.example` to `.env` for the API. Database and MinIO credentials must match across the files. The backend template sets `PORT=8080` to match the frontend's current API URL.
2. Start PostgreSQL and MinIO:

   ```sh
   docker compose up -d database minio
   ```

3. Apply the schema from the repository root:

   ```sh
   set -a
   . ./.env
   set +a
   psql "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$DB_HOST:$DB_PORT/$POSTGRES_DB" -f ../docs/db.sql
   ```

   The schema is not applied automatically by Compose.
4. Install dependencies and run the API:

   ```sh
   pnpm install
   pnpm dev
   ```

The API initializes the MinIO bucket on startup. Start pgAdmin as well with `docker compose up -d` if you want the database UI.

### Backend environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Optional API port (defaults to `3000`) |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `DB_HOST` | Database hostname accessible from the API |
| `DB_PORT` | Host-side PostgreSQL port |
| `HASH_SECRET` | Secret used to HMAC-hash poster IP addresses |
| `MINIO_HOST` | MinIO hostname accessible from the API |
| `MINIO_API_PORT` | MinIO API port (normally `9000`) |
| `MINIO_ROOT_USER` | MinIO access key |
| `MINIO_ROOT_PASSWORD` | MinIO secret key |
| `MINIO_BUCKET_NAME` | Image bucket (defaults to `imageboard`) |
| `STORAGE_USE_SSL` | Use TLS for MinIO (`true` or `false`) |

pgAdmin settings, the MinIO console port, and Docker bind addresses are configured in the root `.env`.

Use long, random values for `HASH_SECRET` and MinIO credentials. Keep `.env` private. When the API runs inside a container on the Compose network, use the MinIO service name `minio` as its hostname; the included Compose file currently starts infrastructure services, not the API container.

## Tests

Tests use Vitest and run from the `backend` directory:

```sh
pnpm test
```

The Vitest configuration loads `backend/.env.test` before the PostgreSQL pool is imported and runs the unit and integration projects without file parallelism. `.env.test` is ignored by Git; it must configure the isolated test database as `app_test` on `127.0.0.1:5433`.

Start the test database from the repository root, then run the suite:

```sh
docker compose up -d database-test
cd backend
pnpm test
```

`database-test` uses PostgreSQL 18, the schema in `db/001-initial-schema.sql`, and temporary container storage. It does not mount `db-data`. The schema script runs only when PostgreSQL initializes its data directory; this service's temporary storage is recreated with the container. Do not change the test environment to point at the development database.

Current coverage is limited: `tests/integration/boards.test.js` makes real PostgreSQL queries and checks the expected database name before creating a uniquely named board, then deletes it. `tests/integration/threads.test.js` is currently a mocked model test and does not connect to PostgreSQL. `tests/unit/threads.test.js` tests the controller with a mocked model. The integration suite does not yet exercise the other models or cover the full set of CRUD and constraint cases.

## API

The API is mounted at `/api`. Successful JSON responses use `{ "data": ... }`; errors use `{ "error": "..." }`. Empty collections return `200` with an empty array.

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/api/boards` | List boards | Public |
| `POST` | `/api/boards` | Create a board (`slug`, `name`, optional `bumpLimit`, `maxThreads`) | Session required |
| `GET` | `/api/boards/:slug` | Get board details | Public |
| `GET` | `/api/boards/:slug/threads` | List threads on a board | Public |
| `POST` | `/api/boards/:slug/threads` | Create a thread and its first post | Public, multipart form |
| `GET` | `/api/boards/:slug/threads/:threadId` | Get a thread | Public |
| `DELETE` | `/api/boards/:slug/threads/:threadId` | Delete a thread | Session required |
| `GET` | `/api/boards/:slug/threads/:threadId/posts` | List posts in a thread | Public |
| `POST` | `/api/boards/:slug/threads/:threadId/posts` | Add a post | Public, multipart form |
| `DELETE` | `/api/boards/:slug/threads/:threadId/posts/:postId` | Delete a post | Session required |
| `GET` | `/api/files/:fileId` | Display an uploaded image | Public |
| `POST` | `/api/auth/signin` | Sign in (`username`, `password`) | Public |
| `GET` | `/api/misc/thread-count` | Return the thread ID sequence's current value | Public |

Thread creation expects `board_id`, `subject`, and `message` fields, plus up to four image files under the repeated `files` field. It returns `{ "data": { "threadId": ... } }`. Adding a post expects `boardId` and `message`, plus an optional image in the `file` field. It returns the created post as `{ "data": ... }`. Supported images displayed by the files endpoint are JPEG, PNG, GIF, WebP, and AVIF.

Protected routes expect a session token in the raw `Authorization` header. Authentication is currently incomplete: the auth service calls model methods with names and arguments that do not match the exported model functions, and there is no signup route in the router. The middleware is intended to reject missing or expired sessions with `401`.

The route handlers do not consistently verify that IDs belong to the board or thread named in the URL. Board-scoped moderator authorization and request validation are not implemented. The thread count reports the sequence value, which can include IDs of deleted threads.

## Project layout

- `server.js`, `app.js`: configuration, MinIO startup, middleware, routes, and Express app.
- `routes/`, `controllers/`: API routing and request handlers.
- `models/`, `services/`: database queries, image storage, and authentication helpers.
- `middleware/`: session checks, IP hashing, and multipart upload handling.
- `configs/`: PostgreSQL and MinIO clients and bucket initialization.
- `docker-compose.yml`: PostgreSQL, pgAdmin, and MinIO services.
- `../docs/db.sql`: database schema; `../docs/er.png` shows the relationships.

## Current limitations

- Request validation, rate limiting, and sign-out are not implemented.
- Authentication is not fully wired to the current models, as described above.
- Passwords are hashed with SHA-256; use a password hashing algorithm designed for passwords before deployment.
- Thread and post creation does not enforce board limits, thread lock state, or thread bump updates.
- The schema includes board banner metadata, ordered board rules, reports, bans, and moderation audit actions. Their upload, management, and moderation API workflows are not implemented yet.
