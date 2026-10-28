import express from 'express';
import { getAllBoards, createBoard, getBoardBySlug } from '../controllers/boards.js';
import threadRoutes from './threads.js';
import authCheck from '../middleware/authMiddleware.js';
import validateBoard from '../middleware/validateBoard.js';

const router = express.Router({ mergeParams: true });


router.get('/', getAllBoards);
router.get('/:slug', getBoardBySlug);
router.post('/', authCheck, validateBoard, createBoard);
router.use('/:slug/threads', threadRoutes);

export default router;
