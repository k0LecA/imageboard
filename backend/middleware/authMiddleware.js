
import createHttpError from '../utils/httpError.js';
import { validateSession } from '../services/authService.js';

const authCheck = async (req, res, next) => {
  const token = req.cookies?.session;

  if (!token) {
    return next(createHttpError(401, 'No token provided'));
  }

  try {
    const session = await validateSession({ token });

    if (!session) {
      return next(createHttpError(401, 'Invalid or expired session'));
    }

    req.auth = {
      moderatorId: session.moderator_id,
      sessionId: session.id,
      token
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export default authCheck;
