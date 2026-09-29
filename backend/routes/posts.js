import express from 'express';
import { getAllPostsByThread, createPost } from '../controllers/posts.js';

const router = express.Router({ mergeParams: true });

router.get('/', getAllPostsByThread);
router.post('/', createPost);

export default router;
