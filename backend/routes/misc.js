import express from 'express';
import getThreadCount from '../controllers/misc.js';

const router = express.Router({ mergeParams: true });

router.get('/thread-count',getThreadCount)

export default router;
