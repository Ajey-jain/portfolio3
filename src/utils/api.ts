const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(apiUrl(path), {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const payload = (await res.json()) as { error?: string; detail?: string };
      detail = payload.error || payload.detail || detail;
    } catch {
      // ignore non-json error bodies
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}
