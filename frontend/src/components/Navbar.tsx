'use client';

// ============================================
// CodeMentor AI — Navigation Bar
// ============================================

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  HiOutlineCode,
  HiOutlineClock,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: HiOutlineCode },
    { href: '/history', label: 'History', icon: HiOutlineClock },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16">
          {/* ── Logo (always left) ────────────── */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300">
              <span className="text-white font-bold text-sm">&lt;/&gt;</span>
            </div>
            <span className="text-lg font-bold gradient-text">
              CodeMentor AI
            </span>
          </Link>

          {/* ── Desktop Nav (center) ──────────── */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ── Spacer ────────────────────────── */}
          <div className="flex-1" />

          {/* ── Right Section ─────────────────── */}
          <div className="flex items-center gap-3 shrink-0">
            {/* User badge */}
            {isAuthenticated && user && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-800/80 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white uppercase">
                      {user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-xs text-white/50 max-w-[140px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  title="Logout"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-3 py-2 text-xs text-white/50 hover:text-white transition-colors font-medium">
                  Login
                </Link>
                <Link href="/signup" className="px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:opacity-90 transition-opacity">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              {mobileOpen ? <HiOutlineX className="w-5 h-5" /> : <HiOutlineMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/5 animate-slide-down">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-accent-blue/15 text-accent-blue'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile user info */}
              {isAuthenticated && user && (
                <div className="pt-3 mt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase">
                        {user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-xs text-white/50 truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="pt-3 mt-3 border-t border-white/5 space-y-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-accent-blue hover:bg-accent-blue/10 transition-all">
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
