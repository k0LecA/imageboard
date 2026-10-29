import * as boardModel from "../models/boards.js";
import createHttpError from "../utils/httpError.js";

const getAllBoards = async (req, res, next) => {
  try {
    const boards = await boardModel.getBoards();
    if (!boards) {
      return next(createHttpError(404, "No boards found"));
    }
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
  const { slug, name,description , bumpLimit, maxThreads } = req.body;

  try {
    const board = await boardModel.createBoard({
      slug,
      name,
      description,
      bumpLimit,
      maxThreads,
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

const updateBoard = async (req, res, next) => {
  const { slug } = req.params;
  const { name, description, bumpLimit, maxThreads, theme } = req.body;

  try {
    const updatedBoard = await boardModel.updateBoardBySlug(slug, {
      name,
      description,
      bumpLimit,
      maxThreads,
      theme
    });
    if (!updatedBoard) {
      return next(createHttpError(404, "Board not found"));
    }
    return res.status(200).json({ data: updatedBoard });
  } catch (error) {
    return next(error);
  }
}

const deleteBoard = async (req, res, next) => {
  const { slug } = req.params;

  try {
    const deletedBoard = await boardModel.deleteBoardBySlug(slug);
    if (!deletedBoard) {
      return next(createHttpError(404, "Board not found"));
    }
    return res.status(200).json({ data: deletedBoard });
  } catch (error) {
    return next(error);
  }
}

export { getAllBoards, getBoardBySlug, createBoard, updateBoard, deleteBoard };
