const DEFAULT_API_BASE_URL = 'https://api.sarangsvkm.in/portfolioApi';
const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');
const apiBaseUrl =
  import.meta.env.DEV && /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?\/portfolioApi$/i.test(rawApiBaseUrl)
    ? '/portfolioApi'
    : rawApiBaseUrl;

export function resolveAssetUrl(url?: string) {
  if (!url) return '';

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  // If URL already starts with /portfolioApi/, we need to handle it based on dev/prod
  if (url.startsWith('/portfolioApi/')) {
    if (import.meta.env.DEV && apiBaseUrl === '/portfolioApi') {
      return url; // Already correct for proxy
    }
    const origin = apiBaseUrl.replace(/\/portfolioApi$/, '');
    return `${origin}${url}`;
  }

  // If it starts with /api/, prepend the base URL
  if (url.startsWith('/api/')) {
    return `${apiBaseUrl}${url}`;
  }

  return url;
}
