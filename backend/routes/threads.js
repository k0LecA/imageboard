import express from 'express';
import { getThreadsByBoard, getThreadById, createThread, updateThreadById, deleteThreadById } from '../controllers/threads.js';
import postRoutes from './posts.js';
import authCheck from '../middleware/authMiddleware.js';
import uploadFiles from '../middleware/uploadFiles.js';
import validateThread from '../middleware/validateThread.js';

const router = express.Router({ mergeParams: true });

router.get('/', getThreadsByBoard);
router.get('/:threadId', getThreadById);
router.post('/',validateThread, uploadFiles, createThread);
router.put('/:threadId', validateThread, authCheck, updateThreadById);
router.delete('/:threadId', authCheck, deleteThreadById);
router.use('/:threadId/posts/', postRoutes);

export default router;
