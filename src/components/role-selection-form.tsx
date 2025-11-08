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
            className="group h-full transition-all duration-300 ease-in-out cursor-pointer animate-in fade-in-50 relative overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20"
            style={{ 
              animationDelay: `${i * 100}ms`,
              boxShadow: '0 8px 24px -12px rgba(210,220,255,0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 36px -12px rgba(210,220,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px -12px rgba(210,220,255,0.2)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            }}
          >
            {/* Subtle inner glow on hover */}
            <div 
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, rgba(200,220,255,0.08) 0%, transparent 70%)',
              }}
            />
            
            {/* Subtle border glow */}
            <div 
              className="absolute -inset-[1px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(200,220,255,0.1) 0%, transparent 50%)',
                borderRadius: '0.5rem',
              }}
            />
            
            <CardHeader className="relative z-10">
              <role.icon 
                className="w-8 h-8 text-white/90 mb-2 transition-all duration-300 group-hover:text-white group-hover:scale-110" 
              />
              <CardTitle className='font-headline text-white group-hover:text-white'>{role.name}</CardTitle>
              <CardDescription className="text-white/70 group-hover:text-white/80 transition-colors duration-300">
                {role.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
