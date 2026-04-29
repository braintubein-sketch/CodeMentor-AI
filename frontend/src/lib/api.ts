// ============================================
// CodeMentor AI — API Client
// ============================================

import axios from 'axios';
import type { AuthResponse, AIResponse, HistoryResponse, Action, Language } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://codementor-ai-few5.onrender.com';

/**
 * Axios instance pre-configured with the backend base URL.
 * Auth token is injected via interceptor.
 */
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s timeout for AI responses
});

// ── Request Interceptor: Attach JWT ──────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response Interceptor: Handle 401 ─────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// ── Auth APIs ────────────────────────────────

export async function signup(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/signup', { email, password });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.user;
}

// ── AI APIs ──────────────────────────────────

export async function processCode(
  code: string,
  language: Language,
  action: Action
): Promise<AIResponse> {
  const { data } = await api.post<AIResponse>('/ai', { code, language, action });
  return data;
}

// ── Query / History APIs ─────────────────────

export async function getHistory(page = 1, limit = 20): Promise<HistoryResponse> {
  const { data } = await api.get<HistoryResponse>('/query/history', {
    params: { page, limit },
  });
  return data;
}

export async function getQuery(id: string) {
  const { data } = await api.get(`/query/${id}`);
  return data.query;
}

export async function deleteQuery(id: string) {
  const { data } = await api.delete(`/query/${id}`);
  return data;
}

export default api;
