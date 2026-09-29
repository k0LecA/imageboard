import pool from '../configs/dbConfig.js';

const getAllPostsByThread = async (req,res)=>{
  const threadId=req.params.threadId;
  try{
    const results=await pool.query(`
      SELECT * FROM posts WHERE thread_id=$1 ORDER BY id ASC`,[threadId]);
    if(!results.rows[0]){
      res.status(404).send("empty");
    }
    res.status(200).json(results.rows);
  } catch(error) {
    res.status(404).send(error);
  }
}

const createPost = async (req,res) => {
  const data=req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const post = await client.query(
      `INSERT INTO posts(thread_id,board_id,author_ip_hash,message)
        VALUES ($1,$2,'yes',$3)
        RETURNING id`,
      [data.threadId,data.board_id,data.message]);

    const postId= post.rows[0].id;

    await client.query('COMMIT');
    res.status(201).json({postId});

  } catch (error) {
    res.status(404).send("response post error")
    client.query('ROLLBACK')
  } finally {
    client.release();
  }
}

export { getAllPostsByThread, createPost };
