import { authenticate, register } from "../services/authService.js";

const signUp = async (req, res) => {
  const { username, password, role, boardId } = req.body;
  const result = await register({ username, password, role, boardId });

  if (!result.ok) {
    return res.status(500).json(result);
  }

  return res.status(200).json(result);
};

const signIn = async (req, res) => {
  const { username, password } = req.body;
  const result = await authenticate({ username, password });

  if (!result.ok) {
    return res.status(500).json(result);
  }

  return res.status(200).json(result);
};

export { signUp, signIn };
