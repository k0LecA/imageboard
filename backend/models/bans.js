import pool from "../configs/dbConfig.js";

const createBan = async ({ ipHash, boardId, reason, createdBy, expiresAt }) => {
  const { rows } = await pool.query(
    `INSERT INTO bans (ip_hash, board_id, reason, created_by, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [ipHash, boardId ?? null, reason, createdBy ?? null, expiresAt ?? null],
  );
  return rows[0];
};

const getBanById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM bans WHERE id = $1`, [id]);
  return rows[0];
};

const getBansByIpHash = async (ipHash) => {
  const { rows } = await pool.query(
    `SELECT * FROM bans WHERE ip_hash = $1 ORDER BY created_at DESC`,
    [ipHash],
  );
  return rows;
};

const getActiveBansForBoard = async (ipHash, boardId, now = new Date()) => {
  const { rows } = await pool.query(
    `SELECT * FROM bans
     WHERE ip_hash = $1
       AND (board_id IS NULL OR board_id = $2)
       AND (expires_at IS NULL OR expires_at > $3)
     ORDER BY created_at DESC`,
    [ipHash, boardId, now],
  );
  return rows;
};

const deleteBan = async (id) => {
  const { rows } = await pool.query(`DELETE FROM bans WHERE id = $1 RETURNING *`, [id]);
  return rows[0];
};

export { createBan, getBanById, getBansByIpHash, getActiveBansForBoard, deleteBan };
