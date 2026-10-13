import multer from "multer";

const uploadFiles = multer({ storage: multer.memoryStorage() }).array("files", 4);

export default uploadFiles;
