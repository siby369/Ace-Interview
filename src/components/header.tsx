import Link from 'next/link';
import { BotMessageSquare } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b bg-card">
      <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
        <BotMessageSquare className="h-7 w-7 text-primary" />
        <h1 className="text-xl sm:text-2xl font-headline font-bold text-foreground">
          Ace Interview
        </h1>
      </Link>
      <Button asChild>
        <Link href="/interview/new">New Interview</Link>
      </Button>
    </header>
  );
}
