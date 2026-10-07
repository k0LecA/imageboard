import pool from "../configs/dbConfig.js";

const createSession = async ({ moderatorId, expiresAt }) => {
  const { rows } = await pool.query(
    `
    INSERT INTO sessions (moderator_id, expires_at)
    VALUES ($1, $2)
    RETURNING *;
  `,
    [moderatorId, expiresAt],
  );
  return rows[0];
};

const deleteSession = async (sessionId) => {
  const { rows } = await pool.query(
    `
    DELETE FROM sessions
    WHERE id = $1
    RETURNING *;
  `,
    [sessionId],
  );
  return rows[0];
};

export { createSession, deleteSession };
