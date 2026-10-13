import {
  createPost as createPostRecord,
  deletePost as deletePostRecord,
  getPostsByThreadId,
} from "../models/posts.js";
import { deleteFile as deleteStoredFile, uploadFile } from "../services/storage.js";
import createHttpError from "../utils/httpError.js";

const getAllPostsByThread = async (req, res, next) => {
  try {
    const posts = await getPostsByThreadId(req.params.threadId);
    return res.status(200).json({ data: posts });
  } catch (error) {
    return next(error);
  }
};

const createPost = async (req, res, next) => {
  const { boardId, message } = req.body;
  const { threadId } = req.params;
  let uploadedFile;

  try {
    if (req.file) {
      uploadedFile = await uploadFile(req.file);
    }

    const post = await createPostRecord({
      threadId,
      boardId,
      authorIpHash: req.hashedIp,
      message,
      file: uploadedFile,
    });
    return res.status(201).json({ data: post });
  } catch (error) {
    if (uploadedFile) {
      try {
        await deleteStoredFile(uploadedFile.s3Key);
      } catch (cleanupError) {
        console.error("Failed to remove uploaded file after post creation failed:", cleanupError);
      }
    }
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await deletePostRecord(req.params.postId);
    if (!post) {
      return next(createHttpError(404, "Post not found"));
    }
    return res.status(200).json({ data: { message: "Post deleted" } });
  } catch (error) {
    return next(error);
  }
};

export { getAllPostsByThread, createPost, deletePost };
