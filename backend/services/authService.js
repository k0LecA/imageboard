
import * as ModeratorModel from '../models/moderators.js';
import * as SessionModel from '../models/sessions.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const authenticate = async ({ username, password }) => {
  const moderator = await ModeratorModel.getModeratorByUsername(username);

  if (!moderator) {
    throw new Error('Invalid username or password');
  }

  const isMatch = await bcrypt.compare(
    password,
    moderator.password_hash
  );

  if (!isMatch) {
    throw new Error('Invalid username or password');
  }

  return {
    id: moderator.id,
    username: moderator.username,
    role: moderator.role,
    board_id: moderator.board_id
  };
};

const createSession = async (moderatorId) => {
  const secret = crypto.randomBytes(32).toString('hex');
  const tokenHash = Buffer.from(await bcrypt.hash(secret, 10), 'utf8');

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  const session = await SessionModel.createSession({
    moderatorId,
    tokenHash,
    expiresAt
  });

  return `${session.id}.${secret}`;
};

const parseSessionToken = (token) => {
  if (typeof token !== 'string') return null;
  const separator = token.indexOf('.');
  if (separator < 0) return null;
  const sessionId = token.slice(0, separator);
  const secret = token.slice(separator + 1);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId) ||
    !/^[0-9a-f]{64}$/i.test(secret)
  ) return null;
  return { sessionId, secret };
};

const validateSession = async ({ token }) => {
  const parsed = parseSessionToken(token);
  if (!parsed) return null;

  const session = await SessionModel.getSessionById(parsed.sessionId);

  if (!session) {
    return null;
  }

  const expiresAt = new Date(session.expires_at);

  if (
    !Number.isFinite(expiresAt.getTime()) ||
    expiresAt.getTime() <= Date.now()
  ) {
    return null;
  }

  const tokenHash = Buffer.isBuffer(session.token_hash)
    ? session.token_hash.toString('utf8')
    : session.token_hash;

  if (typeof tokenHash !== 'string') {
    return null;
  }

  const isMatch = await bcrypt.compare(parsed.secret, tokenHash);

  if (!isMatch) {
    return null;
  }

  return session;
};

const deleteSession = async ({ token }) => {
  const session = await validateSession({ token });

  if (!session) {
    throw new Error('Invalid or expired session');
  }

  return SessionModel.deleteSession(session.id);
};

export {
  authenticate,
  createSession,
  validateSession,
  deleteSession
};
