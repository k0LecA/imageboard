# Imageboard backend

Express API for boards, threads, posts, moderator accounts, and sessions. PostgreSQL stores application data; MinIO stores uploaded images. Poster IP addresses are HMAC-hashed before they are stored with posts.

## Requirements

- Node.js with ES module support
- Docker Compose, for PostgreSQL, pgAdmin, and MinIO

## Setup

Run these commands from the `backend` directory.

1. Copy `.env.example` to `.env` and fill in the database, pgAdmin, and `HASH_SECRET` values. Also set the MinIO values listed below. Set `PORT=8080` to match the frontend's current API URL; the API otherwise defaults to port `3000`.
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
   npm install
   npm run dev
   ```

The API initializes the MinIO bucket on startup. Start pgAdmin as well with `docker compose up -d` if you want the database UI.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Optional API port (defaults to `3000`) |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `DB_HOST` | Host-side database bind address and API database hostname |
| `DB_PORT` | Host-side PostgreSQL port |
| `HASH_SECRET` | Secret used to HMAC-hash poster IP addresses |
| `PGADMIN_HOST` | Host-side pgAdmin bind address |
| `PGADMIN_PORT` | Host-side pgAdmin port |
| `PGADMIN_DEFAULT_EMAIL` | pgAdmin login email |
| `PGADMIN_DEFAULT_PASSWORD` | pgAdmin login password |
| `MINIO_HOST` | MinIO host and Compose bind address; use `localhost` when API runs on the host |
| `MINIO_API_PORT` | MinIO API port (normally `9000`) |
| `MINIO_CONSOLE_PORT` | MinIO console port (normally `9001`) |
| `MINIO_ROOT_USER` | MinIO access key |
| `MINIO_ROOT_PASSWORD` | MinIO secret key |
| `MINIO_BUCKET_NAME` | Image bucket (defaults to `imageboard`) |
| `STORAGE_USE_SSL` | Use TLS for MinIO (`true` or `false`) |

Use long, random values for `HASH_SECRET` and MinIO credentials. Keep `.env` private. When the API runs inside a container on the Compose network, use the MinIO service name `minio` as its hostname; the included Compose file currently starts infrastructure services, not the API container.

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
