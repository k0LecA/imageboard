import pool from "../configs/dbConfig.js";

const getBoards = async () => {
  const { rows } = await pool.query("SELECT * FROM boards");
  return rows;
};

const getBoardBySlug = async (slug) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM boards
      WHERE slug = $1
    `,
    [slug],
  );
  return rows[0];
};

const getBoardById = async (id) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM boards
      WHERE id = $1
    `,
    [id],
  );
  return rows[0];
};

const createBoard = async ({ slug, name, bumpLimit, maxThreads }) => {
  const { rows } = await pool.query(
    `
      INSERT INTO boards (slug, name, bump_limit, max_threads)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [slug, name, bumpLimit, maxThreads],
  );
  return rows[0];
};

const updateBoardBySlug = async ({ slug, name, bumpLimit, maxThreads }) => {
  const { rows } = await pool.query(
    `
      UPDATE boards
      SET name = $2, bump_limit = $3, max_threads = $4
      WHERE slug = $1
      RETURNING *
    `,
    [slug, name, bumpLimit, maxThreads],
  );
  return rows[0];
};

const deleteBoard = async (slug) => {
  const { rows } = await pool.query(
    `
      DELETE FROM boards
      WHERE slug = $1
      RETURNING *
    `,
    [slug],
  );
  return rows[0];
};

export {
  getBoards,
  getBoardBySlug,
  getBoardById,
  createBoard,
  updateBoardBySlug,
  deleteBoard,
};
