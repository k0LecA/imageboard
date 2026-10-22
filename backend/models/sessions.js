import pool from "../configs/dbConfig.js";

const createSession = async ({ moderatorId, expiresAt, tokenHash }) => {
  const { rows } = await pool.query(
    `
      INSERT INTO sessions (moderator_id, expires_at, token_hash)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [moderatorId, expiresAt, tokenHash],
  );
  return rows[0];
};

const deleteSession = async (sessionId) => {
  const { rows } = await pool.query(
    `
      DELETE FROM sessions
      WHERE id = $1
      RETURNING *
    `,
    [sessionId],
  );
  return rows[0];
};

const getSessionById = async (sessionId) => {
  const { rows } = await pool.query(
    `SELECT * FROM sessions WHERE id = $1`,
    [sessionId],
  );
  return rows[0];
};

const deleteExpiredSessions = async (now = new Date()) => {
  const { rows } = await pool.query(
    `DELETE FROM sessions WHERE expires_at <= $1 RETURNING *`,
    [now],
  );
  return rows;
};

export { createSession, getSessionById, deleteSession, deleteExpiredSessions };
