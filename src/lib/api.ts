const BASE = "/alex/dfe-digital-standards-copilot/api";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error ${res.status}`);
  }
  return res.json();
}

export function getUser() {
  const script = (window as unknown as { __AIP_USER__?: { email: string; oid: string } });
  if (script.__AIP_USER__?.email) {
    return script.__AIP_USER__;
  }
  const emailMeta = document.querySelector<HTMLMetaElement>('meta[name="aip-user-email"]');
  const oidMeta = document.querySelector<HTMLMetaElement>('meta[name="aip-user-oid"]');
  if (emailMeta?.content) {
    return { email: emailMeta.content, oid: oidMeta?.content ?? "" };
  }
  return null;
}
