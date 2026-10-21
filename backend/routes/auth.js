import express from 'express';
import { signIn, signOut } from '../controllers/auth.js';
import authCheck from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/signin', signIn);
router.post('/signout', authCheck, signOut);

export default router;
