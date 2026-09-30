import express from 'express';
import { getAllBoards } from '../controllers/boards.js';
import threadRoutes from './threads.js';
import ipHashMiddleware from '../middleware/ipHash.js';

const router = express.Router({ mergeParams: true });


router.get('/', getAllBoards);
router.use(ipHashMiddleware);
router.use('/:slug', threadRoutes)

export default router;
