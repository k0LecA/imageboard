import express from 'express';
import { getThreadsByBoard, createThread } from '../controllers/threads.js';
import postRoutes from './posts.js';

const router = express.Router({ mergeParams: true });

router.get('/', getThreadsByBoard);
router.post('/', createThread);
router.use('/:threadId', postRoutes)

export default router;
