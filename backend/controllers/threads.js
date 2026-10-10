import pool from '../configs/dbConfig.js';

const getThreadsByBoard = async (req,res) => {
  const slug=req.params.slug;
  try{
    const results = await pool.query(
      `SELECT threads.*
       FROM threads
       JOIN boards ON boards.id = threads.board_id
       WHERE boards.slug = $1
       ORDER BY threads.id ASC`,
      [slug]
    );
    if(!results.rows[0]){
      //return res.status(404).json(results.rows);
    }
    res.status(200).json(results.rows);
  } catch(error){
    res.status(404).send(error);
  }
}

const createThread = async (req,res) => {
  console.log("Cia");
  const client=await pool.connect();
  const data=req.body; //board_id subject message

  try {
    await client.query('BEGIN');

    const thread = await client.query(
      `INSERT INTO threads(board_id, subject,is_pinned,is_locked)
      VALUES ($1,$2,false,false)
      RETURNING id`,
      [data.board_id,data.subject]);

    const threadId=thread.rows[0].id;
    const authorIpHash = req.hashedIp;

    await client.query(
      `INSERT INTO posts(thread_id,board_id,author_ip_hash,message)
        VALUES ($1,$2,$3,$4)`,
      [threadId,data.board_id,authorIpHash,data.message]);

    await client.query('COMMIT');

    res.status(201).json({threadId});

  } catch(error){
    await client.query('ROLLBACK');
    res.status(404).send("post error");
  } finally {
    client.release();
  }
}

const deleteThread = async (req, res) => {
  const threadId = req.params.threadId;

  try {
    const result = await pool.query(`DELETE FROM threads WHERE id=$1`, [threadId]);
    if(!result.rowCount) {
      return res.status(404).send("Thread not found");
    }
    res.status(200).send("Thread deleted");
  } catch (error) {
    res.status(500).send(error);
  }
}

export { getThreadsByBoard, createThread, deleteThread } ;
