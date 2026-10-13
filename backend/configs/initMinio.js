import minioClient from "./minioConfig.js";

const initMinio = async () => {
    const bucketName = process.env.MINIO_BUCKET_NAME || "imageboard";

    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
        await minioClient.makeBucket(bucketName, "us-east-1");
        console.log(`Bucket "${bucketName}" created successfully.`);
    } else {
        console.log(`Bucket "${bucketName}" already exists.`);
    }
};

export default initMinio;
