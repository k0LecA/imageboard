import * as ModeratorModel from '../models/moderators.js'
import * as SessionModel from '../models/sessions.js'
import crypto from 'crypto'

const register = async ({ username, password, role, board_id }) => {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    await ModeratorModel.createModerator(username, hashedPassword, role, board_id)
}

const authenticate = async (username, password) => {
    const moderator = await ModeratorModel.getModeratorByUsername(username)
    if (!moderator) {
        throw new Error('Invalid username or password')
    }
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    if (hashedPassword !== moderator.password) {
        throw new Error('Invalid username or password')
    }
    return moderator
}
const createSession = async (moderatorId) => {
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await SessionModel.createSession(moderatorId, expires_at)
    return session.session_id
}

export { authenticate, createSession, register }
