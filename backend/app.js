import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import boardRoutes from './routes/boards.js'
import authRoutes from './routes/auth.js'
import miscRoutes from './routes/misc.js'
import fileRoutes from './routes/files.js'
import errorHandler from './middleware/errorMiddleware.js';

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/misc', miscRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use("/api/boards", boardRoutes);

app.use(errorHandler);

export default app;
