import pool from "../configs/dbConfig.js";
import {
  deleteThread as deleteThreadRecord,
  getThreadById,
  getThreadsByBoardSlug,
} from "../models/threads.js";
import createHttpError from "../utils/httpError.js";

const getThread = async (req, res, next) => {
  try {
    const thread = await getThreadById(req.params.threadId);
    if (!thread) {
      return next(createHttpError(404, "Thread not found"));
    }
    return res.status(200).json({ data: thread });
  } catch (error) {
    return next(error);
  }
};

const getThreadsByBoard = async (req, res, next) => {
  try {
    const result = await getThreadsByBoardSlug(req.params.slug);
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
};

const createThread = async (req, res, next) => {
  const client = await pool.connect();
  const { board_id: boardId, subject, message } = req.body;

  try {
    await client.query("BEGIN");

    const threadResult = await client.query(
      `
        INSERT INTO threads (board_id, subject, is_pinned, is_locked)
        VALUES ($1, $2, false, false)
        RETURNING id
      `,
      [boardId, subject],
    );
    const threadId = threadResult.rows[0].id;

    await client.query(
      `
        INSERT INTO posts (thread_id, board_id, author_ip_hash, message)
        VALUES ($1, $2, $3, $4)
      `,
      [threadId, boardId, req.hashedIp, message],
    );

    await client.query("COMMIT");
    return res.status(201).json({ data: { threadId } });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(rollbackError);
    }
    return next(error);
  } finally {
    client.release();
  }
};

const deleteThread = async (req, res, next) => {
  try {
    const thread = await deleteThreadRecord(req.params.threadId);
    if (!thread) {
      return next(createHttpError(404, "Thread not found"));
    }
    return res.status(200).json({ data: { message: "Thread deleted" } });
  } catch (error) {
    return next(error);
  }
};

export { getThread, getThreadsByBoard, createThread, deleteThread };
