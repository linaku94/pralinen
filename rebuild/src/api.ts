export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? 'Die Anfrage ist fehlgeschlagen.');
  return data as T;
}
export function save(url: string, body: unknown) { return api(url, { method: 'PUT', body: JSON.stringify(body) }); }
