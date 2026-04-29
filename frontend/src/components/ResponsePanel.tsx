'use client';

// ============================================
// CodeMentor AI — AI Response Panel
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
  debug: 'Detecting issues...',
  optimize: 'Optimizing performance...',
  convert: 'Converting code...',
};

interface ResponsePanelProps {
  /** The AI response text (markdown) */
  response: string | null;
  /** Whether the response is still loading */
  loading: boolean;
  /** Error message, if any */
  error: string | null;
  /** The current action being performed (for dynamic loading text) */
  currentAction?: Action | null;
  /** Callback to retry the last action */
  onRetry?: () => void;
}

export default function ResponsePanel({ response, loading, error, currentAction, onRetry }: ResponsePanelProps) {
  const [copied, setCopied] = useState(false);

  /** Copy the full response to clipboard */
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
    <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-dark-950/80">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-900/80 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
          <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
            AI Response
          </span>
        </div>

        {response && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       text-white/50 hover:text-white hover:bg-white/5 border border-white/10
                       hover:border-white/20 transition-all duration-300"
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
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <LoadingSpinner
              size="lg"
              text={currentAction ? LOADING_MESSAGES[currentAction] : 'Analyzing your code...'}
            />
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-accent-blue animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 rounded-2xl bg-red-500/5 border border-red-500/20 max-w-md">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Something went wrong</h3>
              <p className="text-sm text-white/50 mb-4">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-accent-blue/15 text-accent-blue
                             border border-accent-blue/25 hover:bg-accent-blue/25 hover:border-accent-blue/40
                             transition-all duration-300"
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
            <div className="text-6xl mb-4 animate-float">🤖</div>
            <h3 className="text-lg font-semibold text-white/70 mb-2">
              Ready to analyze your code
            </h3>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              Paste your code in the editor, select an action, and let AI do the rest.
            </p>
          </div>
        )}

        {/* Response content */}
        {response && !loading && (
          <div className="ai-response animate-fade-in">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                /* Custom code block rendering with syntax highlighting */
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
                          }}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  // Inline code
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
