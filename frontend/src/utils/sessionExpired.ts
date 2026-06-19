type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();
let sessionExpiredTriggered = false;

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function triggerSessionExpired() {
  if (sessionExpiredTriggered) return;
  sessionExpiredTriggered = true;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  listeners.forEach(listener => listener());
}

export function resetSessionExpiredFlag() {
  sessionExpiredTriggered = false;
}
