import * as boardModel from '../models/boards.js'

const getAllBoards = async (req, res) => {
  try {
    const results = await boardModel.getBoards()
    if (results.length === 0) {
      return res.status(404).json({ error: 'Not Found' })
    }
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ error: 'Internal' })
    console.log(`Error listing all boards ${error}`)
  }
}

const getBoardBySlug = async (req, res) => {
  const slug = req.params.slug
  try {
    const result = await boardModel.getBoardBySlug(slug)
    if (!result) {
      return res.status(404).json({ error: 'Not Found' })
    }
    res.status(200).json(result)
  } catch (error) {
    console.log(`Error getting board by slug ${error}`)
    res.status(500).json({ error: 'Internal' })
  }
}

const createBoard = async (req, res) => {
  const { slug, name, bumpLimit, maxThreads } = req.body
  try {
    const result = await boardModel.createBoard({
      slug,
      name,
      bumpLimit,
      maxThreads,
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

export { getAllBoards, getBoardBySlug, createBoard }
