import express from 'express';
import { getAllBoards, createBoard, getBoardBySlug } from '../controllers/boards.js';
import threadRoutes from './threads.js';
import ipHashMiddleware from '../middleware/ipHash.js';
import authCheck from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });


router.get('/', getAllBoards);
router.get('/:slug', getBoardBySlug);
router.post('/', authCheck, createBoard);
router.use(ipHashMiddleware);
router.use('/:slug/threads', threadRoutes);

export default router;
