import pool from "../configs/dbConfig.js";

const createReport = async ({ boardId, threadId, postId, fileId, reason }) => {
  const { rows } = await pool.query(
    `INSERT INTO reports (board_id, thread_id, post_id, file_id, reason)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [boardId, threadId ?? null, postId ?? null, fileId ?? null, reason],
  );
  return rows[0];
};

const getReportById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM reports WHERE id = $1`, [id]);
  return rows[0];
};

const getReports = async ({ boardId, status, threadId, postId, fileId } = {}) => {
  const filters = [];
  const values = [];
  for (const [column, value] of [
    ["board_id", boardId],
    ["status", status],
    ["thread_id", threadId],
    ["post_id", postId],
    ["file_id", fileId],
  ]) {
    if (value !== undefined) {
      values.push(value);
      filters.push(`${column} = $${values.length}`);
    }
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM reports ${where} ORDER BY created_at DESC`,
    values,
  );
  return rows;
};

const reviewReport = async (id, { status, reviewedBy, moderatorNotes }) => {
  const { rows } = await pool.query(
    `UPDATE reports
     SET status = $2, reviewed_by = $3, moderator_notes = $4, reviewed_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, status, reviewedBy ?? null, moderatorNotes ?? null],
  );
  return rows[0];
};

const deleteReport = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM reports WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0];
};

export { createReport, getReportById, getReports, reviewReport, deleteReport };
