'use client';

// ============================================
// CodeMentor AI — Monaco Code Editor Wrapper
// ============================================

import React from 'react';
import Editor from '@monaco-editor/react';
import type { Language } from '@/types';
import { LANGUAGES } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface CodeEditorProps {
  /** Current source code */
  code: string;
  /** Callback when the code changes */
  onChange: (value: string) => void;
  /** Selected programming language */
  language: Language;
}

export default function CodeEditor({ code, onChange, language }: CodeEditorProps) {
  // Map our language type to Monaco's language identifier
  const monacoLanguage = LANGUAGES.find((l) => l.value === language)?.monacoId || 'plaintext';

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-dark-950">
      {/* Editor header bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-900/80 border-b border-white/5">
        {/* Fake traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-xs text-white/30 font-mono">
          editor.{monacoLanguage === 'cpp' ? 'cpp' : monacoLanguage}
        </span>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        onChange={(val) => onChange(val || '')}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-dark-950">
            <LoadingSpinner text="Loading editor..." />
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          cursorBlinking: 'smooth',
          renderLineHighlight: 'all',
          lineNumbers: 'on',
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: true,
          wordWrap: 'on',
          tabSize: 2,
          automaticLayout: true,
          suggest: { showKeywords: true, showSnippets: true },
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}
