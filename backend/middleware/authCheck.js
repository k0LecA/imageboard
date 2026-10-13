import createHttpError from '../utils/httpError.js';

const createAuthCheck = (checkSession) => async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  try {
    const session = await checkSession(token);
    const expiresAt = new Date(session?.expires_at);
    if (!session || Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    return next();
  } catch (error) {
    if (error.message === 'Invalid session') {
      return next(createHttpError(401, 'Invalid or expired session'));
    }
    return next(error);
  }
};

const checkSession = async (token) => {
  const { validateSession } = await import('../services/authService.js');
  return validateSession(token);
};
const authCheck = createAuthCheck(checkSession);

export { createAuthCheck };
export default authCheck;
