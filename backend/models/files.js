import pool from "../configs/dbConfig.js";

const createFile = async ({ postId, s3Key, originalName, size, mimeType, db = pool }) => {
  const { rows } = await db.query(
    `
      INSERT INTO files (post_id, s3_key, original_name, size, mime_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [postId, s3Key, originalName, size, mimeType],
  );
  return rows[0];
};

const getFilesByPostId = async (postId) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM files
      WHERE post_id = $1
    `,
    [postId],
  );
  return rows;
};

const getFileById = async (fileId) => {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM files
      WHERE id = $1
    `,
    [fileId],
  );
  return rows[0];
};

const deleteFile = async (fileId) => {
  const { rows } = await pool.query(
    `
      DELETE FROM files
      WHERE id = $1
      RETURNING *
    `,
    [fileId],
  );
  return rows[0];
};

export { createFile, getFilesByPostId, getFileById, deleteFile };
