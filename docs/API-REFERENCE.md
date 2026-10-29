# API Reference and Examples

This document shows the current HTTP API request and response formats. The API is mounted at `http://localhost:8080/api` by default.

```sh
export API_BASE="http://localhost:8080/api"
```

Successful JSON responses use a `data` envelope:

```json
{
  "data": {}
}
```

Errors use an `error` field:

```json
{
  "error": "A short error message"
}
```

## Endpoints

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/boards` | List boards | Public |
| `POST` | `/boards` | Create a board | Session cookie |
| `GET` | `/boards/:slug` | Get board details | Public |
| `PUT` | `/boards/:slug` | Update board details | Session cookie; currently broken |
| `DELETE` | `/boards/:slug` | Delete a board | Session cookie |
| `GET` | `/boards/:slug/threads` | List threads on a board | Public |
| `POST` | `/boards/:slug/threads` | Create a thread and its first post | Public |
| `GET` | `/boards/:slug/threads/:threadId` | Get a thread | Public |
| `PUT` | `/boards/:slug/threads/:threadId` | Update thread lock/pin fields | Session cookie; currently broken |
| `DELETE` | `/boards/:slug/threads/:threadId` | Delete a thread | Session cookie; currently broken |
| `GET` | `/boards/:slug/threads/:threadId/posts` | List posts | Public |
| `POST` | `/boards/:slug/threads/:threadId/posts` | Create a reply, optionally with an image | Public |
| `DELETE` | `/boards/:slug/threads/:threadId/posts/:postId` | Delete a post | Session cookie |
| `GET` | `/files/:fileId` | Stream an uploaded image | Public |
| `POST` | `/auth/signin` | Sign in as a moderator | Public |
| `POST` | `/auth/signout` | End the current session | Session cookie |
| `GET` | `/misc/thread-count` | Read the thread ID sequence value | Public |

Authentication confirms that a session is valid. Role- and board-scope authorization is not fully implemented. Moderator registration through invitation links is planned, but invitation endpoints are not available yet.

## Boards

### List boards

```sh
curl "$API_BASE/boards"
```

```json
{
  "data": [
    {
      "id": 1,
      "slug": "b",
      "name": "Random",
      "description": "",
      "theme": "default"
    }
  ]
}
```

### Get one board

```sh
curl "$API_BASE/boards/b"
```

### Create a board

First sign in and save the session cookie as shown in [Authentication](#authentication). The current create-board validator requires `slug`, `name`, `description`, and `theme`.

```sh
curl --request POST "$API_BASE/boards" \
  --cookie cookies.txt \
  --header 'Content-Type: application/json' \
  --data '{
    "slug": "art",
    "name": "Art",
    "description": "Artwork and discussion",
    "theme": "default"
  }'
```

The current controller does not pass `theme` through to the model, so the database default is used in the response.

## Threads

### List threads on a board

```sh
curl "$API_BASE/boards/b/threads"
```

Thread IDs are returned as strings because the database column is `BIGINT`.

### Get one thread

```sh
curl "$API_BASE/boards/b/threads/14"
```

### Create a thread

The current working request format is JSON with a non-empty `message`. The board is looked up from `:slug`; a board ID does not need to be sent.

```sh
curl --request POST "$API_BASE/boards/b/threads" \
  --header 'Content-Type: application/json' \
  --data '{
    "message": "Hello from the first post"
  }'
```

```json
{
  "data": {
    "threadId": "14"
  }
}
```

The frontend also sends `subject` and can attach images, but the current backend does not persist the subject. Multipart thread creation is currently blocked because validation runs before the Multer parser; use the JSON example without files.

## Posts and image uploads

### List posts in a thread

```sh
curl "$API_BASE/boards/b/threads/14/posts"
```

```json
{
  "data": [
    {
      "id": "7",
      "thread_id": "14",
      "board_id": 1,
      "is_op": false,
      "message": "A reply",
      "created_at": "2026-10-29T13:47:07.050Z",
      "files": []
    }
  ]
}
```

### Create a reply with an image

Send `multipart/form-data` with a required `message` field and an optional single file field named `file`:

```sh
curl --request POST "$API_BASE/boards/b/threads/14/posts" \
  --form-string 'message=Reply with an image' \
  --form 'file=@./image.png'
```

The file must be at most 5 MiB. The response includes the created post and its file metadata:

```json
{
  "data": {
    "id": "7",
    "thread_id": "14",
    "board_id": 1,
    "is_op": false,
    "message": "Reply with an image",
    "files": [
      {
        "id": "1",
        "post_id": "7",
        "s3_key": "generated-object-key-image.png",
        "original_name": "image.png",
        "size": "80790",
        "mime_type": "image/png"
      }
    ]
  }
}
```

### Display an uploaded image

The file endpoint streams image bytes rather than returning JSON:

```sh
curl --output downloaded-image.png "$API_BASE/files/1"
```

### Delete a post

```sh
curl --request DELETE "$API_BASE/boards/b/threads/14/posts/7" \
  --cookie cookies.txt
```

## Authentication

Sign in with an existing moderator account. The API sets a seven-day HttpOnly `session` cookie; save it to a cookie jar for subsequent protected requests.

```sh
curl --request POST "$API_BASE/auth/signin" \
  --cookie-jar cookies.txt \
  --header 'Content-Type: application/json' \
  --data '{
    "username": "moderator",
    "password": "replace-with-your-password"
  }'
```

Sign out and clear the saved cookie:

```sh
curl --request POST "$API_BASE/auth/signout" \
  --cookie cookies.txt \
  --cookie-jar cookies.txt
```

## Current limitations

- `PUT /boards/:slug` is registered, but its current controller/model call does not match the model signature.
- Thread `PUT` and `DELETE` handlers call model exports that are not currently available.
- Thread creation with multipart form data is blocked by middleware order; JSON thread creation works without an image.
- `subject` is not persisted by the current thread schema or create-thread flow.
- Invitation registration, reports, bans, board rules, and moderation actions do not have complete API workflows.
