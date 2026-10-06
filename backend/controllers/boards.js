import pool from '../configs/dbConfig.js';
import * as boardModel from '../models/boards.js'

const getAllBoards = async (req, res) => {
  try{
    const results = await boardModel.getBoards();
    res.status(200).json(results);
  } catch (error){
    console.log(`Error listing all boards ${error}`);
  }
};

const getBoardBySlug = async (req,res) =>{
  const slug=req.params.slug;
  try{
    const result = await boardModel.getBoardBySlug(slug);
    if(!result){
      res.status(404).json({error:"Not Found"});
    }
    res.status(200).json(result);
  } catch (error){
    console.log(`Error getting board by slug ${error}`);
  }
}

const createBoard = async (req, res) => {
  const { slug, name, bump_limit, max_threads } = req.body;
  try {
    const result = await boardModel.createBoard(slug, name, bump_limit, max_threads);
    res.status(201).json(result);
  } catch (error) {
    console.log(`Error creating board ${error}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export { getAllBoards , getBoardBySlug, createBoard };
