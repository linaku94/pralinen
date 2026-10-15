export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  if(import.meta.env.DEV && typeof window !== 'undefined' && window.location.pathname === '/vorschau' && /^\/api\/admin\/(recipes|shopping-lists)(\/|$)/.test(url)) {
    return (await import('./preview-store')).previewRequest(url,options) as T;
  }
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  let data:T & {error?:string};
  try { data=await response.json() as T & {error?:string}; }
  catch { throw new Error(response.ok ? 'Die Antwort konnte nicht gelesen werden. Bitte die Seite neu laden.' : `Die Anfrage ist fehlgeschlagen (HTTP ${response.status}). Bitte die Seite neu laden.`); }
  if (!response.ok) throw new Error(data.error ?? 'Die Anfrage ist fehlgeschlagen.');
  return data as T;
}
export function save(url: string, body: unknown) { return api(url, { method: 'PUT', body: JSON.stringify(body) }); }
