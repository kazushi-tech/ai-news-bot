import slugify from '@sindresorhus/slugify';

export function toAsciiSlug(title) {
  return slugify((title || 'untitled').toString(), { lowercase: true, decamelize: false, separator: '-' });
}

export function ensureUniqueSlug(base, existing) {
  let s = base || 'post';
  if (!existing.has(s)) return s;
  let n = 2;
  while (existing.has(`${s}-${n}`)) n++;
  return `${s}-${n}`;
}
