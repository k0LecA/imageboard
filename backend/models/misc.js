import pool from "../configs/dbConfig.js";

const getLastThreadId = async () => {
  const result = await pool.query('SELECT last_value FROM threads_id_seq;');
  return result.rows[0].last_value;
}

export default getLastThreadId;
