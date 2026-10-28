import pool from "../configs/dbConfig.js";

const getModeratorBoards = async (moderatorId) => {
  const { rows } = await pool.query(
    `SELECT board_id, created_at FROM moderator_boards
     WHERE moderator_id = $1 ORDER BY board_id`,
    [moderatorId],
  );
  return rows;
};

const addModeratorBoard = async ({ moderatorId, boardId }) => {
  const { rows } = await pool.query(
    `INSERT INTO moderator_boards (moderator_id, board_id)
     VALUES ($1, $2) ON CONFLICT (moderator_id, board_id) DO NOTHING
     RETURNING *`,
    [moderatorId, boardId],
  );
  if (rows[0]) return rows[0];
  const existing = await pool.query(
    `SELECT * FROM moderator_boards WHERE moderator_id = $1 AND board_id = $2`,
    [moderatorId, boardId],
  );
  return existing.rows[0];
};

const removeModeratorBoard = async ({ moderatorId, boardId }) => {
  const { rows } = await pool.query(
    `DELETE FROM moderator_boards WHERE moderator_id = $1 AND board_id = $2 RETURNING *`,
    [moderatorId, boardId],
  );
  return rows[0];
};

export { getModeratorBoards, addModeratorBoard, removeModeratorBoard };
