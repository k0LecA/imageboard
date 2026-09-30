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
npm start
```

## Endpoints

| Method | Path                | Description                                   |
|--------|---------------------|-----------------------------------------------|
| GET    | `/threadCount`      | Total number of threads ever created          |
| GET    | `/`                 | List all boards                               |
| GET    | `/:slug`            | List threads in a board                       |
| POST   | `/:slug`            | Create a thread in a board                    |
| GET    | `/:slug/:threadId`  | List posts in a thread                        |
| POST   | `/:slug/:threadId`  | Post a reply in a thread                      |

Notes:

- The all-time thread count is read from the `threads_id_seq` sequence, so it is not affected by pruning old threads.
- A thread is always looked up by both slug and id, so `/a/5` will not return a thread that belongs to board `b`.

## Error responses

Errors are returned as JSON: `{ "error": "message" }` with an appropriate status code (400 invalid input, 404 not found, 500 server error). (wip)

## Todo

- [x] ip hashing for posts (for future ban detection)
- [x] `DELETE` thread / post (moderation)
- [x] Complete CRUD operations for threads and posts
- [ ] Input validation (slug, numeric `threadId`, post body length)
- [ ] Thread pruning job (delete old threads, optional archive DB)
- [ ] Rate limiting
- [ ] Image uploads
- [ ] Moderation (ban, delete, etc.)
