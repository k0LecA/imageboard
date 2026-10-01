import pool from '../configs/dbConfig.js'

const createFile = async ({post_id,s3_key,original_name,size,mime_type}) => {
  const result = await pool.query(`
    INSERT INTO files (post_id, s3_key, original_name, size, mime_type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [post_id, s3_key, original_name, size, mime_type]);
  return result.rows[0];
};

const getFilesByPostId = async (post_id) => {
  const result = await pool.query(`
    SELECT * FROM files WHERE post_id = $1
  `, [post_id]);
  return result.rows;
};

const deleteFile = async (file_id) => {
  const result = await pool.query(`
    DELETE FROM files WHERE file_id = $1
    RETURNING *
  `, [file_id]);
  return result.rows[0];
};

export { createFile, getFilesByPostId, deleteFile };
