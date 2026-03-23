const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function resolveAssetUrl(url?: string) {
  if (!url) return '';

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('/api/')) {
    return `${apiBaseUrl}${url}`;
  }

  if (url.startsWith('/portfolioApi/')) {
    const origin = apiBaseUrl.replace(/\/portfolioApi$/, '');
    return `${origin}${url}`;
  }

  return url;
}
