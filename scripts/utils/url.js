// URL正規化（UTM等除去、https寄せ、末尾スラ統一）
export function normalizeUrl(input) {
  let s = (input || '').trim();
  s = s.replace(/[。．、，.!?]+$/u, ''); // 文末の句読点等を削除

  let u;
  try { u = new URL(s); } catch { return s; }

  if (u.protocol === 'http:') u.protocol = 'https:';
  u.hostname = u.hostname.toLowerCase();
  u.hash = '';

  const params = u.searchParams;
  for (const [k] of params) {
    const lk = k.toLowerCase();
    if (lk.startsWith('utm_') || ['fbclid','gclid','ref','mc','spm'].includes(lk)) params.delete(k);
  }
  u.search = params.toString();

  u.pathname = u.pathname.replace(/\/{2,}/g, '/');
  const looksLikeFile = /\.[a-z0-9]{2,8}$/i.test(u.pathname);
  if (looksLikeFile) {
    u.pathname = u.pathname.replace(/\/+$/, '');
  } else {
    if (!u.pathname.endsWith('/')) u.pathname += '/';
  }
  return u.toString();
}
