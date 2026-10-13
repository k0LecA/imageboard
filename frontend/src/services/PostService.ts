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

export async function createPost(
  slug: string,
  threadId: number,
  payload: { boardId: number; message: string },
  file?: File,
): Promise<Post> {
  const formData = new FormData()
  formData.append('boardId', String(payload.boardId))
  formData.append('message', payload.message)
  if (file) formData.append('file', file)

  const response = await fetch(`${API_URL}/${encodeURIComponent(slug)}/threads/${threadId}/posts`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; error?: string } | null
    throw new Error(body?.message ?? body?.error ?? 'Could not post reply')
  }

  const body = await response.json() as ApiResponse<Post>
  return body.data
}
