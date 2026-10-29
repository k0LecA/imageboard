import multer from "multer";

const uploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 4
  }
}).array("files", 4);

export default uploadFiles;
