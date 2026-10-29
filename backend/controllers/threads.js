import createHttpError from "../utils/httpError.js";
import * as storageService from "../services/storageService.js";
import * as threadModel from "../models/threads.js";
import threadService from "../services/threadService.js";
import * as boardModel from "../models/boards.js";

const getThreadById = async (req, res, next) => {
  console.log('Fetching thread with ID:', req.params.threadId);
  try {
    const thread = await threadModel.getThreadById(req.params.threadId);
    if (!thread) {
      return next(createHttpError(404, "Thread not found"));
    }
    return res.status(200).json({ data: thread });
  } catch (error) {
    return next(error);
  }
};

const getThreadsByBoard = async (req, res, next) => {
  try {
    const result = await threadModel.getThreadsByBoardSlug(req.params.slug);
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    return next(error);
  }
};

const createThread = async (req, res, next) => {
  const { message } = req.body;
  const { slug } = req.params
  console.log('Request body:', req.body);
  const board = await boardModel.getBoardBySlug(slug);
  const uploadedFiles = [];

  console.log('Creating thread with message:', message);
  console.log('slug:', slug);
  console.log('board:', board.id);


  try {
    for (const file of req.files ?? []) {
      uploadedFiles.push(await storageService.uploadFile(file));
    }

    const threadId = await threadService.createThread({
      boardId: board.id,
      message,
      files: uploadedFiles
    });

    res.status(201).json({ data: { threadId } });
  } catch (error) {
    for (const file of uploadedFiles) {
      try {
        await storageService.deleteFile(file.s3Key);
      } catch (cleanupError) {
        console.error('File cleanup failed:', cleanupError);
      }
    }

    next(error);
  }
};

const updateThreadById = async (req, res, next) => {
  const { threadId } = req.params;
  const { message, isPinned, isLocked } = req.body;

  try {
    const updatedThread = await threadModel.updateThreadById(threadId, {
      message,
      isPinned,
      isLocked
    });

    if (!updatedThread) {
      return next(createHttpError(404, "Thread not found"));
    }

    return res.status(200).json({ data: updatedThread });
  } catch (error) {
    return next(error);
  }
}

const deleteThreadById = async (req, res, next) => {
  const { threadId } = req.params;

  try {
    const deletedThread = await threadModel.deleteThreadById(threadId);

    if (!deletedThread) {
      return next(createHttpError(404, "Thread not found"));
    }

    return res.status(200).json({ data: deletedThread });
  } catch (error) {
    return next(error);
  }
}

export { getThreadById, getThreadsByBoard, createThread, updateThreadById, deleteThreadById };
