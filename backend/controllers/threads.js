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
      res.status(404).send("Not found p");
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

    await client.query(
      `INSERT INTO posts(thread_id,board_id,author_ip_hash,message)
        VALUES ($1,$2,'yes',$3)`,
      [threadId,data.board_id,data.message]);

    await client.query('COMMIT');

    res.status(201).json({threadId});

  } catch(error){
    await client.query('ROLLBACK');
    res.status(404).send("post error");
  } finally {
    client.release();
  }
}



export { getThreadsByBoard, createThread } ;
