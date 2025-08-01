'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { slugify } from '@/lib/utils';

const difficulties = ['Easy', 'Medium', 'Hard'];

interface DifficultySelectionProps {
  roleSlug: string;
}

export default function DifficultySelection({
  roleSlug,
}: DifficultySelectionProps) {
  return (
    <div className="mt-12 w-full max-w-sm mx-auto flex flex-col gap-4">
      {difficulties.map(difficulty => (
        <Button key={difficulty} asChild size="lg">
          <Link href={`/interview/${roleSlug}/${slugify(difficulty)}`}>
            {difficulty}
          </Link>
        </Button>
      ))}
    </div>
  );
}
