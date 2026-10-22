import { describe, expect, it, vi } from 'vitest'
import { signOut } from '../../controllers/auth.js'
import { deleteSession } from '../../services/authService.js'

vi.mock('../../services/authService.js', () => ({
  authenticate: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}))

describe('signOut', () => {
  it('returns success after deleting the current session', async () => {
    deleteSession.mockResolvedValue({ id: 'session-id' })
    const req = { auth: { token: 'session-id.secret' } }
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    await signOut(req, res, vi.fn())

    expect(deleteSession).toHaveBeenCalledWith({ token: req.auth.token })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ data: { signedOut: true } })
  })
})
