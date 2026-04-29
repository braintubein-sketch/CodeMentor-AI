'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import ResponsePanel from '@/components/ResponsePanel';
import LoadingSpinner from '@/components/LoadingSpinner';
import { processCode } from '@/lib/api';
import { LANGUAGES, ACTIONS } from '@/types';
import type { Language, Action } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlineChevronDown } from 'react-icons/hi';

const DEFAULT_CODE: Record<Language, string> = {
  python: `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(fibonacci(10))`,
  javascript: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log(fibonacci(10));`,
  java: `public class Main {\n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n\n    public static void main(String[] args) {\n        System.out.println(fibonacci(10));\n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    cout << fibonacci(10) << endl;\n    return 0;\n}`,
};

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [response, setResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (!code.trim() || Object.values(DEFAULT_CODE).includes(code)) {
      setCode(DEFAULT_CODE[lang]);
    }
    setDropdownOpen(false);
  };

  const handleAction = async (action: Action) => {
    if (!code.trim()) { toast.error('Please enter some code first'); return; }
    setAiLoading(true);
    setError(null);
    setResponse(null);
    try {
      const data = await processCode(code, language, action);
      setResponse(data.response);
      toast.success('Analysis complete!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to process code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />

      {/* Toolbar */}
      <div className="border-b border-white/5 bg-dark-950/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Language dropdown */}
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 border border-white/10 hover:border-white/20 text-sm font-medium text-white/80 transition-all min-w-[140px]">
              <span>{LANGUAGES.find(l => l.value === language)?.label}</span>
              <HiOutlineChevronDown className={`w-4 h-4 ml-auto transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-1 w-full glass-strong rounded-xl shadow-glass overflow-hidden z-50 animate-slide-down">
                {LANGUAGES.map(lang => (
                  <button key={lang.value} onClick={() => handleLanguageChange(lang.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all ${language === lang.value ? 'bg-accent-blue/15 text-accent-blue' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block" />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map(action => (
              <button key={action.value} onClick={() => handleAction(action.value)} disabled={aiLoading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 hover:border-white/20 bg-dark-800 hover:bg-dark-700 text-white/80 hover:text-white group`}>
                <span className="text-base group-hover:scale-110 transition-transform">{action.icon}</span>
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-1 p-2 lg:p-3 max-w-[1800px] mx-auto w-full" style={{ height: 'calc(100vh - 8.5rem)' }}>
        {/* Left: Code Editor */}
        <div className="flex-1 min-h-[300px] lg:min-h-0">
          <CodeEditor code={code} onChange={setCode} language={language} />
        </div>

        {/* Right: AI Response */}
        <div className="flex-1 min-h-[300px] lg:min-h-0">
          <ResponsePanel response={response} loading={aiLoading} error={error} />
        </div>
      </div>
    </div>
  );
}
