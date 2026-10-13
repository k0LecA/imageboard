import type { Thread } from "../types/Thread";

const API_URL = 'http://localhost:8080/api/boards'
type ApiResponse<T> = { data: T }

export async function getThreads(slug: string): Promise<Thread[]>{
  const response = await fetch(`${API_URL}/${slug}/threads`)
  if (!response.ok) {
    throw new Error(`Failed to fetch threads for /${slug}`);
  }
  const body: ApiResponse<Thread[]> = await response.json()
  return body.data
}
