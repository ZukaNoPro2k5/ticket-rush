import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request (read from Zustand persist storage)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      try {
        const { state } = JSON.parse(raw) as { state: { token?: string } };
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {
        // ignore malformed storage
      }
    }
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    if (
      error.response?.status === 503
      && error.response?.data?.error?.code === 'MAINTENANCE_MODE'
      && typeof window !== 'undefined'
      && window.location.pathname !== '/maintenance'
    ) {
      const raw = localStorage.getItem('auth-storage');
      const role = raw ? (() => {
        try {
          return (JSON.parse(raw) as { state?: { user?: { role?: string } } }).state?.user?.role;
        } catch {
          return undefined;
        }
      })() : undefined;
      if (role !== 'admin') window.location.href = '/maintenance';
    }
    return Promise.reject(error);
  },
);

export default api;
