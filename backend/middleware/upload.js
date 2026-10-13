import multer from "multer";

const uploadFile = multer({ storage: multer.memoryStorage() }).single("file");

export default uploadFile;
