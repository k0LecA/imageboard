import * as fileModel from "../models/files.js";
import createHttpError from "../utils/httpError.js";

const getFilesByPost = async (req, res, next) => {
  try {
    const files = await fileModel.getFilesByPostId(req.params.postId);
    return res.status(200).json({ data: files });
  } catch (error) {
    return next(error);
  }
};

const createFile = async (req, res, next) => {
  const { postId, s3Key, originalName, size, mimeType } = req.body;

  try {
    const file = await fileModel.createFile({
      postId,
      s3Key,
      originalName,
      size,
      mimeType,
    });
    if (!file) {
      return next(createHttpError(400, "Could not create file"));
    }
    return res.status(201).json({ data: file });
  } catch (error) {
    return next(error);
  }
};

export { getFilesByPost, createFile };
