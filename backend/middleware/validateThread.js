const validateThread = (req, res, next) => {
  const { message, isPinned, isLocked } = req.body;

  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required and must be a non-empty string.' });
  }

  if (isPinned !== undefined && typeof isPinned !== 'boolean') {
    return res.status(400).json({ error: 'isPinned must be a boolean.' });
  }

  if (isLocked !== undefined && typeof isLocked !== 'boolean') {
    return res.status(400).json({ error: 'isLocked must be a boolean.' });
  }

  next();
}

export default validateThread;