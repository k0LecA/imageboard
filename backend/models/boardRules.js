import pool from "../configs/dbConfig.js";

const getBoardRules = async (boardId) => {
  const { rows } = await pool.query(
    `SELECT * FROM board_rules WHERE board_id = $1 ORDER BY position ASC`,
    [boardId],
  );
  return rows;
};

const getBoardRuleById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM board_rules WHERE id = $1`,
    [id],
  );
  return rows[0];
};

const createBoardRule = async ({ boardId, position, title, body }) => {
  const { rows } = await pool.query(
    `INSERT INTO board_rules (board_id, position, title, body)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [boardId, position, title ?? null, body],
  );
  return rows[0];
};

const updateBoardRule = async (id, { position, title, body }) => {
  const fields = [["position", position], ["title", title], ["body", body]];
  const values = [id];
  const updates = [];

  for (const [column, value] of fields) {
    if (value !== undefined) {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    }
  }
  if (updates.length === 0) return getBoardRuleById(id);

  updates.push("updated_at = now()");
  const { rows } = await pool.query(
    `UPDATE board_rules SET ${updates.join(", ")} WHERE id = $1 RETURNING *`,
    values,
  );
  return rows[0];
};

const deleteBoardRule = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM board_rules WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0];
};

export {
  getBoardRules,
  getBoardRuleById,
  createBoardRule,
  updateBoardRule,
  deleteBoardRule,
};
