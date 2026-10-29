# Imageboard backend

An Express API for boards, threads, posts, image files, and moderator sign-in and sessions. PostgreSQL stores application data, and MinIO stores uploaded images. The backend is under active development.

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

The root `.env` configures Docker Compose; `backend/.env` configures the API. Keep PostgreSQL and MinIO credentials consistent between the files.

Start PostgreSQL and MinIO from the repository root:

```sh
docker compose up -d database minio
```

On first startup with an empty data directory, Compose applies `db/001-initial-schema.sql`. PostgreSQL data is stored in `db-data`.

Start the API from `backend/`:

```sh
pnpm install
pnpm dev
```

The API initializes the MinIO bucket on startup. The backend environment example uses port `8080`. When the API runs outside Compose, set `DB_HOST` and `MINIO_HOST` to addresses reachable from the host.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; the example uses `8080` |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `DB_HOST` | PostgreSQL hostname accessible to the API |
| `DB_PORT` | PostgreSQL port accessible to the API |
| `HASH_SECRET` | Reserved secret setting; IP hashing is not currently wired into the request flow |
| `MINIO_HOST` | MinIO hostname accessible to the API |
| `MINIO_API_PORT` | MinIO API port |
| `MINIO_ROOT_USER` | MinIO access key |
| `MINIO_ROOT_PASSWORD` | MinIO secret key |
| `MINIO_BUCKET_NAME` | Bucket used for uploaded images |
| `STORAGE_USE_SSL` | Whether the API connects to MinIO using TLS |

Keep environment files private and use strong random values for secrets and service credentials. pgAdmin and the MinIO console are configured in the root environment file.

## Authentication and moderator registration

`POST /api/auth/signin` accepts a JSON object with `username` and `password`. Password verification uses bcryptjs. On success, the API creates a seven-day session and sets a `session` HttpOnly cookie. The JSON response contains the moderator ID, username, role, and board ID; it does not include the session secret.

The cookie contains a session UUID and a cryptographically random secret. PostgreSQL stores a bcrypt hash of the secret in `sessions.token_hash`. Protected routes read the cookie, look up the session by UUID, verify the secret, and reject missing, invalid, or expired sessions. `POST /api/auth/signout` requires a valid session, deletes it, clears the cookie, and returns `{ "data": { "signedOut": true } }`.

Moderator registration is planned to use invitation links. The schema includes `moderator_invitations` and `moderator_invitation_boards`, but invitation creation, redemption, and moderator registration endpoints are not implemented yet. A moderator record must already exist to use sign-in.

Authentication currently checks that a session is valid; role and board-scope authorization are not fully enforced. Do not treat protected routes as having complete moderator permission checks.

## API

The API is mounted at `/api`. Successful JSON responses use `{ "data": ... }`; errors use `{ "error": "..." }`.

| Method | Path | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/api/boards` | List boards | Public |
| `POST` | `/api/boards` | Create a board (`slug`, `name`, optional `bumpLimit`, `maxThreads`) | Valid session |
| `GET` | `/api/boards/:slug` | Get board details | Public |
| `PUT` | `/api/boards/:slug` | Update board details | Valid session |
| `DELETE` | `/api/boards/:slug` | Delete a board | Valid session |
| `GET` | `/api/boards/:slug/threads` | List threads on a board | Public |
| `POST` | `/api/boards/:slug/threads` | Create a thread and its first post | Public, multipart form |
| `GET` | `/api/boards/:slug/threads/:threadId` | Get a thread | Public |
| `PUT` | `/api/boards/:slug/threads/:threadId` | Update thread lock/pin fields | Valid session |
| `DELETE` | `/api/boards/:slug/threads/:threadId` | Delete a thread | Valid session |
| `GET` | `/api/boards/:slug/threads/:threadId/posts` | List posts in a thread | Public |
| `POST` | `/api/boards/:slug/threads/:threadId/posts` | Add a post | Public, multipart form |
| `DELETE` | `/api/boards/:slug/threads/:threadId/posts/:postId` | Delete a post | Valid session |
| `GET` | `/api/files/:fileId` | Display an uploaded image | Public |
| `POST` | `/api/auth/signin` | Sign in with `username` and `password` | Public |
| `POST` | `/api/auth/signout` | End the current session | Valid session |
| `GET` | `/api/misc/thread-count` | Read the thread ID sequence value | Public |

Thread creation uses multipart fields `board_id` and `message`, with up to four image files in the repeated `files` field. The controller stores uploaded objects in MinIO and the service coordinates creation of the thread, first post, and file metadata. The service starts a database transaction, but the model methods do not consistently use its transaction client, so atomicity is not guaranteed yet. Uploaded objects are removed if the service reports a failure. The current frontend also submits a `subject`, but the backend does not persist it.

Adding a post uses multipart fields `boardId` and `message`, plus an optional image in `file`. The image endpoint serves JPEG, PNG, GIF, WebP, and AVIF images inline.

The schema also contains tables for board banners, board rules, reports, bans, moderation actions, and moderator invitations. Their complete API workflows are not available yet.

## Tests

Run the Vitest suite from `backend/`:

```sh
pnpm test
```

The PostgreSQL integration test uses the separate `database-test` Compose service on port `5433`. Configure the Compose service with a root `.env.test` file, then start it from the repository root. Vitest reads its own `backend/.env.test` file for the test process:

```sh
docker compose up -d database-test
cd backend
pnpm test
```

The test database uses `db/001-initial-schema.sql` and temporary container storage. Test connection settings belong in the ignored `backend/.env.test` file. Current real-PostgreSQL coverage is limited to board model operations; the threads integration-directory test uses a mocked pool.

## Project layout

- `server.js`, `app.js`: server startup and Express application.
- `routes/`, `controllers/`: API routes and request handlers.
- `models/`, `services/`: PostgreSQL queries, authentication, and image storage.
- `middleware/`: session authentication, input validation, and multipart uploads.
- `configs/`: PostgreSQL and MinIO clients and bucket initialization.
- `../db/001-initial-schema.sql`: canonical PostgreSQL schema applied by Compose on first initialization.
