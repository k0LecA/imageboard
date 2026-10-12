import * as boardModel from "../models/boards.js";

const getAllBoards = async (req, res) => {
  try {
    const boards = await boardModel.getBoards();
    if (boards.length === 0) {
      return res.status(404).json({ error: "Not Found" });
    }
    return res.status(200).json(boards);
  } catch (error) {
    console.log(`Error listing all boards ${error}`);
    return res.status(500).json({ error: "Internal" });
  }
};

const getBoardBySlug = async (req, res) => {
  try {
    const board = await boardModel.getBoardBySlug(req.params.slug);
    if (!board) {
      return res.status(404).json({ error: "Not Found" });
    }
    return res.status(200).json(board);
  } catch (error) {
    console.log(`Error getting board by slug ${error}`);
    return res.status(500).json({ error: "Internal" });
  }
};

const createBoard = async (req, res) => {
  const { slug, name, bumpLimit, maxThreads } = req.body;

  try {
    const board = await boardModel.createBoard({
      slug,
      name,
      bumpLimit,
      maxThreads,
    });
    if (!board) {
      return res.status(400).json({ error: "Error creating" });
    }
    return res.status(201).json(board);
  } catch (error) {
    console.log(`Error creating board ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getAllBoards, getBoardBySlug, createBoard };
