import type { Thread } from "../types/Thread";

const API_URL = 'http://localhost:8080/api/boards'

export async function getThreads(slug: string): Promise<Thread[]>{
  const response = await fetch(`${API_URL}/${slug}/threads`)
  if (!response.ok) {
    throw new Error(`Failed to fetch threads for /${slug}`);
  }
  const data: Thread[] = await response.json()
  return data
}
