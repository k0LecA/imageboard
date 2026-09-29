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

export { getAllBoards , getBoardBySlug };
