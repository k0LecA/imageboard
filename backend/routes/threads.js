import express from 'express';
import { getThreadsByBoard, createThread } from '../controllers/threads.js';
const router = express.Router();

router.get('/:slug', getThreadsByBoard);
router.post('/:slug', createThread);

export default router;
