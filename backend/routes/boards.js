import express from 'express';
import { getAllBoards } from '../controllers/boards.js';
const router = express.Router();


router.get('/', getAllBoards);

export default router;
