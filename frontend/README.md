# Imageboard frontend

React and TypeScript single-page frontend built with Vite. It currently provides pages for the board list, an individual board, and a thread.

## Requirements

- Node.js with npm
- The imageboard backend running separately

## Setup

From the `frontend` directory:

```sh
npm install
npm run dev
```

Vite prints the local development URL when it starts. The frontend currently sends API requests to `http://localhost:8080`, while the backend defaults to port `3000` and mounts its API under `/api`. To connect them, update the frontend request base URL (or configure a Vite proxy) to point to the running backend and use its `/api` routes.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home page with the board list |
| `/:slug` | Board page with its thread list |
| `/:slug/:threadId` | Thread page with its posts |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

The frontend source is in `src/`, with route pages in `src/pages/` and reusable lists in `src/components/`. API request URLs are currently written directly in those components.

## Backend integration status

The backend wraps successful JSON responses in `{ "data": ... }`; the current frontend services expect bare arrays or objects. The frontend URLs and response parsing therefore need to be updated to match the backend routes and response envelope before the two applications work together reliably. See the [backend API guide](../backend/README.md) for the route list.
