import pool from "../configs/dbConfig.js";

const getPosts = async () => {
  const result = await pool.query("SELECT * FROM posts");
  return result.rows;
};

const getPostsByThreadId = async (threadId) => {
  const result = await pool.query(
    `
    SELECT * FROM posts
    WHERE thread_id = $1
  `,
    [threadId],
  );
  return result.rows;
};

const createPost = async ({ threadId, boardId, authorIpHash, message }) => {
  const result = await pool.query(
    `
    INSERT INTO posts (thread_id, board_id, author_ip_hash, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    [threadId, boardId, authorIpHash, message],
  );
  return result.rows[0];
};

const updatePost = async ({ id, message }) => {
  const result = await pool.query(
    `
    UPDATE posts
    SET message = $1
    WHERE id = $2
    RETURNING *
  `,
    [message, id],
  );
  return result.rows[0];
};

const deletePost = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM posts
    WHERE id = $1
    RETURNING *
  `,
    [id],
  );
  return result.rows[0];
};

export { getPosts, getPostsByThreadId, createPost, updatePost, deletePost };
