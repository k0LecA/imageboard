const API_URL = 'http://localhost:8080/api/boards'

export async function createThread(
  slug: string,
  payload: { board_id: number; subject: string; message: string },
  files: File[],
): Promise<number> {
  const formData = new FormData()
  formData.append('board_id', String(payload.board_id))
  formData.append('subject', payload.subject)
  formData.append('message', payload.message)
  files.forEach((file) => formData.append('files', file))

  const response = await fetch(`${API_URL}/${encodeURIComponent(slug)}/threads`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(body?.message ?? 'Could not create thread')
  }

  const body = await response.json() as { data?: { threadId?: number | string } }
  const threadId = Number(body.data?.threadId)
  if (!Number.isSafeInteger(threadId) || threadId <= 0) {
    throw new Error('The server returned an invalid thread response')
  }
  return threadId
}
