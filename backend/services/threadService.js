import pool from "../configs/dbConfig.js";
import * as threadModel from "../models/threads.js";
import * as postModel from "../models/posts.js";
import * as fileModel from "../models/files.js";

const createThread = async (data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const threadResult = await threadModel.createThread({
      boardId: data.boardId,
      isPinned: data.isPinned,
      isLocked: data.isLocked,
      db: client
    });
    const threadId = threadResult.rows[0].id;

    const postResult = await postModel.createPost({
      threadId,
      boardId: data.boardId,
      message: data.message,
      db: client
    });
    const postId = postResult.rows[0].id;

    for (const file of data.files ?? []) {
      await fileModel.createFile({ postId, ...file, db: client });
    }

    await client.query('COMMIT');
    return threadId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};