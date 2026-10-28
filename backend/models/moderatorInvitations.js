import pool from "../configs/dbConfig.js";

const createModeratorInvitation = async ({
  tokenHash,
  label,
  createdBy,
  expiresAt,
  boardIds = [],
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO moderator_invitations (token_hash, label, created_by, expires_at)
       VALUES ($1, $2, $3, COALESCE($4, now() + interval '3 days')) RETURNING *`,
      [tokenHash, label ?? null, createdBy ?? null, expiresAt ?? null],
    );
    const invitation = rows[0];
    for (const boardId of boardIds) {
      await client.query(
        `INSERT INTO moderator_invitation_boards (invitation_id, board_id) VALUES ($1, $2)`,
        [invitation.id, boardId],
      );
    }
    await client.query("COMMIT");
    return { ...invitation, board_ids: boardIds };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getModeratorInvitationById = async (id) => {
  const { rows } = await pool.query(
    `SELECT i.*, COALESCE(array_agg(ib.board_id) FILTER (WHERE ib.board_id IS NOT NULL), '{}') AS board_ids
     FROM moderator_invitations i
     LEFT JOIN moderator_invitation_boards ib ON ib.invitation_id = i.id
     WHERE i.id = $1 GROUP BY i.id`,
    [id],
  );
  return rows[0];
};

const getModeratorInvitationByTokenHash = async (tokenHash) => {
  const { rows } = await pool.query(
    `SELECT * FROM moderator_invitations WHERE token_hash = $1`,
    [tokenHash],
  );
  return rows[0];
};

const updateModeratorInvitation = async (
  id,
  { usedBy, usedAt, revokedBy, revokedAt, expiresAt, label },
) => {
  const values = [id];
  const updates = [];
  for (const [column, value] of [
    ["used_by", usedBy], ["used_at", usedAt], ["revoked_by", revokedBy],
    ["revoked_at", revokedAt], ["expires_at", expiresAt], ["label", label],
  ]) {
    if (value !== undefined) {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    }
  }
  if (updates.length === 0) return getModeratorInvitationById(id);
  const { rows } = await pool.query(
    `UPDATE moderator_invitations SET ${updates.join(", ")} WHERE id = $1 RETURNING *`,
    values,
  );
  return rows[0];
};

const deleteModeratorInvitation = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM moderator_invitations WHERE id = $1 RETURNING *`,
    [id],
  );
  return rows[0];
};

export {
  createModeratorInvitation,
  getModeratorInvitationById,
  getModeratorInvitationByTokenHash,
  updateModeratorInvitation,
  deleteModeratorInvitation,
};
