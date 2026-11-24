// Module-level token holder for Axios interceptors without creating Fast Refresh issues
let moduleToken: string | null = null;

export function getAuthToken(): string | null {
  if (!moduleToken && typeof window !== 'undefined') {
    moduleToken = sessionStorage.getItem('gc_token');
  }
  return moduleToken;
}

export function setAuthToken(token: string | null): void {
  moduleToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('gc_token', token);
    } else {
      sessionStorage.removeItem('gc_token');
    }
  }
}

