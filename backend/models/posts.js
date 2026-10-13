import pool from "../configs/dbConfig.js";

const getPosts = async () => {
  const { rows } = await pool.query("SELECT * FROM posts");
  return rows;
};

const getPostsByThreadId = async (threadId) => {
  const { rows: posts } = await pool.query(
    `
      SELECT *
      FROM posts
      WHERE thread_id = $1
    `,
    [threadId],
  );

  if (posts.length === 0) return [];

  const { rows: files } = await pool.query(
    `
      SELECT * FROM files WHERE post_id = ANY($1)
    `,
    [posts.map((p) => p.id)]
  );

  const filesByPost = new Map();
  for (const f of files) {
    if (!filesByPost.has(f.post_id)) filesByPost.set(f.post_id, []);
    filesByPost.get(f.post_id).push(f);
  }


  return posts.map((p) => ({ ...p, files: filesByPost.get(p.id) ?? [] }));
};

const createPost = async ({ threadId, boardId, authorIpHash, message }) => {
  const { rows } = await pool.query(
    `
      INSERT INTO posts (thread_id, board_id, author_ip_hash, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [threadId, boardId, authorIpHash, message],
  );
  return rows[0];
};

const updatePost = async ({ id, message }) => {
  const { rows } = await pool.query(
    `
      UPDATE posts
      SET message = $1
      WHERE id = $2
      RETURNING *
    `,
    [message, id],
  );
  return rows[0];
};

const deletePost = async (id) => {
  const { rows } = await pool.query(
    `
      DELETE FROM posts
      WHERE id = $1
      RETURNING *
    `,
    [id],
  );
  return rows[0];
};

export { getPosts, getPostsByThreadId, createPost, updatePost, deletePost };
