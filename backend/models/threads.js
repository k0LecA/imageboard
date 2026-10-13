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

const createThread = async ({ boardId, isPinned, isLocked }) => {
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

const updateThread = async ({ id, isPinned, isLocked }) => {
  const { rows } = await pool.query(
    `
      UPDATE threads
      SET is_pinned = $2, is_locked = $3
      WHERE id = $1
      RETURNING *
    `,
    [id, isPinned, isLocked],
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
  deleteThread,
};
