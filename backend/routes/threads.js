import express from 'express';
import { getThread,getThreadsByBoard, createThread, deleteThread } from '../controllers/threads.js';
import postRoutes from './posts.js';
import authCheck from '../middleware/authCheck.js';

const router = express.Router({ mergeParams: true });

router.get('/', getThreadsByBoard);
router.get('/:threadId', getThread);
router.post('/', createThread);
router.delete('/:threadId', authCheck, deleteThread);
router.use('/:threadId/posts/', postRoutes);

export default router;
