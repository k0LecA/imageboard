import * as fileModel from "../models/files.js";

const getFilesByPost = async (req, res) => {
  try {
    const files = await fileModel.getFilesByPostId(req.params.postId);
    if (files.length === 0) {
      return res.status(404).json({ error: "Not Found" });
    }
    return res.status(200).json(files);
  } catch (error) {
    console.log(`Error getting files by post ${error}`);
    return res.status(500).json({ error: "Internal" });
  }
};

const createFile = async (req, res) => {
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
      return res.status(400).json({ error: "Error creating" });
    }
    return res.status(201).json(file);
  } catch (error) {
    console.log(`Error creating file ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getFilesByPost, createFile };
