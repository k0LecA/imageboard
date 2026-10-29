import * as fileModel from "../models/files.js";
import { getFile as getStoredFile } from "../services/storageService.js";
import createHttpError from "../utils/httpError.js";

const getFile = async (req, res, next) => {
  try {
    const file = await fileModel.getFileById(req.params.fileId);
    if (!file) {
      return next(createHttpError(404, "File not found"));
    }

    const imageTypes = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"]);
    if (!imageTypes.has(file.mime_type)) {
      return next(createHttpError(415, "Unsupported image type"));
    }

    const stream = await getStoredFile(file.s3_key);
    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Content-Type-Options", "nosniff");
    stream.on("error", (error) => {
      if (res.headersSent) return res.destroy(error);
      return next(error);
    });
    return stream.pipe(res);
  } catch (error) {
    return next(error);
  }
};

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

export { getFile, getFilesByPost, createFile };
