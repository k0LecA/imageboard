import createHttpError from "../utils/httpError.js";
import * as storageService from "../services/storageService.js";
import * as threadModel from "../models/threads.js";
import threadService from "../services/threadService.js";

const getThread = async (req, res, next) => {
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
  const { board_id: boardId, message, isPinned, isLocked } = req.body;
  const uploadedFiles = [];

  try {
    for (const file of req.files ?? []) {
      uploadedFiles.push(await storageService.storeFile(file));
    }

    const threadId = await threadService.createThread({
      boardId,
      message,
      isPinned,
      isLocked,
      authorIpHash: req.hashedIp,
      files: uploadedFiles
    });

    res.status(201).json({ data: { threadId } });
  } catch (error) {
    for (const file of uploadedFiles) {
      try {
        await storageService.deleteStoredFile(file.s3Key);
      } catch (cleanupError) {
        console.error('File cleanup failed:', cleanupError);
      }
    }

    next(error);
  }
};

export { getThread, getThreadsByBoard, createThread };
