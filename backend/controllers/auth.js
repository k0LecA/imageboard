import { authenticate, register } from "../services/authService.js";
import createHttpError from "../utils/httpError.js";

const signUp = async (req, res, next) => {
  const { username, password, role, boardId } = req.body;

  try {
    await register({ username, password, role, boardId });
    return res.status(201).json({ data: { created: true } });
  } catch (error) {
    return next(error);
  }
};

const signIn = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const moderator = await authenticate({ username, password });
    const { id, role, board_id: boardId } = moderator;
    const session = await createSession(id);
    return res.status(200).json({ data: { id, username, role, boardId, sessionId: session.id } });
  } catch (error) {
    if (error.message === "Invalid username or password") {
      return next(createHttpError(401, error.message));
    }
    return next(error);
  }
};

export { signUp, signIn };
