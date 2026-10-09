import type { Post } from '../types/Post'

const API_URL = 'http://localhost:8080'

export async function getLastPosts(slug: string,threadId:number): Promise<Post[]> {
  const response = await fetch(`${API_URL}/${slug}/${threadId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch boards')
  }
  const data: Post[] = await response.json()
  return data
}
