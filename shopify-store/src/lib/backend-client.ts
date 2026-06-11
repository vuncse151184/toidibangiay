const SESSION_ID_KEY = "tdbg_session_id"

const STATUS_LABELS: Record<number, string> = {
  400: "Dữ liệu không hợp lệ",
  401: "Chưa đăng nhập",
  403: "Không có quyền truy cập",
  404: "Không tìm thấy",
  409: "Dữ liệu bị trùng lặp",
  422: "Dữ liệu không hợp lệ",
  429: "Quá nhiều yêu cầu",
  500: "Lỗi máy chủ",
  502: "Máy chủ không phản hồi",
  503: "Dịch vụ tạm ngưng",
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly messages: string[] = [],
  ) {
    super(message)
    this.name = "ApiError"
  }

  get label() {
    return STATUS_LABELS[this.statusCode] ?? "Lỗi không xác định"
  }
}


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
    const raw = data?.message
    const messages: string[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    const message = messages[0] ?? data?.error ?? `HTTP ${response.status}`
    throw new ApiError(response.status, message, messages)
  }

  return data as T
}
