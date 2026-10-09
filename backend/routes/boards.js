import express from 'express';
import { getAllBoards, createBoard, getBoardBySlug } from '../controllers/boards.js';
import threadRoutes from './threads.js';
import ipHashMiddleware from '../middleware/ipHash.js';
import authCheck from '../middleware/authCheck.js';

const router = express.Router({ mergeParams: true });


router.get('/', getAllBoards);
router.get('/:slug/meta', getBoardBySlug);
router.post('/', authCheck, createBoard);
router.use(ipHashMiddleware);
router.use('/:slug', threadRoutes);

export default router;
