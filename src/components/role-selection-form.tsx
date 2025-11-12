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
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {roles.map((role, i) => (
          <Card
            key={role.name}
            onClick={() => onRoleSelect(role)}
            className="group h-full transition-all duration-300 ease-in-out cursor-pointer animate-in fade-in-50 relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 shadow-lg hover:shadow-2xl hover:shadow-white/10 hover:-translate-y-1 active:translate-y-0"
            style={{ 
              animationDelay: `${i * 100}ms`,
            }}
          >
            {/* Enhanced inner glow on hover */}
            <div 
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/10 via-white/5 to-transparent"
            />
            {/* Subtle border glow effect */}
            <div 
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-white/20"
            />
            
            <CardHeader className="relative z-10">
              <role.icon 
                className="w-10 h-10 text-white mb-3 transition-all duration-300 group-hover:scale-125 group-hover:rotate-3 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
              />
              <CardTitle className='font-headline text-white text-xl group-hover:text-white transition-all duration-300'>{role.name}</CardTitle>
              <CardDescription className="transition-colors duration-300 text-white/70 group-hover:text-white/90">
                {role.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
