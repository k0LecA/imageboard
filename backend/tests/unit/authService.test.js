import { describe, it, expect, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { authenticate } from '../../services/authService.js'
import * as ModeratorModel from '../../models/moderators.js'

vi.mock('../../models/moderators.js', () => ({
  getModeratorByUsername: vi.fn(),
}))

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