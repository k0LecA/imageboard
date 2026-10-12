import {
  createPost as createPostRecord,
  deletePost as deletePostRecord,
  getPostsByThreadId,
} from "../models/posts.js";
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
  const { threadId, boardId, message } = req.body;

  try {
    const post = await createPostRecord({
      threadId,
      boardId,
      authorIpHash: req.hashedIp,
      message,
    });
    return res.status(201).json({ data: post });
  } catch (error) {
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
