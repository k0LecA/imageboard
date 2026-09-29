import pool from '../configs/dbConfig.js';

const getThreadCount = async (req,res)=>{
  try {
    const result = await pool.query('SELECT last_value FROM threads_id_seq;');
    res.status(200).json(result.rows[0].last_value);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export default getThreadCount;
