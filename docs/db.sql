-- Generated for version control.

CREATE TABLE boards (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(16) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    bump_limit  INTEGER NOT NULL DEFAULT 500,
    max_threads INTEGER NOT NULL DEFAULT 100,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE threads (
    id         BIGSERIAL PRIMARY KEY,
    board_id   INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    subject    VARCHAR(200),
    is_pinned  BOOLEAN NOT NULL DEFAULT false,
    is_locked  BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    bumped_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_threads_board_bumped ON threads (board_id, bumped_at DESC);

CREATE TABLE posts (
    id             BIGSERIAL PRIMARY KEY,
    thread_id      BIGINT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    board_id       INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    parent_id      BIGINT REFERENCES posts(id) ON DELETE SET NULL,
    author_ip_hash VARCHAR(64) NOT NULL,
    message        TEXT NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    message_tsv    tsvector GENERATED ALWAYS AS (to_tsvector('simple', message)) STORED
);

CREATE INDEX idx_posts_thread_created ON posts (thread_id, created_at);
CREATE INDEX idx_posts_ip_hash ON posts (author_ip_hash);
CREATE INDEX idx_posts_message_tsv ON posts USING GIN (message_tsv);

CREATE TABLE files (
    id            BIGSERIAL PRIMARY KEY,
    post_id       BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    s3_key        VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size          BIGINT NOT NULL,
    mime_type     VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_files_post_id ON files (post_id);

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
    moderator_id BIGINT NOT NULL REFERENCES moderators(id) ON DELETE CASCADE,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_moderator ON sessions (moderator_id);

--2
ALTER TABLE boards
ADD COLUMN theme VARCHAR(50) NOT NULL DEFAULT 'default',
ADD COLUMN banner_key VARCHAR(255);
