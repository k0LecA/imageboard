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

Vite prints the local development URL when it starts. The frontend currently sends API requests to `http://localhost:8080`; make sure the backend is available at that address while developing. The backend's default port is `3000`, so adjust the frontend request URLs or backend configuration if they do not match.

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
