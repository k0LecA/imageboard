import minioClient from "../configs/minioConfig.js";

async function uploadFile(file) {
  const bucketName = process.env.MINIO_BUCKET_NAME || "imageboard";
  const name = `${Date.now()}-${file.originalname}`;

  await minioClient.putObject(
    bucketName,
    name,
    file.buffer,
    file.size,
    { "Content-Type": file.mimetype }
  );

  return name;
}

export default uploadFile;
