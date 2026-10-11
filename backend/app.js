import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import boardRoutes from './routes/boards.js'
import getThreadCount from './controllers/misc.js'
import authRoutes from './routes/auth.js'

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/thread-count', getThreadCount);
app.use('/api/auth', authRoutes);
app.use("/api/boards", boardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
