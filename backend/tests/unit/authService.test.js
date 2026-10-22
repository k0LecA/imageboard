import { beforeEach, describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { authenticate, createSession, validateSession, deleteSession } from '../../services/authService.js'
import * as ModeratorModel from '../../models/moderators.js'
import * as SessionModel from '../../models/sessions.js'

vi.mock('../../models/moderators.js', () => ({
  getModeratorByUsername: vi.fn(),
}))

vi.mock('../../models/sessions.js', () => ({
  createSession: vi.fn(),
  getSessionById: vi.fn(),
  deleteSession: vi.fn(),
}))

const sessionId = '123e4567-e89b-42d3-a456-426614174000'

beforeEach(() => vi.clearAllMocks())

describe('authenticate', () => {
  it('should throw an error if the moderator does not exist', async () => {
    ModeratorModel.getModeratorByUsername.mockResolvedValue(null)

    await expect(authenticate({ username: 'test', password: 'password' })).rejects.toThrow('Invalid username or password')
  })
  

  it('should throw an error if the password is incorrect', async () => {
    const moderator = {
      id: 1,
      username: 'test',
      password_hash: await bcrypt.hash('correct_password', 10),
      role: 'admin',
      board_id: 1,
    }
    ModeratorModel.getModeratorByUsername.mockResolvedValue(moderator)

    await expect(authenticate({ username: 'test', password: 'wrong_password' })).rejects.toThrow('Invalid username or password')
  })

    it('should return the moderator object if authentication is successful', async () => {
    const moderator = {
        id: 1,
        username: 'test',
        password_hash: await bcrypt.hash('correct_password', 10),
        role: 'admin',
        board_id: 1,
    }
    ModeratorModel.getModeratorByUsername.mockResolvedValue(moderator)

    const result = await authenticate({ username: 'test', password: 'correct_password' })

    expect(result).toEqual({
        id: moderator.id,
        username: moderator.username,
        role: moderator.role,
        board_id: moderator.board_id,
    })
    })

    
})

describe('session authentication', () => {
  it('stores a bcrypt hash in BYTEA form and returns a token with a lookup id', async () => {
    SessionModel.createSession.mockImplementation(async ({ tokenHash, moderatorId, expiresAt }) => ({
      id: sessionId,
      moderator_id: moderatorId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    }))

    const token = await createSession(17)
    const [id, secret] = token.split('.')
    const [{ tokenHash, moderatorId, expiresAt }] = SessionModel.createSession.mock.calls[0]

    expect(id).toBe(sessionId)
    expect(secret).toMatch(/^[0-9a-f]{64}$/)
    expect(moderatorId).toBe(17)
    expect(Buffer.isBuffer(tokenHash)).toBe(true)
    expect(await bcrypt.compare(secret, tokenHash.toString('utf8'))).toBe(true)
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('validates the identified session even when another session exists for that moderator', async () => {
    const secret = 'a'.repeat(64)
    const tokenHash = Buffer.from(await bcrypt.hash(secret, 10), 'utf8')
    const session = {
      id: sessionId,
      moderator_id: 17,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 60_000),
    }
    SessionModel.getSessionById.mockResolvedValue(session)

    await expect(validateSession({ token: `${sessionId}.${secret}` })).resolves.toBe(session)
    expect(SessionModel.getSessionById).toHaveBeenCalledWith(sessionId)
  })

  it('rejects invalid and expired tokens', async () => {
    const secret = 'b'.repeat(64)
    const tokenHash = Buffer.from(await bcrypt.hash(secret, 10), 'utf8')
    SessionModel.getSessionById.mockResolvedValue({
      id: sessionId,
      moderator_id: 17,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() - 1),
    })

    await expect(validateSession({ token: `${sessionId}.${secret}` })).resolves.toBeNull()
    await expect(validateSession({ token: `${sessionId}.${'c'.repeat(64)}` })).resolves.toBeNull()
    expect(SessionModel.getSessionById).toHaveBeenCalledTimes(2)
  })

  it('deletes only the validated session', async () => {
    const secret = 'd'.repeat(64)
    SessionModel.getSessionById.mockResolvedValue({
      id: sessionId,
      moderator_id: 17,
      token_hash: Buffer.from(await bcrypt.hash(secret, 10), 'utf8'),
      expires_at: new Date(Date.now() + 60_000),
    })

    await deleteSession({ token: `${sessionId}.${secret}` })
    expect(SessionModel.deleteSession).toHaveBeenCalledWith(sessionId)
  })
})
