import pool from "../configs/dbConfig.js";

const createModerator = async ({ username, passwordHash, role, boardId }) => {
  const result = await pool.query(
    `
    INSERT INTO moderators (username, password_hash, role, board_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `,
    [username, passwordHash, role, boardId],
  );
  return result.rows[0];
};

const getModeratorsByBoard = async (boardId) => {
  const result = await pool.query(
    `
    SELECT id, username, role FROM moderators WHERE board_id = $1;
  `,
    [boardId],
  );
  return result.rows;
};

const getModeratorById = async (id) => {
  const result = await pool.query(
    `
    SELECT id, username, role FROM moderators WHERE id = $1;
  `,
    [id],
  );
  return result.rows[0];
};

const updateModerator = async (
  id,
  { username, passwordHash, role, boardId },
) => {
  const result = await pool.query(
    `
    UPDATE moderators
    SET username = $1, password_hash = $2, role = $3, board_id = $4
    WHERE id = $5
    RETURNING id, username, role;
  `,
    [username, passwordHash, role, boardId, id],
  );
  return result.rows[0];
};

const deleteModerator = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM moderators WHERE id = $1 RETURNING id, username, role;
  `,
    [id],
  );
  return result.rows[0];
};

export {
  createModerator,
  getModeratorsByBoard,
  getModeratorById,
  updateModerator,
  deleteModerator,
};
