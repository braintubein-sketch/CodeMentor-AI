'use client';

// ============================================
// CodeMentor AI — AI Response Panel (Premium)
// ============================================

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { HiOutlineClipboardCopy, HiOutlineCheck } from 'react-icons/hi';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import type { Action } from '@/types';

/** Action-aware loading messages */
const LOADING_MESSAGES: Record<Action, string> = {
  explain: 'Explaining your code...',
  debug: 'Scanning for bugs...',
  optimize: 'Optimizing performance...',
  convert: 'Converting code...',
};

const LOADING_TIPS: string[] = [
  'AI is analyzing your code structure...',
  'Checking for patterns and best practices...',
  'This may take 10-30 seconds...',
  'Using Gemini AI for deep analysis...',
];

interface ResponsePanelProps {
  response: string | null;
  loading: boolean;
  error: string | null;
  currentAction?: Action | null;
  onRetry?: () => void;
}

export default function ResponsePanel({ response, loading, error, currentAction, onRetry }: ResponsePanelProps) {
  const [copied, setCopied] = useState(false);
  const [tipIndex] = useState(Math.floor(Math.random() * LOADING_TIPS.length));

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-dark-950/80 backdrop-blur-sm">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-900/80 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
            loading ? 'bg-yellow-400 animate-pulse' :
            response ? 'bg-green-400' :
            error ? 'bg-red-400' :
            'bg-accent-blue/50'
          }`} />
          <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
            {loading ? 'Processing...' :
             response ? 'AI Response' :
             error ? 'Error' :
             'AI Response'}
          </span>
          {currentAction && loading && (
            <span className="text-[10px] text-accent-blue/60 font-mono">
              ({currentAction})
            </span>
          )}
        </div>

        {response && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       text-white/50 hover:text-white hover:bg-white/5 border border-white/10
                       hover:border-white/20 transition-all duration-300 active:scale-95"
            title="Copy response"
          >
            {copied ? (
              <>
                <HiOutlineCheck className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <HiOutlineClipboardCopy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center border border-white/10">
                <LoadingSpinner size="lg" />
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-accent-blue/5 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white/70 mb-1.5">
                {currentAction ? LOADING_MESSAGES[currentAction] : 'Analyzing your code...'}
              </p>
              <p className="text-xs text-white/30">
                {LOADING_TIPS[tipIndex]}
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-accent-blue/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 rounded-2xl bg-red-500/5 border border-red-500/15 max-w-md">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-red-400 mb-2">Something went wrong</h3>
              <p className="text-sm text-white/40 mb-5 leading-relaxed">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-500/20 to-orange-500/20
                             text-red-300 border border-red-500/25 hover:border-red-500/40
                             hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 active:scale-95"
                >
                  ↻ Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!response && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 flex items-center justify-center border border-white/5">
                <span className="text-4xl animate-float">🤖</span>
              </div>
              <div className="absolute -inset-3 rounded-[28px] border border-dashed border-white/5" />
            </div>
            <h3 className="text-lg font-bold text-white/70 mb-2">
              Ready to analyze
            </h3>
            <p className="text-sm text-white/30 max-w-xs leading-relaxed mb-6">
              Paste your code in the editor, pick an action, and let AI do the heavy lifting.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Explain', 'Debug', 'Optimize', 'Convert'].map((action, i) => (
                <span key={action} className="px-3 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider
                  bg-dark-800/80 text-white/20 border border-white/5">
                  {['💡', '🐛', '⚡', '🔄'][i]} {action}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Response content */}
        {response && !loading && (
          <div className="ai-response animate-fade-in">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  if (match) {
                    return (
                      <div className="relative group my-4">
                        {/* Language badge */}
                        <div className="absolute top-2 right-2 z-10">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/40">
                            {match[1]}
                          </span>
                        </div>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: '12px',
                            background: '#0d1117',
                            padding: '1.25rem',
                            fontSize: '13px',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {response}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
