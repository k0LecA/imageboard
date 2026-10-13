import { randomUUID } from "node:crypto";
import { basename } from "node:path";

const createStorageService = (client, getBucketName = () => process.env.MINIO_BUCKET_NAME || "imageboard") => {
  async function uploadFile(file) {
    const bucketName = getBucketName();
    const originalName = basename(file.originalname.replaceAll("\\", "/"));
    const name = `${randomUUID()}-${originalName}`;

    await client.putObject(
      bucketName,
      name,
      file.buffer,
      file.size,
      { "Content-Type": file.mimetype }
    );

    return { s3Key: name, originalName, size: file.size, mimeType: file.mimetype };
  }

  async function deleteFile(s3Key) {
    await client.removeObject(getBucketName(), s3Key);
  }

  async function getFile(s3Key) {
    return client.getObject(getBucketName(), s3Key);
  }

  return { uploadFile, deleteFile, getFile };
};

let storage;
const getStorage = async () => {
  if (!storage) {
    const { default: minioClient } = await import("../configs/minioConfig.js");
    storage = createStorageService(minioClient);
  }
  return storage;
};

const uploadFile = async (...args) => (await getStorage()).uploadFile(...args);
const deleteFile = async (...args) => (await getStorage()).deleteFile(...args);
const getFile = async (...args) => (await getStorage()).getFile(...args);

export { createStorageService, uploadFile, deleteFile, getFile };
