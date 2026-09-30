import express from 'express';
import morgan from 'morgan';
import boardRoutes from './routes/boards.js'
import threadRoutes from './routes/threads.js'
import getThreadCount from './controllers/misc.js'
import authRoutes from './routes/auth.js'

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.get('/threadCount', getThreadCount);
app.use('/auth', authRoutes);
app.use("/", boardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
