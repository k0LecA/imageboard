import pool from "../configs/dbConfig.js";

const createFile = async ({ postId, s3Key, originalName, size, mimeType }) => {
  const result = await pool.query(
    `
    INSERT INTO files (post_id, s3_key, original_name, size, mime_type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
    [postId, s3Key, originalName, size, mimeType],
  );
  return result.rows[0];
};

const getFilesByPostId = async (postId) => {
  const result = await pool.query(
    `
    SELECT * FROM files WHERE post_id = $1
  `,
    [postId],
  );
  return result.rows;
};

const deleteFile = async (fileId) => {
  const result = await pool.query(
    `
    DELETE FROM files WHERE id = $1
    RETURNING *
  `,
    [fileId],
  );
  return result.rows[0];
};

export { createFile, getFilesByPostId, deleteFile };
