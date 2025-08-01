'use client';

import type { Role } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { Briefcase, Code, PenTool, PieChart } from 'lucide-react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';

const roles: Role[] = [
  {
    name: 'Software Engineer',
    description: 'Technical questions on algorithms, data structures, and systems design.',
    icon: Code,
  },
  {
    name: 'Product Manager',
    description: 'Case studies on product strategy, prioritization, and execution.',
    icon: Briefcase,
  },
  {
    name: 'UX Designer',
    description: 'Portfolio review, design process, and collaboration questions.',
    icon: PenTool,
  },
  {
    name: 'Data Analyst',
    description: 'Questions on SQL, statistics, and data visualization.',
    icon: PieChart,
  },
];

export function RoleSelectionForm() {
  return (
    <div className="mt-12 w-full max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Link key={role.name} href={`/interview/${slugify(role.name)}`} passHref>
            <Card className="h-full transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <role.icon className="w-8 h-8 text-primary" />
                  <div className='text-left'>
                    <CardTitle className='font-headline'>{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
