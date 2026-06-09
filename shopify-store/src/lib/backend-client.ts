const SESSION_ID_KEY = "tdbg_session_id"

export function getPublicBackendApiUrl() {
  return (process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "")
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(SESSION_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}

export function clearSessionId() {
  if (typeof window !== "undefined") localStorage.removeItem(SESSION_ID_KEY)
}

export async function backendClientFetch<T>(
  path: string,
  init: RequestInit & { accessToken?: string | null } = {}
): Promise<T> {
  const { accessToken, headers, ...requestInit } = init
  const sessionId = getOrCreateSessionId()

  const response = await fetch(`${getPublicBackendApiUrl()}${path}`, {
    ...requestInit,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(sessionId ? { "x-session-id": sessionId } : {}),
      ...headers,
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(data?.message ?? data?.error ?? `Request failed with ${response.status}`)
  }

  return data as T
}
