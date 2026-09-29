/**
 * Returns the full backend OAuth2 authorization URL for Google login.
 */
export const getGoogleOAuthUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    const host = apiBase.replace(/\/api\/v1\/?$/, '');
    return `${host}/oauth2/authorization/google`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('onrender.com'))) {
    return 'https://carbontrack-ud64.onrender.com/oauth2/authorization/google';
  }
  return '/oauth2/authorization/google';
};
