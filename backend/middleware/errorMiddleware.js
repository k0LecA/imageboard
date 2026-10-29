import multer from "multer";

const errorHandler = (error, req, res, next) => {
  let status = Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        status = 413;
        break;

      case "LIMIT_FILE_COUNT":
      case "LIMIT_UNEXPECTED_FILE":
        status = 400;
        break;

      default:
        status = 400;
    }
  }

  if (status >= 500) {
    console.error(error);
  }

  const message =
    status >= 500
      ? "Internal server error"
      : error.message;

  return res.status(status).json({
    error: message
  });
};

export default errorHandler;