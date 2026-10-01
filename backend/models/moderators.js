import pool from '../configs/dbConfig.js'

const createModerator = async ({ username, password_hash,role,board_id }) => {
  const result = await pool.query(`
    INSERT INTO moderators (username, password_hash, role, board_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `, [username, password_hash, role, board_id]);
  return result.rows[0];
};

const getModeratorsByBoard = async (board_id) => {
  const result = await pool.query(`
    SELECT * FROM moderators WHERE board_id = $1;
  `, [board_id]);
  return result.rows;
};

const getModeratorById = async (id) => {
  const result = await pool.query(`
    SELECT * FROM moderators WHERE id = $1;
  `, [id]);
  return result.rows[0];
};

const updateModerator = async (id, { username, password_hash, role, board_id }) => {
  const result = await pool.query(`
    UPDATE moderators
    SET username = $1, password_hash = $2, role = $3, board_id = $4
    WHERE id = $5
    RETURNING *;
  `, [username, password_hash, role, board_id, id]);
  return result.rows[0];
};

const deleteModerator = async ({ id }) => {
  const result = await pool.query(`
    DELETE FROM moderators WHERE id = $1 RETURNING *;
  `, [id]);
  return result.rows[0];
};

export {
  createModerator,
  getModeratorsByBoard,
  getModeratorById,
  updateModerator,
  deleteModerator,
};
