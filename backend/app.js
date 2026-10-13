import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import boardRoutes from './routes/boards.js'
import authRoutes from './routes/auth.js'
import miscRoutes from './routes/misc.js'
import errorHandler from './middleware/errorHandler.js';

import minioClient from './configs/minioConfig.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.post('/api/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;

    try {
        const name = `${Date.now()}-${file.name}`;
        await minioClient.putObject(
            process.env.MINIO_BUCKET_NAME || 'imageboard',
            name,
            file.data,
            file.size,
            { 'Content-Type': file.mimetype }
        );

        res.status(200).json({ message: 'File uploaded successfully', filename: name });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.use('/api/misc', miscRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/boards", boardRoutes);

app.use(errorHandler);

export default app;
