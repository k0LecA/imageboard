import type { Thread } from "../types/Thread";

const API_URL = 'http://localhost:8080'

export async function getThreads(slug: string): Promise<Thread[]>{
  const response = await fetch(`${API_URL}/${slug}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch /${slug} threads `);
  }
  const data: Thread[] = await response.json()
  return data
}
