'use client';

import type { Role } from '@/lib/types';
import { Briefcase, Code, PenTool, PieChart } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';

const roles: Role[] = [
  {
    name: 'Software Engineer',
    description: 'Algorithms, data structures, and systems design.',
    icon: Code,
  },
  {
    name: 'Product Manager',
    description: 'Product strategy, prioritization, and execution.',
    icon: Briefcase,
  },
  {
    name: 'UX Designer',
    description: 'Design process, collaboration, and portfolio review.',
    icon: PenTool,
  },
  {
    name: 'Data Analyst',
    description: 'SQL, statistics, and data visualization questions.',
    icon: PieChart,
  },
];

interface RoleSelectionFormProps {
  onRoleSelect: (role: Role) => void;
}

export function RoleSelectionForm({ onRoleSelect }: RoleSelectionFormProps) {
  return (
    <div className="mt-8 w-full max-w-4xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role, i) => (
          <Card
            key={role.name}
            onClick={() => onRoleSelect(role)}
            className="h-full transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:-translate-y-1 cursor-pointer animate-in fade-in-50"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardHeader>
              <role.icon className="w-8 h-8 text-primary mb-2" />
              <CardTitle className='font-headline'>{role.name}</CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
