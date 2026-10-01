import pool from '../configs/dbConfig.js';

const getAllBoards = async (req, res) => {
  try{
    const results = await pool.query('SELECT * FROM boards ORDER BY id ASC');
    res.status(200).json(results.rows);
  } catch (error){
    console.log(`Error listing all boards ${error}`);
  }
};

const getBoardBySlug = async (req,res) =>{
  const slug=req.params.slug;
  try{
    const result = await pool.query('SELECT * FROM boards WHERE slug=$1',[slug])
    if(!result.rows[0]){
      res.status(404).json({error:"Not Found"});
    }
    res.status(200).json(result.rows);
  } catch (error){
    console.log(`Error getting board by slug ${error}`);
  }
}

const createBoard = async (req, res) => {
  const { slug, name, bump_limit, max_threads } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO boards (slug, name, bump_limit, max_threads)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [slug, name, bump_limit, max_threads]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(`Error creating board ${error}`);
  }
};

export { getAllBoards , getBoardBySlug };
