import * as ModeratorModel from '../models/moderators.js'
import * as SessionModel from '../models/sessions.js'
import bcrypt from 'bcryptjs'

const register = async ({ username, password, role, boardId }) => {
    const hashedPassword = await bcrypt.hash(password, 10)
    return ModeratorModel.createModerator({ username, passwordHash: hashedPassword, boardId })
}

const authenticate = async ({ username, password }) => {
    const moderator = await ModeratorModel.getModeratorByUsername(username)
    if (!moderator) {
        throw new Error('Invalid username or password')
    }
    const isMatch = await bcrypt.compare(password, moderator.password_hash)
    if (!isMatch) {
        throw new Error('Invalid username or password')
    }
    return { moderatorId: moderator.id, role: moderator.role, boardId: moderator.board_id }
}
const createSession = async (moderatorId) => {
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await SessionModel.createSession({ moderatorId, expiresAt: expires_at })
    return session.id
}

const validateSession = async (sessionId) => {
    const session = await SessionModel.getSessionById(sessionId)
    if (!session) {
        throw new Error('Invalid session')
    }
    if (new Date(session.expires_at) < new Date()) {
        throw new Error('Session expired')
    }
    return session
}

export { authenticate, createSession, register,validateSession }
