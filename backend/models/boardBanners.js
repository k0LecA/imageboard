import pool from "../configs/dbConfig.js";

const getBoardBanner = async (boardId) => {
  const { rows } = await pool.query(
    `SELECT * FROM board_banners WHERE board_id = $1`,
    [boardId],
  );
  return rows[0];
};

const upsertBoardBanner = async ({ boardId, s3Key, originalName, size, mimeType }) => {
  const { rows } = await pool.query(
    `INSERT INTO board_banners (board_id, s3_key, original_name, size, mime_type)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (board_id) DO UPDATE
     SET s3_key = EXCLUDED.s3_key,
         original_name = EXCLUDED.original_name,
         size = EXCLUDED.size,
         mime_type = EXCLUDED.mime_type,
         updated_at = now()
     RETURNING *`,
    [boardId, s3Key, originalName, size, mimeType],
  );
  return rows[0];
};

const deleteBoardBanner = async (boardId) => {
  const { rows } = await pool.query(
    `DELETE FROM board_banners WHERE board_id = $1 RETURNING *`,
    [boardId],
  );
  return rows[0];
};

export { getBoardBanner, upsertBoardBanner, deleteBoardBanner };
