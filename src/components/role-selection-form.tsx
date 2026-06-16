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
    <div className="mt-8 w-full max-w-5xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role, i) => (
          <Card
            key={role.name}
            onClick={() => onRoleSelect(role)}
            className="group h-full relative overflow-hidden cursor-pointer bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-500 hover:bg-card/60 hover:border-white/20 active:scale-95"
            style={{ 
              animationDelay: `${i * 100}ms`,
            }}
          >
            {/* Subtle Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <CardHeader className="relative z-10 flex flex-col items-center text-center p-8">
              <div className="bg-black/30 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner mb-6 group-hover:scale-110 transition-transform duration-500">
                <role.icon className="w-8 h-8 text-white/90" />
              </div>
              <CardTitle className="font-headline font-bold text-white text-xl tracking-tight mb-2">
                {role.name}
              </CardTitle>
              <CardDescription className="text-white/60 font-medium leading-relaxed">
                {role.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
