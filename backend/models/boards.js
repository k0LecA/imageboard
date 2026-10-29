import pool from "../configs/dbConfig.js";

const getBoards = async () => {
  const { rows } = await pool.query("SELECT id, slug, name, description, theme FROM boards");
  return rows;
};

const getBoardBySlug = async (slug) => {
  const { rows } = await pool.query(
    `
      SELECT id, slug, name, description, theme
      FROM boards
      WHERE slug = $1
    `,
    [slug],
  );
  return rows[0];
};

const getBoardIdBySlug = async (slug) => {
  const { rows } = await pool.query(
    `
      SELECT id
      FROM boards
      WHERE slug = $1
    `,
    [slug],
  );
  return rows[0].id;
};

const getBoardById = async (id) => {
  const { rows } = await pool.query(
    `
      SELECT id, slug, name, description, theme
      FROM boards
      WHERE id = $1
    `,
    [id],
  );
  return rows[0];
};

const createBoard = async ({ slug, name, description, bumpLimit, maxThreads, theme }) => {
  const columns = ["slug", "name"];
  const values = [slug, name];

  if (description !== undefined) {
    columns.push("description");
    values.push(description);
  }
  if (bumpLimit !== undefined) {
    columns.push("bump_limit");
    values.push(bumpLimit);
  }
  if (maxThreads !== undefined) {
    columns.push("max_threads");
    values.push(maxThreads);
  }
  if (theme !== undefined) {
    columns.push("theme");
    values.push(theme);
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

const updateBoardBySlug = async ({ slug, name, description, bumpLimit, maxThreads, theme }) => {
  const updates = [];
  const values = [slug];
  const fields = [
    ["name", name],
    ["description", description],
    ["bump_limit", bumpLimit],
    ["max_threads", maxThreads],
    ["theme", theme],
  ];

  for (const [column, value] of fields) {
    if (value !== undefined) {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    }
  }
  // returning different set of columns
  // getBoardBySlug returns id, slug, name, description, theme
  // if updates are made then returning *
  // keep in mind that the returned object will have different properties based on whether updates were made or not
  if (updates.length === 0) return getBoardBySlug(slug);

  const { rows } = await pool.query(
    `UPDATE boards
     SET ${updates.join(", ")}
     WHERE slug = $1
     RETURNING *`,
    values,
  );
  return rows[0];
};

const deleteBoardBySlug = async (slug) => {
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
  getBoardIdBySlug,
  getBoardById,
  createBoard,
  updateBoardBySlug,
  deleteBoardBySlug,
};
