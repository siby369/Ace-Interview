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
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('auth');
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }
  };

  const handleTabChange = (value: string) => {
    setError(null);
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
      router.push('/dashboard');
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-white/10 bg-[#080808]/90 p-0 overflow-hidden rounded-3xl backdrop-blur-2xl">
        <VisuallyHidden>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Sign in or create an account</DialogDescription>
        </VisuallyHidden>
        
        <div className="p-8 sm:p-10">
          <Tabs value={auth || 'login'} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/10 rounded-xl p-1">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-[#E1E0CC] data-[state=active]:text-black text-white/60 transition-all font-medium">
                Log in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-[#E1E0CC] data-[state=active]:text-black text-white/60 transition-all font-medium">
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6 mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-medium tracking-tight text-white">Welcome back</h2>
                <p className="mt-2 text-sm text-white/60">Log in to continue your preparation</p>
              </div>

              <form className="space-y-4" onSubmit={handleEmailLogin}>
                {error && <div className="text-red-400 text-sm font-medium">{error}</div>}
                <div>
                  <input name="email" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 sm:text-sm transition-colors" />
                </div>
                <div>
                  <input name="password" autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 sm:text-sm transition-colors" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-white/10 bg-[#080808] text-[#E1E0CC] focus:ring-[#E1E0CC]/50 focus:ring-offset-[#080808]" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-white/60">Remember me</label>
                  </div>
                  <a href="#" className="text-sm font-medium text-[#E1E0CC] hover:text-[#E1E0CC]/80 transition-colors">Forgot password?</a>
                </div>

                <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#E1E0CC] px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-[#E1E0CC]/90 disabled:opacity-50 focus:outline-none mt-4">
                  {loading ? 'Signing in...' : 'Sign in'}
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6 mt-0">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-medium tracking-tight text-white">Create an account</h2>
                <p className="mt-2 text-sm text-white/60">Start your journey to interview success</p>
              </div>

              <form className="space-y-4" onSubmit={handleEmailSignUp}>
                {error && <div className="text-red-400 text-sm font-medium">{error}</div>}
                <div>
                  <input name="fullName" autoComplete="name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 sm:text-sm transition-colors" />
                </div>
                <div>
                  <input name="email" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 sm:text-sm transition-colors" />
                </div>
                <div>
                  <input name="password" autoComplete="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="block w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#E1E0CC]/50 focus:outline-none focus:ring-1 focus:ring-[#E1E0CC]/50 sm:text-sm transition-colors" />
                </div>

                <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#E1E0CC] px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-[#E1E0CC]/90 disabled:opacity-50 focus:outline-none mt-4">
                  {loading ? 'Creating account...' : 'Sign up'}
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>
            </TabsContent>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-sm"><span className="bg-[#080808] px-2 text-white/40">Or continue with</span></div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => handleOAuthLogin('github')} type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
                  <Github className="h-4 w-4" /> GitHub
                </button>
                <button onClick={() => handleOAuthLogin('google')} type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10">
                  <Mail className="h-4 w-4" /> Google
                </button>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
