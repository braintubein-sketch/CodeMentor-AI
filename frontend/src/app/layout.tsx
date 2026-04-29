import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'CodeMentor AI — Intelligent Code Analysis',
  description:
    'AI-powered code analysis tool. Explain, debug, optimize, and convert your code with the power of artificial intelligence.',
  keywords: ['code analysis', 'AI', 'debugging', 'code optimization', 'code conversion'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(20, 20, 62, 0.95)',
                color: '#e8e8ef',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                backdropFilter: 'blur(16px)',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#0a0a1a' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0a0a1a' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
