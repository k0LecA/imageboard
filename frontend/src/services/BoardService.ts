import type { Board } from '../types/Board'

const API_URL = 'http://localhost:8080/api/boards'

export async function getBoards(): Promise<Board[]> {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Failed to fetch boards')
  }
  const data: Board[] = await response.json()
  return data
}

export async function getBoardMeta(slug: string): Promise<Board> {
  const response = await fetch(`${API_URL}/${slug}`)

  if (!response.ok) {
    throw new Error('Failed to fetch board meta')
  }
  const data: Board = await response.json()
  return data;
}
