CREATE TABLE boards (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(16) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    bump_limit  INTEGER NOT NULL DEFAULT 500,
    max_threads INTEGER NOT NULL DEFAULT 100,
    theme       VARCHAR(50) NOT NULL DEFAULT 'default',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE threads (
    id            BIGSERIAL PRIMARY KEY,
    board_id      INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    subject       VARCHAR(200),
    is_pinned     BOOLEAN NOT NULL DEFAULT false,
    is_locked     BOOLEAN NOT NULL DEFAULT false,
    posts_count   INTEGER NOT NULL DEFAULT 0,
    files_count   INTEGER NOT NULL DEFAULT 0,
    replies_total INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    bumped_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (id, board_id)
);

CREATE INDEX idx_threads_board_catalog
    ON threads (board_id, is_pinned DESC, bumped_at DESC, id DESC);

CREATE TABLE posts (
    id          BIGSERIAL PRIMARY KEY,
    thread_id   BIGINT NOT NULL,
    board_id    INTEGER NOT NULL,
    is_op       BOOLEAN NOT NULL DEFAULT false,
    message     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    message_tsv tsvector GENERATED ALWAYS AS
                    (to_tsvector('simple', message)) STORED,
    FOREIGN KEY (thread_id, board_id)
        REFERENCES threads (id, board_id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_thread_created ON posts (thread_id, created_at, id);
CREATE INDEX idx_posts_message_tsv ON posts USING GIN (message_tsv);

CREATE TABLE files (
    id            BIGSERIAL PRIMARY KEY,
    post_id       BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    s3_key        VARCHAR(255) UNIQUE NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size          BIGINT NOT NULL,
    mime_type     VARCHAR(100) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_files_post_id ON files (post_id, id);

CREATE TABLE board_banners (
    board_id      INTEGER PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
    s3_key        VARCHAR(255) UNIQUE NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size          BIGINT NOT NULL,
    mime_type     VARCHAR(100) NOT NULL,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE board_rules (
    id         BIGSERIAL PRIMARY KEY,
    board_id   INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    position   INTEGER NOT NULL,
    title      VARCHAR(120),
    body       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (board_id, position)
);

CREATE TABLE moderators (
    id                  BIGSERIAL PRIMARY KEY,
    username            VARCHAR(50) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(16) NOT NULL DEFAULT 'MODERATOR',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    password_changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at       TIMESTAMPTZ,
    failed_login_count  INTEGER NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    deactivated_at      TIMESTAMPTZ
);

CREATE TABLE moderator_boards (
    moderator_id BIGINT NOT NULL REFERENCES moderators(id) ON DELETE CASCADE,
    board_id     INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (moderator_id, board_id)
);

CREATE INDEX idx_moderator_boards_board_id
    ON moderator_boards (board_id, moderator_id);

CREATE TABLE moderator_invitations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash BYTEA NOT NULL UNIQUE,
    label      VARCHAR(100),
    created_by BIGINT REFERENCES moderators(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '3 days'),
    used_by    BIGINT REFERENCES moderators(id) ON DELETE SET NULL,
    used_at    TIMESTAMPTZ,
    revoked_by BIGINT REFERENCES moderators(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_moderator_invitations_creator
    ON moderator_invitations (created_by, created_at DESC);
CREATE INDEX idx_moderator_invitations_expires_at
    ON moderator_invitations (expires_at);

CREATE TABLE moderator_invitation_boards (
    invitation_id UUID NOT NULL REFERENCES moderator_invitations(id)
                                ON DELETE CASCADE,
    board_id      INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    PRIMARY KEY (invitation_id, board_id)
);

CREATE INDEX idx_moderator_invitation_boards_board_id
    ON moderator_invitation_boards (board_id, invitation_id);

CREATE TABLE sessions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash   BYTEA NOT NULL UNIQUE,
    moderator_id BIGINT NOT NULL REFERENCES moderators(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at   TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_moderator ON sessions (moderator_id);
CREATE INDEX idx_sessions_expires_at ON sessions (expires_at);

CREATE TABLE reports (
    id              BIGSERIAL PRIMARY KEY,
    board_id        INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    thread_id       BIGINT REFERENCES threads(id) ON DELETE CASCADE,
    post_id         BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    file_id         BIGINT REFERENCES files(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    status          VARCHAR(16) NOT NULL DEFAULT 'pending',
    reviewed_by     BIGINT REFERENCES moderators(id) ON DELETE SET NULL,
    moderator_notes TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at     TIMESTAMPTZ
);

CREATE INDEX idx_reports_board_queue ON reports (board_id, status, created_at);
CREATE INDEX idx_reports_thread_id ON reports (thread_id);
CREATE INDEX idx_reports_post_id ON reports (post_id);
CREATE INDEX idx_reports_file_id ON reports (file_id);

CREATE TABLE moderation_actions (
    id           BIGSERIAL PRIMARY KEY,
    moderator_id BIGINT REFERENCES moderators(id) ON DELETE SET NULL,
    board_id     INTEGER REFERENCES boards(id) ON DELETE SET NULL,
    action       VARCHAR(40) NOT NULL,
    target_type  VARCHAR(16) NOT NULL,
    target_id    BIGINT,
    target_uuid  UUID,
    details      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moderation_actions_board_created
    ON moderation_actions (board_id, created_at DESC);
CREATE INDEX idx_moderation_actions_moderator_created
    ON moderation_actions (moderator_id, created_at DESC);
CREATE INDEX idx_moderation_actions_target
    ON moderation_actions (target_type, target_id);
CREATE INDEX idx_moderation_actions_target_uuid
    ON moderation_actions (target_uuid);