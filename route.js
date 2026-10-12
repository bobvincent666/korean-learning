const pages = new Set(['home', 'hangul', 'words', 'grammar', 'videos']);

export function resolveRoute(hash, lessonIds) {
  let value;
  try {
    value = decodeURIComponent(String(hash).replace(/^#/, ''));
  } catch {
    return { page: 'home', lessonId: null };
  }
  if (lessonIds.includes(value)) return { page: 'grammar', lessonId: value };
  if (pages.has(value)) return { page: value, lessonId: null };
  return { page: 'home', lessonId: null };
}
