import pool from "../configs/dbConfig.js";

const getThreads = async () => {
  const { rows } = await pool.query("SELECT * FROM threads");
  return rows;
};

const getThreadById = async (id) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM threads
      WHERE id = $1
    `,
    [id],
  );
  return rows[0];
};

const getThreadsByBoardSlug = async (slug) => {
  return pool.query(
    `
      SELECT threads.*
      FROM threads
      JOIN boards ON boards.id = threads.board_id
      WHERE boards.slug = $1
      ORDER BY threads.id ASC
    `,
    [slug],
  );
};

const getThreadsByBoardId = async (boardId) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM threads
      WHERE board_id = $1
    `,
    [boardId],
  );
  return rows;
};

const createThread = async ({ boardId, subject, isPinned, isLocked }) => {
  const columns = ["board_id"];
  const values = [boardId];

  if (isPinned !== undefined) {
    columns.push("is_pinned");
    values.push(isPinned);
  }
  if (isLocked !== undefined) {
    columns.push("is_locked");
    values.push(isLocked);
  }

  const placeholders = values.map((_, index) => `$${index + 1}`);
  const { rows } = await pool.query(
    `INSERT INTO threads (${columns.join(", ")})
     VALUES (${placeholders.join(", ")})
     RETURNING id`,
    values,
  );
  return rows[0];
};

const updateThread = async ({ id, subject, isPinned, isLocked }) => {
  const updates = [];
  const values = [id];
  const fields = [
    ["is_pinned", isPinned],
    ["is_locked", isLocked],
  ];

  for (const [column, value] of fields) {
    if (value !== undefined) {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    }
  }

  if (updates.length === 0) return getThreadById(id);

  const { rows } = await pool.query(
    `UPDATE threads
     SET ${updates.join(", ")}
     WHERE id = $1
     RETURNING *`,
    values,
  );
  return rows[0];
};

const bumpThread = async (id) => {
  const { rows } = await pool.query(
    `UPDATE threads SET bumped_at = now() WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0];
};

const deleteThread = async (id) => {
  const { rows } = await pool.query(
    `
      DELETE FROM threads
      WHERE id = $1
      RETURNING *
    `,
    [id],
  );
  return rows[0];
};

export {
  getThreads,
  getThreadById,
  getThreadsByBoardSlug,
  getThreadsByBoardId,
  createThread,
  updateThread,
  bumpThread,
  deleteThread,
};
