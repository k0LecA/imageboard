import * as fileModel from '../models/files.js'

const getFilesByPost = async (req, res) => {
  const postId = req.params.postId
  try {
    const result = await boardModel.getFilesByPostId(postId)
    if (!result) {
      return res.status(404).json({ error: 'Not Found' })
    }
    res.status(200).json(result)
  } catch (error) {
    console.log(`Error getting board by slug ${error}`)
    res.status(500).json({ error: 'Internal' })
  }
}

const createFile = async (req, res) => {
  const { postId,s3Key,originalName,size,mimeType } = req.body
  try {
    const result = await fileModel.createFile({
      postId,
      s3Key,
      originalName,
      size,
      mimeType,
    })
    if (!result) {
      res.status(400).json({ error: 'Error creating' })
    }
    res.status(201).json(result)
  } catch (error) {
    console.log(`Error creating board ${error}`)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

export { getFilesByPost, createFile }
