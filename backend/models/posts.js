import pool from "../configs/dbConfig.js";
import { createFile } from "./files.js";

const getPosts = async () => {
  const { rows } = await pool.query("SELECT * FROM posts");
  return rows;
};

const getPostsByThreadId = async (threadId) => {
  const { rows: posts } = await pool.query(
    `
      SELECT id, thread_id, board_id, is_op, message, created_at
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

const createPostWithClient = async (db, { threadId, boardId, isOp, message, file }) => {
  const { rows } = await db.query(
    `INSERT INTO posts (thread_id, board_id, is_op, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [threadId, boardId, isOp ?? false, message],
  );
  const post = rows[0];

  if (file) {
    const savedFile = await createFile({
      postId: post.id,
      ...file,
      db,
    });
    post.files = [savedFile];
  } else {
    post.files = [];
  }

  return post;
};

const createPost = async ({ threadId, boardId, isOp, message, file, db }) => {
  if (db) {
    return createPostWithClient(db, { threadId, boardId, isOp, message, file });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const post = await createPostWithClient(client, { threadId, boardId, isOp, message, file });
    await client.query("COMMIT");
    return post;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Failed to roll back post creation:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
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
