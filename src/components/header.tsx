'use client';

import Link from 'next/link';
import { BotMessageSquare, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Sign Out Failed',
        description: 'An error occurred while signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b bg-card">
      <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <BotMessageSquare className="h-7 w-7 text-primary" />
        <h1 className="text-xl sm:text-2xl font-headline font-bold text-foreground">
          Ace Interview
        </h1>
      </Link>
      <div className="flex items-center gap-2">
         <ThemeToggle />
        {user ? (
          <>
            <Button asChild>
              <Link href="/interview/new">New Interview</Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
