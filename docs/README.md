# Project documentation

This directory contains the PostgreSQL schema and its entity-relationship diagram for the imageboard backend.

- [`db.sql`](./db.sql) defines the tables, relationships, defaults, and indexes. Apply it to an empty database during setup; Docker Compose starts PostgreSQL but does not load this schema automatically. See the [backend setup guide](../backend/README.md).
- [`er.png`](./er.png) shows the database entities and their relationships.

## Entity-relationship diagram

![Entity-relationship diagram of the imageboard database](./er.png)

## Schema overview

The content model is `boards` → `threads` → `posts`. Each post belongs to a board and thread, and may reference a parent post. Posts have a generated full-text search vector and can have associated file records. Moderators may be associated with a board; UUID sessions belong to moderators.

Deleting a board cascades to its threads, posts, files, and board-scoped moderators. Deleting a thread cascades to its posts and files. Deleting a post sets `parent_id` to `NULL` on replies that referenced it.

Indexes support thread ordering by board, post lookup by thread and IP hash, full-text search over messages, file lookup by post, and session lookup by moderator. `message_tsv` is generated from each post's message using PostgreSQL's `simple` text configuration.
