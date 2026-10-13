import type { Post } from '../types/Post'

const API_URL = 'http://localhost:8080/api/boards'
type ApiResponse<T> = { data: T }

export async function getLastPosts(slug: string,threadId:number): Promise<Post[]> {
  const response = await fetch(`${API_URL}/${slug}/threads/${threadId}/posts`)

  if (!response.ok) {
    throw new Error('Failed to fetch boards')
  }
  const body: ApiResponse<Post[]> = await response.json()
  return body.data
}
