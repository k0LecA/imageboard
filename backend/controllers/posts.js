import pool from '../configs/dbConfig.js';

const getAllPostsByThread = async (req,res)=>{
  const threadId=req.params.threadId;
  try{
    const results=await pool.query(`
      SELECT * FROM posts WHERE thread_id=$1 ORDER BY id ASC`,[threadId]);
    if(!results.rows[0]){
      //res.status(404).send("empty");
    }
    res.status(200).json(results.rows);
  } catch(error) {
    res.status(404).send(error);
  }
}

const createPost = async (req,res) => {
  const data=req.body;
  const client = await pool.connect();
  const authorIpHash = req.hashedIp;

  try {
    await client.query('BEGIN');


    const post = await client.query(
      `INSERT INTO posts(thread_id,board_id,author_ip_hash,message)
        VALUES ($1,$2,$3,$4)
        RETURNING id`,
      [data.threadId,data.board_id,authorIpHash,data.message]);

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

const deletePost = async (req, res) => {
  const postId = req.params.postId;

  try {
    const result = await pool.query(`DELETE FROM posts WHERE id=$1`, [postId]);
    if(!result.rowCount) {
      return res.status(404).send("Post not found");
    }
    res.status(200).send("Post deleted");
  } catch (error) {
    res.status(500).send(error);
  }
}

export { getAllPostsByThread, createPost, deletePost };
