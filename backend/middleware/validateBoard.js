const validateBoard = (req, res, next) => {
  const { slug,name,description,bump_limit,max_threads,theme } = req.body;

  if (!slug || typeof slug !== 'string' || slug.length < 2 || slug.length > 10) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
    return res.status(400).json({ error: 'Invalid name' });
  }

  if (!description || typeof description !== 'string' || description.length > 255) {
    return res.status(400).json({ error: 'Invalid description' });
  }

  if (bump_limit !== undefined && (!Number.isInteger(bump_limit) || bump_limit < 0)) {
    return res.status(400).json({ error: 'Invalid bump_limit' });
  }

  if (max_threads !== undefined && (!Number.isInteger(max_threads) || max_threads < 0)) {
    return res.status(400).json({ error: 'Invalid max_threads' });
  }

  if (!theme || typeof theme !== 'string' || theme.length < 2 || theme.length > 100) {
    return res.status(400).json({ error: 'Invalid theme' });
  }

  next();
};

export default validateBoard;