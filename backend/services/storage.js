import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import minioClient from "../configs/minioConfig.js";

async function uploadFile(file) {
  const bucketName = process.env.MINIO_BUCKET_NAME || "imageboard";
  const originalName = basename(file.originalname.replaceAll("\\", "/"));
  const name = `${randomUUID()}-${originalName}`;

  await minioClient.putObject(
    bucketName,
    name,
    file.buffer,
    file.size,
    { "Content-Type": file.mimetype }
  );

  return {
    s3Key: name,
    originalName,
    size: file.size,
    mimeType: file.mimetype,
  };
}

async function deleteFile(s3Key) {
  const bucketName = process.env.MINIO_BUCKET_NAME || "imageboard";
  await minioClient.removeObject(bucketName, s3Key);
}

async function getFile(s3Key) {
  const bucketName = process.env.MINIO_BUCKET_NAME || "imageboard";
  return minioClient.getObject(bucketName, s3Key);
}

export { uploadFile, deleteFile, getFile };
