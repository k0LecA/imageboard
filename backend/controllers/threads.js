import pool from "../configs/dbConfig.js";
import {
  deleteThread as deleteThreadRecord,
  getThreadById,
  getThreadsByBoardSlug,
} from "../models/threads.js";

const getThread = async (req, res) => {
  try {
    const thread = await getThreadById(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }
    return res.status(200).json(thread);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getThreadsByBoard = async (req, res) => {
  try {
    const result = await getThreadsByBoardSlug(req.params.slug);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const createThread = async (req, res) => {
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
    return res.status(201).json({ threadId });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).send(error);
  } finally {
    client.release();
  }
};

const deleteThread = async (req, res) => {
  try {
    const thread = await deleteThreadRecord(req.params.threadId);
    if (!thread) {
      return res.status(404).send("Thread not found");
    }
    return res.status(200).send("Thread deleted");
  } catch (error) {
    return res.status(500).send(error);
  }
};

export { getThread, getThreadsByBoard, createThread, deleteThread };
