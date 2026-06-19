export type ToastType = 'success' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

type ToastListener = (toast: Toast) => void;

const listeners = new Set<ToastListener>();

export function showToast(message: string, type: ToastType) {
  if (!message?.trim()) return;
  const toast: Toast = { id: crypto.randomUUID(), message, type };
  listeners.forEach(listener => listener(toast));
}

export function subscribeToasts(listener: ToastListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
