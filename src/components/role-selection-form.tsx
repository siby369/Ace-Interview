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

