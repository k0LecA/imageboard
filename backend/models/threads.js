import pool from '../configs/dbConfig.js'

const getThreads = async () => {
  const result = await pool.query(`
    SELECT * FROM threads
  `);
  return result;
};

const getThreadById = async (id) => {
  const result = await pool.query(`
    SELECT * FROM threads
    WHERE id = $1
  `, [id]);
  return result.rows[0];
};

const getThreadsByBoardId = async (board_id) => {
  const result = await pool.query(`
    SELECT * FROM threads
    WHERE board_id = $1
  `, [board_id]);
  return result;
};

const createThread = async ({ board_id, is_pinned, is_locked }) => {
  const result = await pool.query(`
    INSERT INTO threads (board_id, is_pinned, is_locked) VALUES ($1, $2, $3)
    RETURNING id
  `, [board_id, is_pinned, is_locked]);
  return result.rows[0];
};

const updateThread = async ({ id, is_pinned, is_locked }) => {
  const result = await pool.query(`
    UPDATE threads SET is_pinned = $2, is_locked = $3 WHERE id = $1
    RETURNING *
  `, [id, is_pinned, is_locked]);
  return result.rows[0];
};

const deleteThread = async (id) => {
  const result = await pool.query(`
    DELETE FROM threads WHERE id = $1
    RETURNING *
  `, [id]);
  return result.rows[0];
};

export { getThreads, getThreadById, getThreadsByBoardId, createThread, updateThread, deleteThread };
