import express from 'express';
import { getAllPostsByThread, createPost, deletePost } from '../controllers/posts.js';
import authCheck from '../middleware/authCheck.js';
import { getFilesByPost,createFile } from '../controllers/files.js';

const router = express.Router({ mergeParams: true });

router.get('/', getAllPostsByThread);
router.post('/', createPost);

router.delete('/:postId', authCheck, deletePost);

export default router;
