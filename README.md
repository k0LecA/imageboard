> “We are not even close.”
>
> — Romans building Rome, end of Day 1

# Imageboard

An imageboard project with a React and TypeScript frontend and an Express API. PostgreSQL stores application data, and MinIO stores uploaded images. The project is under active development; the frontend is currently a basic prototype.

## Project guides

- [Frontend](./frontend/README.md): setup, routes, and current UI scope.
- [Backend](./backend/README.md): setup, environment variables, API routes, authentication, and limitations.
- [Database docs](./docs/README.md): schema references and ER diagram.

## Local development

Create the environment files from their examples:

```sh
cp .env.example .env
cp backend/.env.example backend/.env
```

The root `.env` is used by Docker Compose. `backend/.env` configures the API. Keep PostgreSQL and MinIO credentials consistent between the files. The API must be able to reach the database and MinIO using the hostnames and ports configured for where the API runs.

Start PostgreSQL and MinIO from the repository root:

```sh
docker compose up -d database minio
```

On first startup with an empty PostgreSQL data directory, Compose applies [`db/001-initial-schema.sql`](./db/001-initial-schema.sql). The database data is stored in `db-data`.

Install workspace dependencies and start the applications separately:

```sh
pnpm install
```

In one terminal, start the API:

```sh
pnpm --filter ./backend dev
```

In another terminal, start the frontend:

```sh
pnpm --filter ./frontend dev
```

The backend environment example uses port `8080`, which matches the frontend's current API URLs. See the [backend guide](./backend/README.md) for the separate test database setup.

## Current scope

The API supports basic board, thread, post, image, and moderator sign-in/session flows. Moderator registration is planned to use invitation links. The database schema already has invitation-related tables, but the invitation creation, redemption, and registration endpoints are not implemented yet.

The frontend provides basic board and thread pages, posting forms, and a moderator sign-in page. The moderator dashboard currently uses demo data and is not connected to moderation APIs. Role- and board-scope authorization is also incomplete on the backend.

Successful API responses use a `{ "data": ... }` envelope. Error responses use `{ "error": "..." }`.

## Stack

- **Frontend:** React, TypeScript, Vite, React Router
- **Backend:** Node.js, Express, Multer, MinIO client
- **Database and infrastructure:** PostgreSQL, MinIO, Docker Compose; pgAdmin is also available through Compose
