import type { Board } from '../types/Board'

const API_URL = 'http://localhost:8080/'

export async function getBoards(): Promise<Board[]> {
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error('Failed to fetch boards')
  }
  const data: Board[] = await response.json()
  return data
}
