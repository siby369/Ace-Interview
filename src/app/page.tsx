'use client';

import { PrismaHero } from '@/components/ui/prisma-hero';
import { Bot, LineChart, Code } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black selection:bg-white/20">
      {/* ── Prisma Hero Section ── */}
      <PrismaHero />
    </div>
  );
}
