import 'dotenv/config';
import app from './app.js';
import initMinio from './configs/initMinio.js';

const port = process.env.PORT || 3000;

try {
    await initMinio();
    console.log('MinIO initialized successfully.');

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
} catch (error) {
    console.error('Failed to initialize MinIO:', error);
    process.exit(1);
}