import * as minio from "minio";

const minioClient = new minio.Client({
    endPoint: process.env.MINIO_HOST || "localhost",
    port: parseInt(process.env.MINIO_API_PORT || "9000"),
    useSSL: process.env.STORAGE_USE_SSL === "true",
    accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
});

export default minioClient;