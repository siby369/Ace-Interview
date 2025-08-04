'use client';

import Link from 'next/link';
import { BotMessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export function Header() {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              New Session
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/interview/new">Mock Interview</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/practice/pronunciation">Pronunciation Practice</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
