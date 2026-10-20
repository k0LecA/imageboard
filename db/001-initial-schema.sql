-- Bootstrap schema for a new, empty PostgreSQL database.
-- Docker's PostgreSQL image runs this file only when initializing an empty data directory.

CREATE TABLE boards (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(16) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    bump_limit  INTEGER NOT NULL DEFAULT 500 CHECK (bump_limit > 0),
    max_threads INTEGER NOT NULL DEFAULT 100 CHECK (max_threads > 0),
    theme       VARCHAR(50) NOT NULL DEFAULT 'default',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE threads (
    id         BIGSERIAL PRIMARY KEY,
    board_id   INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    subject    VARCHAR(200),
    is_pinned  BOOLEAN NOT NULL DEFAULT false,
    is_locked  BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    bumped_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (id, board_id)
);

CREATE INDEX idx_threads_board_bumped ON threads (board_id, bumped_at DESC);

CREATE TABLE posts (
    id             BIGSERIAL PRIMARY KEY,
    thread_id      BIGINT NOT NULL,
    board_id       INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    parent_id      BIGINT REFERENCES posts(id) ON DELETE SET NULL,
    author_ip_hash VARCHAR(64) NOT NULL,
    message        TEXT NOT NULL CHECK (length(btrim(message)) > 0),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    message_tsv    tsvector GENERATED ALWAYS AS (to_tsvector('simple', message)) STORED,
    FOREIGN KEY (thread_id, board_id)
        REFERENCES threads(id, board_id) ON DELETE CASCADE,
    UNIQUE (id, board_id)
);

CREATE INDEX idx_posts_thread_created ON posts (thread_id, created_at);
CREATE INDEX idx_posts_ip_hash ON posts (author_ip_hash);
CREATE INDEX idx_posts_message_tsv ON posts USING GIN (message_tsv);

CREATE TABLE files (
    id            BIGSERIAL PRIMARY KEY,
    post_id       BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    s3_key        VARCHAR(255) UNIQUE NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size          BIGINT NOT NULL CHECK (size > 0),
    mime_type     VARCHAR(100) NOT NULL CHECK (
        mime_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif')
    ),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_files_post_id ON files (post_id);

-- One optional image banner per board. The image bytes live in MinIO; this table stores metadata.
CREATE TABLE board_banners (
    board_id      INTEGER PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
    s3_key        VARCHAR(255) UNIQUE NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size          BIGINT NOT NULL CHECK (size > 0),
    mime_type     VARCHAR(100) NOT NULL CHECK (
        mime_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif')
    ),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE board_rules (
    id         BIGSERIAL PRIMARY KEY,
    board_id   INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    position   INTEGER NOT NULL CHECK (position > 0),
    title      VARCHAR(120),
    body       TEXT NOT NULL CHECK (length(btrim(body)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (board_id, position)
);

CREATE TABLE moderators (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'moderator',
    board_id      INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moderators_board_id ON moderators (board_id);

CREATE TABLE sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash   BYTEA NOT NULL UNIQUE,
    moderator_id BIGINT NOT NULL REFERENCES moderators(id) ON DELETE CASCADE,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_moderator ON sessions (moderator_id);
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);

-- Reports can target either a thread or a post, never both.
CREATE TABLE reports (
    id                BIGSERIAL PRIMARY KEY,
    reporter_ip_hash  VARCHAR(64) NOT NULL,
    thread_id         BIGINT REFERENCES threads(id) ON DELETE CASCADE,
    post_id           BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    reason            TEXT NOT NULL CHECK (length(btrim(reason)) > 0),
    status            VARCHAR(16) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    reviewed_by       BIGINT REFERENCES moderators(id) ON DELETE SET NULL,
    moderator_notes   TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at       TIMESTAMPTZ,
    CHECK ((thread_id IS NOT NULL)::integer + (post_id IS NOT NULL)::integer = 1)
);

CREATE INDEX idx_reports_status_created ON reports (status, created_at);
CREATE INDEX idx_reports_thread_id ON reports (thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_reports_post_id ON reports (post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_reports_reporter_ip_hash ON reports (reporter_ip_hash);

-- A NULL board_id means the ban applies across all boards.
CREATE TABLE bans (
    id             BIGSERIAL PRIMARY KEY,
    ip_hash        VARCHAR(64) NOT NULL,
    board_id       INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    reason         TEXT NOT NULL CHECK (length(btrim(reason)) > 0),
    created_by     BIGINT REFERENCES moderators(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at     TIMESTAMPTZ,
    CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE INDEX idx_bans_ip_board_expiration ON bans (ip_hash, board_id, expires_at);
CREATE INDEX idx_bans_global_ip_expiration ON bans (ip_hash, expires_at) WHERE board_id IS NULL;

-- Audit rows intentionally keep target_type/target_id as values rather than foreign keys,
-- so the history remains after a target post or thread is deleted.
CREATE TABLE moderation_actions (
    id           BIGSERIAL PRIMARY KEY,
    moderator_id BIGINT REFERENCES moderators(id) ON DELETE SET NULL,
    board_id     INTEGER REFERENCES boards(id) ON DELETE SET NULL,
    action       VARCHAR(40) NOT NULL,
    target_type  VARCHAR(16) NOT NULL
                 CHECK (target_type IN ('board', 'thread', 'post', 'ban', 'report')),
    target_id    BIGINT,
    details      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moderation_actions_board_created ON moderation_actions (board_id, created_at DESC);
CREATE INDEX idx_moderation_actions_target ON moderation_actions (target_type, target_id);
