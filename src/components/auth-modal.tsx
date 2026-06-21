'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Github, Mail } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { createClient } from '@/utils/supabase/client';

import { useState } from 'react';

export function AuthModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const auth = searchParams.get('auth');
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  
  const isOpen = auth === 'login' || auth === 'signup';
  
  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSignUpSuccess(false);
      setError(null);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('auth');
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  };

  const handleTabChange = (value: string) => {
    setError(null);
    setSignUpSuccess(false);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('auth', value);
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      handleOpenChange(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSignUpSuccess(true);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[360px] border-white/10 bg-[#080808]/90 p-0 overflow-hidden rounded-[2rem] backdrop-blur-2xl">
        <VisuallyHidden>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Sign in or create an account</DialogDescription>
        </VisuallyHidden>
        
        <div className="p-6 sm:p-8">
          {signUpSuccess ? (
            <div className="text-center space-y-5 py-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <div className="h-16 w-16 mx-auto rounded-full bg-[#E1E0CC]/10 flex items-center justify-center border border-[#E1E0CC]/20">
                <Mail className="h-8 w-8 text-[#E1E0CC]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-medium text-white tracking-tight">Verify your email</h2>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed px-2">
                  We've sent a verification link to <strong className="text-white">{email}</strong>. 
                  Please check your inbox and verify your email to log in.
                </p>
              </div>
              <p className="text-[11px] text-white/40 italic">
                Don't see it? Check your spam folder.
              </p>
              <button 
                onClick={() => handleOpenChange(false)} 
                className="w-full rounded-xl bg-[#E1E0CC] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#E1E0CC]/90 transition-colors mt-2"
              >
                Got it
              </button>
            </div>
          ) : (
            <Tabs value={auth || 'login'} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 border border-white/10 rounded-xl p-1">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-[#E1E0CC] data-[state=active]:text-black text-white/60 transition-all font-medium text-xs sm:text-sm">
                  Log in
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-[#E1E0CC] data-[state=active]:text-black text-white/60 transition-all font-medium text-xs sm:text-sm">
                  Sign up
                </TabsTrigger>
              </TabsList>

            <TabsContent value="login" className="space-y-5 mt-0">
              <div className="text-center mb-5">
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white">Welcome back</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-white/60">Log in to continue your preparation</p>
              </div>

              <form className="space-y-3.5" onSubmit={handleEmailLogin}>
                {error && <div className="text-red-400 text-xs font-medium">{error}</div>}
                <div>
                  <input name="email" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 text-sm transition-colors" />
                </div>
                <div>
                  <input name="password" autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 text-sm transition-colors" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-3.5 w-3.5 rounded border-white/10 bg-[#080808] text-[#E1E0CC] focus:ring-[#E1E0CC]/50 focus:ring-offset-[#080808]" />
                    <label htmlFor="remember-me" className="ml-2 block text-xs sm:text-sm text-white/60">Remember me</label>
                  </div>
                  <a href="#" className="text-xs sm:text-sm font-medium text-[#E1E0CC] hover:text-[#E1E0CC]/80 transition-colors">Forgot password?</a>
                </div>

                <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#E1E0CC] px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#E1E0CC]/90 disabled:opacity-50 focus:outline-none mt-2">
                  {loading ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-5 mt-0">
              <div className="text-center mb-5">
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white">Create an account</h2>
                <p className="mt-1.5 text-xs sm:text-sm text-white/60">Start your journey to interview success</p>
              </div>

              <form className="space-y-3.5" onSubmit={handleEmailSignUp}>
                {error && <div className="text-red-400 text-xs font-medium">{error}</div>}
                <div>
                  <input name="fullName" autoComplete="name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 text-sm transition-colors" />
                </div>
                <div>
                  <input name="email" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 text-sm transition-colors" />
                </div>
                <div>
                  <input name="password" autoComplete="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 text-sm transition-colors" />
                </div>

                <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#E1E0CC] px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#E1E0CC]/90 disabled:opacity-50 focus:outline-none mt-2">
                  {loading ? 'Creating account...' : 'Sign up'}
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>
            </TabsContent>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-xs sm:text-sm"><span className="bg-[#080808] px-2 text-white/40">Or continue with</span></div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => handleOAuthLogin('github')} type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">
                  <Github className="h-4 w-4" /> GitHub
                </button>
                <button onClick={() => handleOAuthLogin('google')} type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">
                  <Mail className="h-4 w-4" /> Google
                </button>
              </div>
            </div>
          </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
