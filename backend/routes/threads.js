import express from 'express';
import { getThreadsByBoard, createThread,updateThreadById,deleteThreadById} from '../controllers/threads.js';
import postRoutes from './posts.js';
import authCheck from '../middleware/authMiddleware.js';
import uploadFiles from '../middleware/uploadFiles.js';
import { getThreadById } from '../models/threads.js';

const router = express.Router({ mergeParams: true });

router.get('/', getThreadsByBoard);
router.get('/:threadId', getThreadById);
router.post('/', uploadFiles, createThread);
router.put('/:threadId', authCheck, updateThreadById);
router.delete('/:threadId', authCheck, deleteThreadById);
router.use('/:threadId/posts/', postRoutes);

export default router;
