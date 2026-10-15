import * as ModeratorModel from '../models/moderators.js'
import * as SessionModel from '../models/sessions.js'
import crypto from 'crypto'

const register = async ({ username, password, role, boardId }) => {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    return ModeratorModel.createModerator({ username, passwordHash: hashedPassword, role, boardId })
}

const authenticate = async ({ username, password }) => {
    const moderator = await ModeratorModel.getModeratorByUsername(username)
    if (!moderator) {
        throw new Error('Invalid username or password')
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    if (hashedPassword !== moderator.password_hash) {
        throw new Error('Invalid username or password')
    }
    return moderator
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
    return session
}

export { authenticate, createSession, register,validateSession }
