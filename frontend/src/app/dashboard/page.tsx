'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import CodeEditor from '@/components/CodeEditor';
import ResponsePanel from '@/components/ResponsePanel';
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
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [response, setResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'response'>('editor');
  const [currentAction, setCurrentAction] = useState<Action | null>(null);

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
    setActiveTab('response');
    try {
      const data = await processCode(code, language, action);
      setResponse(data.response);
      toast.success('Analysis complete!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to process code. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRetry = () => {
    if (currentAction) handleAction(currentAction);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full">

        {/* ── Action Bar ── */}
        <div className="border-b border-white/5 bg-dark-950/90 backdrop-blur-md sticky top-16 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-dark-800/80 border border-white/10
                             hover:border-accent-blue/30 text-sm font-medium text-white/80
                             transition-all duration-300 min-w-[130px] group"
                >
                  <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                  <span>{LANGUAGES.find(l => l.value === language)?.label}</span>
                  <HiOutlineChevronDown className={`w-4 h-4 ml-auto text-white/40 group-hover:text-white/60 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute top-full mt-2 w-full rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-down bg-dark-900/95 backdrop-blur-xl border border-white/15">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.value}
                          onClick={() => handleLanguageChange(lang.value)}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200
                            ${language === lang.value
                              ? 'bg-accent-blue/15 text-accent-blue'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="h-6 w-px bg-white/10 hidden sm:block" />

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {ACTIONS.map(action => (
                  <button
                    key={action.value}
                    onClick={() => handleAction(action.value)}
                    disabled={aiLoading}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                               transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
                               border group whitespace-nowrap
                               ${currentAction === action.value && aiLoading
                                 ? `bg-gradient-to-r ${action.gradient} text-white border-transparent shadow-lg shadow-accent-blue/20`
                                 : 'border-white/10 hover:border-white/20 bg-dark-800/60 hover:bg-dark-700/80 text-white/80 hover:text-white'
                               }`}
                  >
                    <span className="text-base group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                    <span className="hidden xs:inline sm:inline">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile Tab Switcher ── */}
        <div className="lg:hidden flex border-b border-white/5 bg-dark-950/80">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest text-center transition-all duration-300
              ${activeTab === 'editor'
                ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5'
                : 'text-white/30 hover:text-white/50'
              }`}
          >
            📝 Editor
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest text-center transition-all duration-300 relative
              ${activeTab === 'response'
                ? 'text-accent-blue border-b-2 border-accent-blue bg-accent-blue/5'
                : 'text-white/30 hover:text-white/50'
              }`}
          >
            🤖 Response
            {response && !aiLoading && (
              <span className="absolute top-2 right-[calc(50%-40px)] w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* ── Split Panel Layout ── */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0" style={{ height: 'calc(100vh - 8.5rem)' }}>
          {/* Left Panel: Code Editor */}
          <div
            className={`lg:w-1/2 flex flex-col min-h-0 ${activeTab !== 'editor' ? 'hidden lg:flex' : 'flex'}`}
            style={{ minHeight: '300px' }}
          >
            <div className="flex-1 p-2 sm:p-3 lg:pr-1.5">
              <CodeEditor code={code} onChange={setCode} language={language} />
            </div>
          </div>

          {/* Center Divider (desktop only) */}
          <div className="hidden lg:flex items-center justify-center w-2">
            <div className="w-px h-[60%] bg-gradient-to-b from-transparent via-accent-blue/30 to-transparent" />
          </div>

          {/* Right Panel: AI Response */}
          <div
            className={`lg:w-1/2 flex flex-col min-h-0 ${activeTab !== 'response' ? 'hidden lg:flex' : 'flex'}`}
            style={{ minHeight: '300px' }}
          >
            <div className="flex-1 p-2 sm:p-3 lg:pl-1.5">
              <ResponsePanel
                response={response}
                loading={aiLoading}
                error={error}
                currentAction={currentAction}
                onRetry={handleRetry}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
