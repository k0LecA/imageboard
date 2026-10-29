import express from 'express';
import { getAllPostsByThread, createPost, deletePost } from '../controllers/posts.js';
import authCheck from '../middleware/authMiddleware.js';
import uploadPostFile from '../middleware/uploadPostFile.js';
import validateThread from '../middleware/validateThread.js';

const router = express.Router({ mergeParams: true });

router.get('/', getAllPostsByThread);
router.post('/', uploadPostFile, validateThread, createPost);

router.delete('/:postId', authCheck, deletePost);

export default router;
