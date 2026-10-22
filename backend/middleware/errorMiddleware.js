const errorHandler = (error, req, res, next) => {
  const status = Number.isInteger(error.statusCode) ? error.statusCode : 500;

  if (status >= 500) {
    console.error(error);
  }

  const message = status >= 500 ? "Internal server error" : error.message;
  return res.status(status).json({ error: message });
};

export default errorHandler;
