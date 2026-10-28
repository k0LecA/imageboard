import pool from "../configs/dbConfig.js";

const createModerationAction = async ({
  moderatorId,
  boardId,
  action,
  targetType,
  targetId,
  targetUuid,
  details,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO moderation_actions
       (moderator_id, board_id, action, target_type, target_id, target_uuid, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [moderatorId ?? null, boardId ?? null, action, targetType, targetId ?? null,
      targetUuid ?? null, details == null ? null : JSON.stringify(details)],
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

const getModerationActions = async ({ boardId, moderatorId, targetType, targetId, targetUuid } = {}) => {
  const filters = [];
  const values = [];
  for (const [column, value] of [
    ["board_id", boardId],
    ["moderator_id", moderatorId],
    ["target_type", targetType],
    ["target_id", targetId],
    ["target_uuid", targetUuid],
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
