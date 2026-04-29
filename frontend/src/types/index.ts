// ============================================
// CodeMentor AI — TypeScript Type Definitions
// ============================================

/** Supported programming languages */
export type Language = 'python' | 'javascript' | 'java' | 'cpp';

/** Available AI actions */
export type Action = 'explain' | 'debug' | 'optimize' | 'convert';

/** User object returned from auth endpoints */
export interface User {
  id: string;
  email: string;
}

/** Auth response from login/signup */
export interface AuthResponse {
  token: string;
  user: User;
}

/** A saved query from history */
export interface Query {
  id: string;
  code: string;
  language: string;
  action: string;
  response: string;
  createdAt: string;
}

/** Paginated history response */
export interface HistoryResponse {
  queries: Query[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** AI processing response */
export interface AIResponse {
  response: string;
  queryId: string;
}

/** API error shape */
export interface ApiError {
  error: string;
}

/** Language metadata for the selector dropdown */
export interface LanguageOption {
  value: Language;
  label: string;
  monacoId: string;
}

/** Available languages with their display names and Monaco IDs */
export const LANGUAGES: LanguageOption[] = [
  { value: 'python', label: 'Python', monacoId: 'python' },
  { value: 'javascript', label: 'JavaScript', monacoId: 'javascript' },
  { value: 'java', label: 'Java', monacoId: 'java' },
  { value: 'cpp', label: 'C++', monacoId: 'cpp' },
];

/** Action metadata for buttons */
export interface ActionOption {
  value: Action;
  label: string;
  description: string;
  icon: string;
  gradient: string;
}

/** Available actions with their display metadata */
export const ACTIONS: ActionOption[] = [
  {
    value: 'explain',
    label: 'Explain Code',
    description: 'Get a detailed breakdown of your code',
    icon: '💡',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'debug',
    label: 'Find Bugs',
    description: 'Detect bugs and get fixes',
    icon: '🐛',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    value: 'optimize',
    label: 'Optimize Code',
    description: 'Improve performance & readability',
    icon: '⚡',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    value: 'convert',
    label: 'Convert Code',
    description: 'Translate to other languages',
    icon: '🔄',
    gradient: 'from-purple-500 to-pink-500',
  },
];
