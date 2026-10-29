# Database documentation

This directory contains SQL reference files and an entity-relationship diagram for the imageboard database.

## Canonical schema

Docker Compose applies [`../db/001-initial-schema.sql`](../db/001-initial-schema.sql) when PostgreSQL starts with an empty data directory. This is the canonical bootstrap schema for the current application. It is not a migration and will not update an existing database.

[`db.sql`](./db.sql) and [`new_db.sql`](./new_db.sql) are older schema drafts kept for reference. They differ from the current Compose schema and should not be used to initialize the current application. See the [backend guide](../backend/README.md) for local setup and the test database.

## Entity-relationship diagram

![Entity-relationship diagram of the imageboard database](./er.png)

The diagram is a reference and may not reflect every table in the current bootstrap schema. Use `../db/001-initial-schema.sql` as the source of truth.

## Schema overview

The content model is `boards` → `threads` → `posts`. Posts belong to both a board and a thread, with a composite foreign key keeping those board references consistent. Posts have a generated full-text search vector and may have associated file records. Uploaded image objects are stored in MinIO; PostgreSQL stores their metadata and object keys.

Moderator records can be associated with boards. `sessions` stores UUID-based moderator sessions. `moderator_invitations` and `moderator_invitation_boards` provide schema support for the planned invitation-link registration flow. Invitation creation, redemption, and moderator registration endpoints have not been implemented yet.

The schema also includes tables for board banners and rules, reports, and moderation actions. These tables are database support only; complete application workflows and API routes are not available yet. The current bootstrap schema does not include a `bans` table.

Foreign keys define cleanup behavior, including cascading deletion of a board's threads and posts. Indexes support board thread catalogs, post lookup, full-text search, file lookup, session expiration, report queues, and moderation history. `message_tsv` is generated from each post's message using PostgreSQL's `simple` text configuration.
