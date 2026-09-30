# imageboard

Minimal imageboard backend built (being built) with Express.js and PostgreSQL.


## Stack

- Node.js, Express
- PostgreSQL (via Docker Compose), pgAdmin for inspection

## Getting started

```bash
cp .env.example .env      # fill in DB credentials
docker compose up -d      # start Postgres and pgAdmin
npm install
npm start                 # node --watch server.js
```

# API Endpoints

## Auth

| Method | Path            | Auth |
|--------|-----------------|------|
| POST   | `/auth/signup`  | none |
| POST   | `/auth/signin`  | none |

## Boards

| Method | Path | Auth |
|--------|------|------|
| GET    | `/`  | none |

## Threads

| Method | Path                 | Auth      |
|--------|----------------------|-----------|
| GET    | `/:slug`             | none      |
| POST   | `/:slug`             | none      |
| DELETE | `/:slug/:threadId`   | moderator |

## Posts

| Method | Path                          | Auth      |
|--------|-------------------------------|-----------|
| GET    | `/:slug/:threadId`            | none      |
| POST   | `/:slug/:threadId`            | none      |
| DELETE | `/:slug/:threadId/:postId`    | moderator |

## Misc

| Method | Path           | Auth |
|--------|----------------|------|
| GET    | `/threadCount` | none |

Notes:
 
- The all-time thread count is read from the `threads_id_seq` sequence, so it is not affected by pruning old threads.
- A thread is always looked up by both slug and id, so `/a/5` will not return a thread that belongs to board `b`.
- Sessions are passed as a bearer token: the `sessions.id` returned by `signin` is sent back in the `Authorization` header on protected requests.
- `authCheck` only verifies that a session row exists for the given id — it does not currently check `expires_at`, so expired sessions are still accepted.


## Error responses

Errors are returned as JSON: `{ "error": "message" }` with an appropriate status code (400 invalid input, 404 not found, 500 server error). (wip)

## Todo
 
- [x] ip hashing for posts (for future ban detection)
- [x] `DELETE` thread / post (moderation)
- [x] Complete CRUD operations for threads and posts
- [x] Moderator auth (signup / signin, session-based via `sessions` table)
- [x] `authCheck` middleware guarding moderator-only routes
- [ ] Input validation (slug, numeric `threadId`, post body length)
- [ ] Check `expires_at` in `authCheck` (expired sessions are currently still accepted)
- [ ] `sign-out` endpoint to invalidate a session
- [ ] Bump limit / max threads enforcement on post/thread creation
- [ ] Board/thread update endpoints (edit board settings, lock/pin threads)
- [ ] Set up MinIO (Docker Compose service, bucket, env config)
- [ ] Image uploads (multipart handling, save file metadata to `files`, upload object to MinIO)
- [ ] Image thumbnails + dedup by file hash
- [ ] Serve/proxy uploaded images (or return MinIO URLs)
- [ ] Thread pruning job (delete old threads, optional archive DB)
- [ ] Moderation (bans, reports)
- [ ] Rate limiting
