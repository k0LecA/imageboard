const validateThread = (req, res, next) => {
  const { message } = req.body ?? {};

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
  }

  next();
}

export default validateThread;