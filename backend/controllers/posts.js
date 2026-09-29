import pool from '../configs/dbConfig.js';

const createPost = async (req,res) => {
  const data=req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO posts()`
    )
  } catch (error) {
    res.status(404).send("response post error")
    client.query('ROLLBACK')
  } finally {
    client.release();
  }
}

export default createPost;
