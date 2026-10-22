
import createHttpError from '../utils/httpError.js';
import { validateSession } from '../services/authService.js';

const authCheck = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return next(createHttpError(401, 'No token provided'));
  }

  const token = authorization.slice(7);

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
