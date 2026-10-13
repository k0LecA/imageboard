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
  const columns = ["slug", "name"];
  const values = [slug, name];

  if (bumpLimit !== undefined) {
    columns.push("bump_limit");
    values.push(bumpLimit);
  }
  if (maxThreads !== undefined) {
    columns.push("max_threads");
    values.push(maxThreads);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`);
  const { rows } = await pool.query(
    `INSERT INTO boards (${columns.join(", ")})
     VALUES (${placeholders.join(", ")})
     RETURNING *`,
    values,
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
