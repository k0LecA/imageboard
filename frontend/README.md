# Imageboard frontend

A basic React and TypeScript single-page prototype built with Vite. It provides a home page with board links, board pages with thread lists and a thread creation form, and thread pages with posts and a reply form. The UI is still under development.

## Requirements and setup

- Node.js
- pnpm
- The imageboard API running separately

From the `frontend/` directory:

```sh
pnpm install
pnpm dev
```

Vite prints the local development URL when it starts. The API service URLs currently point to `http://localhost:8080/api`; configure the backend to use port `8080` or update the service URLs in `src/services/`.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home page with the board list |
| `/:slug` | Board page with navigation, thread list, and create-thread form |
| `/:slug/:threadId` | Thread page with posts and reply form |
| `/mod` | Moderator sign-in form |
| `/mod/dashboard` | Moderator dashboard prototype with local demo data |

The moderator dashboard is not connected to moderation APIs. The sign-in page calls the backend sign-in endpoint, but the browser cookie integration still needs work; role and board permissions are not enforced by the frontend.

## Posting forms

The create-thread form sends multipart data to the backend with the board ID, message, and up to four images. The reply form sends a message and an optional image. The backend stores image objects in MinIO and associates their metadata with posts. Images are displayed through `/api/files/:fileId`.

The frontend expects successful API responses in the `{ "data": ... }` format.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Type-check and create a production build in `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint |

Source code is in `src/`; route pages are in `src/pages/`, reusable components in `src/components/`, and API services in `src/services/`.
