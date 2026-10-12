import * as boardModel from "../models/boards.js";
import createHttpError from "../utils/httpError.js";

const getAllBoards = async (req, res, next) => {
  try {
    const boards = await boardModel.getBoards();
    return res.status(200).json({ data: boards });
  } catch (error) {
    return next(error);
  }
};

const getBoardBySlug = async (req, res, next) => {
  try {
    const board = await boardModel.getBoardBySlug(req.params.slug);
    if (!board) {
      return next(createHttpError(404, "Board not found"));
    }
    return res.status(200).json({ data: board });
  } catch (error) {
    return next(error);
  }
};

const createBoard = async (req, res, next) => {
  const { slug, name, bumpLimit, maxThreads } = req.body;

  try {
    const board = await boardModel.createBoard({
      slug,
      name,
      bumpLimit,
      maxThreads,
    });
    if (!board) {
      return next(createHttpError(400, "Could not create board"));
    }
    return res.status(201).json({ data: board });
  } catch (error) {
    return next(error);
  }
};

export { getAllBoards, getBoardBySlug, createBoard };
