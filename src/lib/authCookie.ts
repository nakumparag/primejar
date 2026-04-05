/**
 * Auth cookie helpers — sets/clears a lightweight `pj_auth` cookie
 * so the Next.js middleware can detect logged-in users without touching
 * Firebase Admin SDK (which isn't available in Edge runtime).
 *
 * Call setAuthCookie() right after Firebase signIn succeeds.
 * Call clearAuthCookie() on logout.
 */

export function setAuthCookie(uid: string) {
  // 30-day expiry, SameSite=Lax
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  document.cookie = `pj_auth=${uid}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

export function clearAuthCookie() {
  document.cookie = 'pj_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}
