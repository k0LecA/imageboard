import { describe, expect, it, vi } from 'vitest'
import authCheck from '../../middleware/authMiddleware.js'
import { validateSession } from '../../services/authService.js'

vi.mock('../../services/authService.js', () => ({
  validateSession: vi.fn(),
}))

describe('authCheck', () => {
  it('sets the moderator identity from the validated session, not the request body', async () => {
    const token = 'opaque-session-token'
    const session = { id: 'session-id', moderator_id: 42 }
    validateSession.mockResolvedValue(session)
    const req = { headers: { authorization: `Bearer ${token}` }, body: { moderatorId: 999 } }
    const next = vi.fn()

    await authCheck(req, {}, next)

    expect(validateSession).toHaveBeenCalledWith({ token })
    expect(req.auth).toEqual({ moderatorId: 42, sessionId: 'session-id', token })
    expect(next).toHaveBeenCalledWith()
  })

  it('returns 401 when the session is invalid', async () => {
    validateSession.mockResolvedValue(null)
    const req = { headers: { authorization: 'Bearer invalid' }, body: {} }
    const next = vi.fn()

    await authCheck(req, {}, next)

    expect(next.mock.calls[0][0].statusCode).toBe(401)
  })
})
