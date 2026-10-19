import type { Moderator } from '../types/Moderator';

const API_URL = 'http://localhost:8080/api/auth'

export const ModService = {
  async authenticate(username: string, password: string): Promise<Moderator> {
    
    const response = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'credentials': 'include'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null
      throw new Error(body?.message ?? 'Could not authenticate')
    }

    const body = await response.json() as { data?: Moderator }
    if (!body.data) {
      throw new Error('The server returned an invalid moderator response')
    }
    return body.data;
  }
};
