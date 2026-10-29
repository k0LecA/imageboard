import multer from "multer";

const uploadPostFile = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
}).single("file");

export default uploadPostFile;
