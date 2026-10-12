import {
  createPost as createPostRecord,
  deletePost as deletePostRecord,
  getPostsByThreadId,
} from "../models/posts.js";

const getAllPostsByThread = async (req, res) => {
  try {
    const posts = await getPostsByThreadId(req.params.threadId);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const createPost = async (req, res) => {
  const { threadId, boardId, message } = req.body;

  try {
    const post = await createPostRecord({
      threadId,
      boardId,
      authorIpHash: req.hashedIp,
      message,
    });
    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await deletePostRecord(req.params.postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    return res.status(200).send("Post deleted");
  } catch (error) {
    return res.status(500).send(error);
  }
};

export { getAllPostsByThread, createPost, deletePost };
