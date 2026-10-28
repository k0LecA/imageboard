import pool from "../configs/dbConfig.js";

const createModerator = async ({ username, passwordHash, role }) => {
  const columns = ["username", "password_hash"];
  const values = [username, passwordHash];

  if (role !== undefined) {
    columns.push("role");
    values.push(role);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`);
  const { rows } = await pool.query(
    `INSERT INTO moderators (${columns.join(", ")})
     VALUES (${placeholders.join(", ")})
     RETURNING id, username, role`,
    values,
  );
  return rows[0];
};

const getModeratorsByBoard = async (boardId) => {
  const { rows } = await pool.query(
    `
      SELECT id, username, role
      FROM moderators
      JOIN moderator_boards ON moderator_boards.moderator_id = moderators.id
      WHERE moderator_boards.board_id = $1
        AND moderators.deactivated_at IS NULL
      ORDER BY moderators.id
    `,
    [boardId],
  );
  return rows;
};

const getModeratorByCredentials = async ({ username, passwordHash }) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM moderators
      WHERE username = $1 AND password_hash = $2
    `,
    [username, passwordHash],
  );
  return rows[0];
};

const getModeratorByUsername = async (username) => {
  const { rows } = await pool.query(
    `SELECT * FROM moderators WHERE username = $1`,
    [username],
  );
  return rows[0];
};

const getModeratorById = async (id) => {
  const { rows } = await pool.query(
    `
      SELECT id, username, role
      FROM moderators
      WHERE id = $1
    `,
    [id],
  );
  return rows[0];
};

const updateModerator = async (
  id,
  {
    username,
    passwordHash,
    role,
    passwordChangedAt,
    lastLoginAt,
    failedLoginCount,
    lockedUntil,
    deactivatedAt,
  },
) => {
  const values = [id];
  const updates = [];
  for (const [column, value] of [
    ["username", username],
    ["password_hash", passwordHash],
    ["role", role],
    ["password_changed_at", passwordChangedAt],
    ["last_login_at", lastLoginAt],
    ["failed_login_count", failedLoginCount],
    ["locked_until", lockedUntil],
    ["deactivated_at", deactivatedAt],
  ]) {
    if (value !== undefined) {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    }
  }
  if (updates.length === 0) return getModeratorById(id);
  const { rows } = await pool.query(
    `UPDATE moderators
     SET ${updates.join(", ")}
     WHERE id = $1
     RETURNING id, username, role, created_at, password_changed_at,
               last_login_at, failed_login_count, locked_until, deactivated_at`,
    values,
  );
  return rows[0];
};

const deleteModerator = async (id) => {
  const { rows } = await pool.query(
    `
      DELETE FROM moderators
      WHERE id = $1
      RETURNING id, username, role
    `,
    [id],
  );
  return rows[0];
};

export {
  createModerator,
  getModeratorsByBoard,
  getModeratorByCredentials,
  getModeratorByUsername,
  getModeratorById,
  updateModerator,
  deleteModerator,
};
