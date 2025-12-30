export function useLocation() {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}
