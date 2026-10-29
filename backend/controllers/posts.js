import * as postModel from "../models/posts.js";
import * as storageService from "../services/storageService.js";
import createHttpError from "../utils/httpError.js";
import * as boardModel from "../models/boards.js";

const getAllPostsByThread = async (req, res, next) => {
  try {
    const posts = await postModel.getPostsByThreadId(req.params.threadId);
    return res.status(200).json({ data: posts });
  } catch (error) {
    return next(error);
  }
};

const createPost = async (req, res, next) => {
  const { message } = req.body;
  const { slug,threadId } = req.params;
  const board = await boardModel.getBoardBySlug(slug);
  const boardId = board.id;
  let uploadedFile;

  try {
    if (req.file) {
      uploadedFile = await storageService.uploadFile(req.file);
    }

    const post = await postModel.createPost({
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
        await storageService.deleteFile(uploadedFile.s3Key);
      } catch (cleanupError) {
        console.error("Failed to remove uploaded file after post creation failed:", cleanupError);
      }
    }
    return next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await postModel.deletePost(req.params.postId);
    if (!post) {
      return next(createHttpError(404, "Post not found"));
    }
    return res.status(200).json({ data: { message: "Post deleted" } });
  } catch (error) {
    return next(error);
  }
};

export { getAllPostsByThread, createPost, deletePost };
