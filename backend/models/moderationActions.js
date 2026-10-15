import pool from "../configs/dbConfig.js";

const createModerationAction = async ({
  moderatorId,
  boardId,
  action,
  targetType,
  targetId,
  details,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO moderation_actions
       (moderator_id, board_id, action, target_type, target_id, details)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [moderatorId ?? null, boardId ?? null, action, targetType, targetId ?? null, details ?? {}],
  );
  return rows[0];
};

const getModerationActionById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM moderation_actions WHERE id = $1`,
    [id],
  );
  return rows[0];
};

const getModerationActions = async ({ boardId, targetType, targetId } = {}) => {
  const filters = [];
  const values = [];
  for (const [column, value] of [
    ["board_id", boardId],
    ["target_type", targetType],
    ["target_id", targetId],
  ]) {
    if (value !== undefined) {
      values.push(value);
      filters.push(`${column} = $${values.length}`);
    }
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM moderation_actions ${where} ORDER BY created_at DESC`,
    values,
  );
  return rows;
};

export { createModerationAction, getModerationActionById, getModerationActions };
