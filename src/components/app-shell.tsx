'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth-modal';
import { Suspense, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const isInterviewSession = pathname?.startsWith('/interview/start');
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check active session on mount and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Dynamic nav items based on auth state
  const navItems = user 
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Interviews', href: '/interview/new' },
        { label: 'Features', href: '/features' },
      ]
    : [
        { label: 'Features', href: '/features' },
      ];

  return (
    <div className="min-h-screen bg-[#080808] relative">
      {/* Global Video Background */}
      {isAuthPage && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          />
        </div>
      )}

      {/* Global Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.7] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* Top Left Logo (Hidden on landing page and interview sessions) */}
      {!isLandingPage && !isInterviewSession && (
        <Link 
          href="/" 
          className="fixed top-6 left-6 md:top-8 md:left-8 z-50 text-sm md:text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
          style={{ color: "#E1E0CC" }}
        >
          AceInterview*
        </Link>
      )}

      {/* Cinematic Top Navigation (Hidden on interview sessions) */}
      {!isInterviewSession && (
        <nav className="fixed left-1/2 top-0 z-50 -translate-x-1/2 hidden md:block transition-all duration-300">
          <div className="flex items-center gap-3 rounded-b-2xl bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[10px] transition-colors sm:text-xs md:text-sm whitespace-nowrap"
                style={{ color: "rgba(225, 224, 204, 0.8)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")}
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-[10px] transition-colors sm:text-xs md:text-sm whitespace-nowrap"
                style={{ color: "rgba(225, 224, 204, 0.8)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")}
              >
                Sign out
              </button>
            ) : (
              <Link
                href="?auth=login"
                className="text-[10px] transition-colors sm:text-xs md:text-sm whitespace-nowrap"
                style={{ color: "rgba(225, 224, 204, 0.8)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")}
              >
                Log in
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* Main content */}
      <main
        className={cn(
          "relative z-10",
          !isLandingPage && !isInterviewSession && 'pt-24 pb-12', // Extra padding for top nav
          isInterviewSession && 'h-screen overflow-hidden'
        )}
      >
        {children}
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
      </main>
    </div>
  );
}
