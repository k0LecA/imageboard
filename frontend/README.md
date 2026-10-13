# Imageboard frontend

React and TypeScript single-page frontend built with Vite. It provides a home page with board links, board pages with thread lists, and thread pages with posts and replies.

## Requirements

- Node.js with npm
- The imageboard backend running separately

## Setup

From the `frontend` directory:

```sh
pnpm install
pnpm dev
```

Vite prints the local development URL when it starts. Frontend services currently use `http://localhost:8080/api/boards`; configure the backend to listen on port `8080` (for example, with `PORT=8080`) or update the API base URL in `src/services/`.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home page with the board list |
| `/:slug` | Board page with breadcrumb navigation, sidebar, thread list, and create-thread form |
| `/:slug/:threadId` | Thread page with breadcrumb navigation, sidebar, posts, and reply form |

## Posting

Creating a thread sends `board_id`, `subject`, and `message` as multipart form data. Up to four images are sent using the `files` field. A reply sends `boardId` and `message`, with an optional image in the `file` field. The backend stores images in MinIO and associates them with the post.

Post and thread IDs are returned inside the backend's `{ "data": ... }` response envelope. Image display uses `/api/files/:fileId`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Type-check and create a production build in `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint |

The frontend source is in `src/`, route pages in `src/pages/`, reusable components in `src/components/`, and API services in `src/services/`.
