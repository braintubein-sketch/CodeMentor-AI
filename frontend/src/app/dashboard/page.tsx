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
  const [activeTab, setActiveTab] = useState<'editor' | 'response'>('editor');
  const [currentAction, setCurrentAction] = useState<Action | null>(null);

  // No auth required

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
    setCurrentAction(action);
    setActiveTab('response'); // Auto-switch to response on mobile
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

  /** Retry the last action */
  const handleRetry = () => {
    if (currentAction) {
      handleAction(currentAction);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />

      {/* Toolbar */}
      <div className="border-b border-white/5 bg-dark-950/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-4 py-2.5 sm:py-3 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {/* Language dropdown */}
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-dark-800 border border-white/10 hover:border-white/20 text-xs sm:text-sm font-medium text-white/80 transition-all min-w-[110px] sm:min-w-[140px]">
                <span>{LANGUAGES.find(l => l.value === language)?.label}</span>
                <HiOutlineChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ml-auto transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-1 w-full glass-strong rounded-xl shadow-glass overflow-hidden z-50 animate-slide-down">
                  {LANGUAGES.map(lang => (
                    <button key={lang.value} onClick={() => handleLanguageChange(lang.value)}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm transition-all ${language === lang.value ? 'bg-accent-blue/15 text-accent-blue' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-5 sm:h-6 w-px bg-white/10" />

            {/* Action buttons */}
            <div className="flex gap-1.5 sm:gap-2">
              {ACTIONS.map(action => (
                <button key={action.value} onClick={() => handleAction(action.value)} disabled={aiLoading}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 hover:border-white/20 bg-dark-800 hover:bg-dark-700 text-white/80 hover:text-white group whitespace-nowrap">
                  <span className="text-sm sm:text-base group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="hidden xs:inline sm:inline">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile tab switcher (visible only on small screens) */}
      <div className="lg:hidden flex border-b border-white/5">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-center transition-all ${activeTab === 'editor' ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5' : 'text-white/40'}`}>
          📝 Code Editor
        </button>
        <button
          onClick={() => setActiveTab('response')}
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider text-center transition-all ${activeTab === 'response' ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5' : 'text-white/40'}`}>
          🤖 AI Response
        </button>
      </div>

      {/* Main split layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 lg:gap-1 p-1.5 sm:p-2 lg:p-3 max-w-[1800px] mx-auto w-full" style={{ height: 'calc(100vh - 10rem)' }}>
        {/* Left: Code Editor — visible on desktop always, on mobile only when tab = editor */}
        <div className={`flex-1 min-h-0 ${activeTab !== 'editor' ? 'hidden lg:block' : ''}`} style={{ minHeight: '250px' }}>
          <CodeEditor code={code} onChange={setCode} language={language} />
        </div>

        {/* Right: AI Response — visible on desktop always, on mobile only when tab = response */}
        <div className={`flex-1 min-h-0 ${activeTab !== 'response' ? 'hidden lg:block' : ''}`} style={{ minHeight: '250px' }}>
          <ResponsePanel response={response} loading={aiLoading} error={error} currentAction={currentAction} onRetry={handleRetry} />
        </div>
      </div>
    </div>
  );
}
