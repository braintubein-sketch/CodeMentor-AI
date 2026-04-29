'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getHistory, deleteQuery } from '@/lib/api';
import type { Query } from '@/types';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HiOutlineTrash, HiOutlineClipboardCopy, HiOutlineCheck, HiOutlineCode, HiOutlineX } from 'react-icons/hi';

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  explain: { label: 'Explain', icon: '💡', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  debug:   { label: 'Debug',   icon: '🐛', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  optimize:{ label: 'Optimize',icon: '⚡', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  convert: { label: 'Convert', icon: '🔄', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
};

export default function HistoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, authLoading, router]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHistory(page, 12);
      setQueries(data.queries);
      setTotalPages(data.pagination.totalPages);
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { if (isAuthenticated) fetchHistory(); }, [isAuthenticated, fetchHistory]);

  const handleDelete = async (id: string) => {
    try {
      await deleteQuery(id);
      setQueries(prev => prev.filter(q => q.id !== id));
      if (selectedQuery?.id === id) setSelectedQuery(null);
      toast.success('Query deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-dark-950">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-5 sm:py-8">
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Query History</h1>
            <p className="text-xs sm:text-sm text-white/40 mt-1">Your past code analysis queries</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <HiOutlineCode className="w-4 h-4" />
            <span>{queries.length} queries</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" text="Loading history..." /></div>
        ) : queries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-white/60 mb-2">No queries yet</h3>
            <p className="text-sm text-white/30 mb-6">Head to the dashboard to analyze your first code snippet.</p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary text-sm">Go to Dashboard</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {queries.map(query => {
                const meta = ACTION_LABELS[query.action] || ACTION_LABELS.explain;
                return (
                  <div key={query.id}
                    className="glass rounded-2xl p-4 sm:p-5 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer group active:scale-[0.98] sm:hover:-translate-y-0.5"
                    onClick={() => setSelectedQuery(query)}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium border ${meta.color}`}>
                        <span>{meta.icon}</span> {meta.label}
                      </span>
                      <span className="text-[10px] text-white/20">{new Date(query.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-xs text-white/30 uppercase tracking-wider">{query.language}</span>
                    </div>
                    <pre className="text-[11px] sm:text-xs text-white/40 font-mono bg-dark-900/50 rounded-xl p-2.5 sm:p-3 overflow-hidden max-h-[70px] sm:max-h-[80px] mb-3">
                      {query.code.slice(0, 120)}{query.code.length > 120 ? '...' : ''}
                    </pre>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/15">{new Date(query.createdAt).toLocaleTimeString()}</span>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(query.response, query.id); }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all">
                          {copiedId === query.id ? <HiOutlineCheck className="w-3.5 h-3.5 text-green-400" /> : <HiOutlineClipboardCopy className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(query.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all">
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? 'bg-accent-blue text-white' : 'bg-dark-800 text-white/40 hover:text-white hover:bg-dark-700'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedQuery(null)}>
          <div className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-glass animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium border ${ACTION_LABELS[selectedQuery.action]?.color}`}>
                  {ACTION_LABELS[selectedQuery.action]?.icon} {ACTION_LABELS[selectedQuery.action]?.label}
                </span>
                <span className="text-xs text-white/30">{selectedQuery.language}</span>
              </div>
              <button onClick={() => setSelectedQuery(null)} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <h4 className="text-xs text-white/30 uppercase tracking-wider mb-2">Input Code</h4>
                <pre className="text-xs sm:text-sm text-white/60 font-mono bg-dark-950 rounded-xl p-3 sm:p-4 overflow-x-auto">{selectedQuery.code}</pre>
              </div>
              <div>
                <h4 className="text-xs text-white/30 uppercase tracking-wider mb-2">AI Response</h4>
                <div className="ai-response bg-dark-950 rounded-xl p-3 sm:p-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedQuery.response}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
