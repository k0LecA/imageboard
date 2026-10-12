import pool from "../configs/dbConfig.js";

const getLastThreadId = async () => {
  const { rows } = await pool.query(
    "SELECT last_value FROM threads_id_seq",
  );
  return rows[0].last_value;
};

export default getLastThreadId;
