'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth-modal';
import { Suspense, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { AnimatedText } from '@/components/ui/animated-underline-text-one';
import { syncCloudToLocal } from '@/lib/storage';
import { GradientBackground } from '@/components/ui/paper-design-shader-background';

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
      if (session?.user) {
        syncCloudToLocal().catch(err => console.error('Sync error on mount:', err));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        syncCloudToLocal().catch(err => console.error('Sync error on auth change:', err));
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Dynamic nav items based on auth state
  const navItems = user 
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Interviews', href: '/interview/new' },
        { label: 'How it Works', href: '/how-it-works' },
      ]
    : [
        { label: 'How it Works', href: '/how-it-works' },
      ];

  return (
    <div className={cn("bg-[#080808] relative w-full", isLandingPage ? "h-[100dvh] overflow-hidden" : "min-h-screen")}>
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

      {/* Blurred Shader Background (All pages except landing page) */}
      {!isLandingPage && <GradientBackground />}

      {/* Global Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.7] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

      {/* Top Left Logo (Hidden on landing page and interview sessions) */}
      {!isLandingPage && !isInterviewSession && (
        <Link 
          href="/" 
          className="fixed top-6 left-6 md:top-8 md:left-8 z-50 transition-opacity hover:opacity-80"
          style={{ color: "#E1E0CC" }}
        >
          <AnimatedText 
            text="AceInterview" 
            textClassName="text-sm md:text-base font-semibold tracking-tight" 
            underlineDuration={1.2}
          />
        </Link>
      )}

      {/* Cinematic Top Navigation (Hidden on interview sessions) */}
      {!isInterviewSession && (
        <nav className="fixed inset-x-0 top-0 z-50 mx-auto w-fit transition-all duration-300">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 rounded-b-2xl bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-2 md:rounded-b-3xl md:px-6 w-[100vw] sm:w-auto justify-center overflow-x-auto no-scrollbar">
            {[
              ...navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-1.5 rounded-full text-[11px] transition-all duration-300 sm:text-xs md:text-sm whitespace-nowrap",
                      isActive ? "bg-white/10 text-[#E1E0CC] font-medium" : "text-[#E1E0CC]/60 hover:text-[#E1E0CC] hover:bg-white/5"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }),
              ...(user ? [
                <button
                  key="signout"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    if (typeof window !== 'undefined') {
                      window.localStorage.removeItem('ace-interview.sessions');
                      window.dispatchEvent(new Event('ace-interview:sessions-updated'));
                    }
                  }}
                  className="relative px-3 py-1.5 rounded-full text-[11px] transition-all duration-300 sm:text-xs md:text-sm whitespace-nowrap text-[#E1E0CC]/60 hover:text-[#E1E0CC] hover:bg-white/5"
                >
                  Sign out
                </button>
              ] : [
                <Link
                  key="signin"
                  href="?auth=login"
                  className="relative px-3 py-1.5 rounded-full text-[11px] transition-all duration-300 sm:text-xs md:text-sm whitespace-nowrap text-[#E1E0CC]/60 hover:text-[#E1E0CC] hover:bg-white/5"
                >
                  Log in
                </Link>,
                <Link
                  key="signup"
                  href="?auth=signup"
                  className="relative px-3 py-1.5 rounded-full text-[11px] transition-all duration-300 sm:text-xs md:text-sm whitespace-nowrap text-[#E1E0CC]/60 hover:text-[#E1E0CC] hover:bg-white/5"
                >
                  Sign up
                </Link>
              ])
            ]}
          </div>
        </nav>
      )}

      <main
        className={cn(
          "relative z-10",
          !isLandingPage && !isInterviewSession && 'pt-24 pb-12', // Extra padding for top nav
          isLandingPage && 'h-[100dvh] w-full overflow-hidden',
          isInterviewSession && 'min-h-[100dvh] w-full overflow-y-auto pb-32'
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
