# Imageboard backend

Express API for boards, threads, posts, moderator sign-in, and session management. PostgreSQL stores application data, MinIO stores uploaded images, and poster IP addresses are HMAC-hashed before storage.

## Requirements

- Node.js
- pnpm
- Docker Compose for PostgreSQL and MinIO

## Setup

From the repository root, create the environment files from their examples:

```sh
cp .env.example .env
cp backend/.env.example backend/.env
```

Keep the PostgreSQL and MinIO credentials consistent between the root and backend environment files. The root file configures Docker services; `backend/.env` configures the API.

Start PostgreSQL and MinIO from the repository root:

```sh
docker compose up -d database minio
```

On the first PostgreSQL startup with an empty data directory, Compose applies `db/001-initial-schema.sql`. The database keeps its data in `db-data`.

Start the API from `backend/`:

```sh
pnpm install
pnpm dev
```

The API initializes the MinIO bucket when it starts. The backend environment example sets `PORT=8080`.

### Backend environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; the example uses `8080` |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `DB_HOST` | PostgreSQL hostname accessible from the API |
| `DB_PORT` | PostgreSQL port accessible from the API |
| `HASH_SECRET` | Secret used to HMAC-hash poster IP addresses |
| `MINIO_HOST` | MinIO hostname accessible from the API |
| `MINIO_API_PORT` | MinIO API port |
| `MINIO_ROOT_USER` | MinIO access key |
| `MINIO_ROOT_PASSWORD` | MinIO secret key |
| `MINIO_BUCKET_NAME` | Bucket used for uploaded images |
| `STORAGE_USE_SSL` | Whether the API connects to MinIO using TLS |

Keep environment files private and use strong random values for secrets and service credentials. When the API runs outside Compose, configure `DB_HOST` and `MINIO_HOST` with addresses reachable from the host. pgAdmin and the MinIO console are configured in the root environment file.

## Authentication and sessions

`POST /api/auth/signin` accepts a JSON object with `username` and `password`. Password verification uses bcryptjs. On success, the API creates a seven-day session and sets the `session` HttpOnly cookie. The JSON response contains the moderator ID, username, role, and board ID; it does not include the session secret.

The cookie value contains a session UUID and a cryptographically random secret. PostgreSQL stores the bcrypt hash of the secret in the `sessions.token_hash` `BYTEA` column. Protected routes use `cookie-parser` to read the cookie, look up the session by UUID, verify the secret with bcryptjs, and reject missing, invalid, or expired sessions. Multiple sessions can be active for one moderator.

`POST /api/auth/signout` requires a valid session cookie, deletes that session, clears the cookie, and returns `{ "data": { "signedOut": true } }`.

## API

The API is mounted at `/api`. Successful JSON responses use `{ "data": ... }`; errors use `{ "error": "..." }`.

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/api/boards` | List boards | Public |
| `POST` | `/api/boards` | Create a board (`slug`, `name`, optional `bumpLimit`, `maxThreads`) | Session cookie |
| `GET` | `/api/boards/:slug` | Get board details | Public |
| `GET` | `/api/boards/:slug/threads` | List threads on a board | Public |
| `POST` | `/api/boards/:slug/threads` | Create a thread and its first post | Public, multipart form |
| `GET` | `/api/boards/:slug/threads/:threadId` | Get a thread | Public |
| `DELETE` | `/api/boards/:slug/threads/:threadId` | Delete a thread | Session cookie |
| `GET` | `/api/boards/:slug/threads/:threadId/posts` | List posts in a thread | Public |
| `POST` | `/api/boards/:slug/threads/:threadId/posts` | Add a post | Public, multipart form |
| `DELETE` | `/api/boards/:slug/threads/:threadId/posts/:postId` | Delete a post | Session cookie |
| `GET` | `/api/files/:fileId` | Display an uploaded image | Public |
| `POST` | `/api/auth/signin` | Sign in with `username` and `password` | Public |
| `POST` | `/api/auth/signout` | End the current session | Session cookie |
| `GET` | `/api/misc/thread-count` | Read the current thread ID sequence value | Public |

Thread creation uses the multipart fields `board_id`, `subject`, and `message`, with up to four image files in the repeated `files` field. It creates the thread and its first post together and returns the new `threadId`.

Adding a post uses the multipart fields `boardId` and `message`, plus an optional image in `file`. The image endpoint serves JPEG, PNG, GIF, WebP, and AVIF images inline.

## Tests

Run the Vitest suite from `backend/`:

```sh
pnpm test
```

The PostgreSQL integration tests use the separate `database-test` Compose service on port `5433`. Start it from the repository root before running the suite:

```sh
docker compose up -d database-test
cd backend
pnpm test
```

The test database uses `db/001-initial-schema.sql` and temporary container storage. Test connection settings belong in the ignored `backend/.env.test` file.

## Project layout

- `server.js`, `app.js`: API startup and Express application.
- `routes/`, `controllers/`: API routes and request handlers.
- `models/`, `services/`: PostgreSQL queries, authentication, and image storage.
- `middleware/`: session authentication, IP hashing, and multipart uploads.
- `configs/`: PostgreSQL and MinIO clients and bucket initialization.
- `../db/001-initial-schema.sql`: PostgreSQL schema used by Compose on first initialization.
