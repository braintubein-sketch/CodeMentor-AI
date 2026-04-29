'use client';

// ============================================
// CodeMentor AI — Landing Page
// ============================================

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { HiOutlineLightningBolt, HiOutlineCode, HiOutlineShieldCheck, HiOutlineClock } from 'react-icons/hi';

const FEATURES = [
  {
    icon: HiOutlineLightningBolt,
    title: 'Explain Code',
    description: 'Get detailed, section-by-section explanations of any code snippet.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Find Bugs',
    description: 'AI detects bugs, edge cases, and potential issues with fixes.',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    icon: HiOutlineCode,
    title: 'Optimize Code',
    description: 'Improve performance, readability, and adherence to best practices.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: HiOutlineClock,
    title: 'Convert Code',
    description: 'Translate code between Python, JavaScript, Java, and C++.',
    gradient: 'from-purple-500 to-pink-500',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ── Background Effects ──────────────── */}
      <div className="orb w-[600px] h-[600px] bg-accent-blue top-[-200px] left-[-200px]" />
      <div className="orb w-[500px] h-[500px] bg-accent-purple bottom-[-150px] right-[-150px]" />
      <div className="orb w-[300px] h-[300px] bg-accent-cyan top-[40%] left-[60%]" />

      {/* ── Header ─────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-bold text-sm">&lt;/&gt;</span>
          </div>
          <span className="text-xl font-bold gradient-text">CodeMentor AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm !px-5 !py-2.5">
            Log In
          </Link>
          <Link href="/signup" className="btn-primary text-sm !px-5 !py-2.5">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero Section ───────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-medium mb-8 animate-fade-in">
            <HiOutlineLightningBolt className="w-3.5 h-3.5" />
            Powered by AI
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up">
            Your AI-Powered{' '}
            <span className="gradient-text">Code Mentor</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 leading-relaxed mb-10 text-balance animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Explain, debug, optimize, and convert your code instantly. 
            Paste any snippet and let artificial intelligence elevate your development workflow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/signup" className="btn-primary text-base !px-8 !py-4 w-full sm:w-auto">
              Start Coding — Free
            </Link>
            <Link href="/login" className="btn-ghost text-base !px-8 !py-4 w-full sm:w-auto">
              I have an account
            </Link>
          </div>
        </div>

        {/* ── Feature Cards ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group glass rounded-2xl p-6 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:shadow-glow-sm animate-slide-up"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* ── Code Preview Mockup ──────────── */}
        <div className="mt-20 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="glass rounded-2xl overflow-hidden shadow-glass max-w-4xl mx-auto">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-5 py-3 bg-dark-900/60 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-white/20 ml-2 font-mono">dashboard.tsx</span>
            </div>
            {/* Code content */}
            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="text-white/20">
                <span className="text-purple-400">const</span>{' '}
                <span className="text-blue-400">result</span>{' '}
                <span className="text-white/40">=</span>{' '}
                <span className="text-purple-400">await</span>{' '}
                <span className="text-yellow-400">codeMentor</span>
                <span className="text-white/40">.</span>
                <span className="text-green-400">analyze</span>
                <span className="text-white/40">(</span>
                <span className="text-orange-300">{`{`}</span>
              </div>
              <div className="pl-6 text-white/20">
                <span className="text-blue-300">code</span>
                <span className="text-white/40">: </span>
                <span className="text-green-300">{`"function fibonacci(n) { ... }"`}</span>
                <span className="text-white/40">,</span>
              </div>
              <div className="pl-6 text-white/20">
                <span className="text-blue-300">action</span>
                <span className="text-white/40">: </span>
                <span className="text-green-300">{`"optimize"`}</span>
                <span className="text-white/40">,</span>
              </div>
              <div className="pl-6 text-white/20">
                <span className="text-blue-300">language</span>
                <span className="text-white/40">: </span>
                <span className="text-green-300">{`"javascript"`}</span>
              </div>
              <div className="text-white/20">
                <span className="text-orange-300">{`}`}</span>
                <span className="text-white/40">);</span>
              </div>
              <div className="mt-3 text-white/20">
                <span className="text-gray-500">{'// ✨ AI returns optimized code + explanations'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} CodeMentor AI. Built with ❤️ and artificial intelligence.</p>
          <div className="flex gap-6">
            <span>Next.js</span>
            <span>Express</span>
            <span>OpenAI</span>
            <span>Prisma</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
