> "We are not even close."
>
> — Romans building Rome, end of Day 1

# imageboard

![blankch logo](./frontend/src/assets/logo.svg)

An imageboard project with a React and TypeScript frontend and an Express API backed by PostgreSQL. Images are stored in MinIO. The project is under active development.

## Repository guide

- [`frontend/README.md`](./frontend/README.md) — frontend setup, routes, posting forms, and scripts.
- [`backend/README.md`](./backend/README.md) — API setup, environment variables, endpoints, and known limitations.
- [`docs/README.md`](./docs/README.md) — database schema and ER diagram.

## Run locally

The frontend and backend run as separate applications. Start PostgreSQL and MinIO with Docker Compose, apply [`docs/db.sql`](./docs/db.sql), then start the backend and frontend using their guides. The backend defaults to port `3000`; the frontend currently calls `http://localhost:8080/api`, so set `PORT=8080` for the backend when running the frontend with the current service URLs.

Successful API responses use a `{ "data": ... }` envelope. Error responses use `{ "error": "..." }`.

## Stack

- **Frontend:** React, TypeScript, Vite, React Router
- **Backend:** Node.js, Express, Multer, MinIO client
- **Database:** PostgreSQL, with pgAdmin available through Docker Compose
