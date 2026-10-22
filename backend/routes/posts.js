import express from 'express';
import { getAllPostsByThread, createPost, deletePost } from '../controllers/posts.js';
import authCheck from '../middleware/authMiddleware.js';
import uploadFile from '../middleware/upload.js';

const router = express.Router({ mergeParams: true });

router.get('/', getAllPostsByThread);
router.post('/', uploadFile, createPost);

router.delete('/:postId', authCheck, deletePost);

export default router;
