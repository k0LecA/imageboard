
import {
  authenticate,
  createSession,
  deleteSession
} from '../services/authService.js';

import createHttpError from '../utils/httpError.js';

const signIn = async (req, res, next) => {
  const { username, password } = req.body ?? {};

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return next(
      createHttpError(400, 'Invalid username or password')
    );
  }

  try {
    const moderator = await authenticate({ username, password });

    const {
      id,
      username: moderatorUsername,
      role,
      board_id: boardId
    } = moderator;

    const token = await createSession(id);

    return res.status(200).json({
      data: {
        id,
        username: moderatorUsername,
        role,
        boardId,
        token
      }
    });
  } catch (error) {
    if (error.message === 'Invalid username or password') {
      return next(createHttpError(401, error.message));
    }

    return next(error);
  }
};

const signOut = async (req, res, next) => {
  try {
    const { token } = req.auth;

    await deleteSession({ token });

    return res.status(200).json({
      data: { signedOut: true }
    });
  } catch (error) {
    return next(error);
  }
};

export { signIn, signOut };
