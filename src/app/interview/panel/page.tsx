'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RoleSelectionForm } from '@/components/role-selection-form';
import type { Role } from '@/lib/types';
import { ArrowLeft, Users, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const PANELISTS = [
  { id: 'eng-manager', name: 'Alex (Engineering Manager)', role: 'Engineering Manager', focus: 'System design trade-offs, team collaboration, delivering under pressure.' },
  { id: 'senior-eng', name: 'Sam (Senior Engineer)', role: 'Senior Engineer', focus: 'Deep technical knowledge, coding best practices, debugging, algorithms.' },
  { id: 'hr', name: 'Jordan (HR)', role: 'HR Business Partner', focus: 'Cultural fit, conflict resolution, career goals, behavioral questions.' },
  { id: 'product-manager', name: 'Taylor (Product Manager)', role: 'Product Manager', focus: 'Product sense, prioritization, cross-functional collaboration, customer empathy.' },
];

export default function PanelSetupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPanelists, setSelectedPanelists] = useState<string[]>([]);

  const togglePanelist = (id: string) => {
    setSelectedPanelists((prev) => 
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (selectedPanelists.length < 2 || !selectedRole) return;
    
    const panelistData = selectedPanelists.map(id => PANELISTS.find(p => p.id === id));
    
    const queryParams = new URLSearchParams();
    queryParams.set('role', selectedRole.name);
    queryParams.set('panel', JSON.stringify(panelistData));

    router.push(`/interview/start-panel?${queryParams.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden relative">
      <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8 relative overflow-y-auto">
        <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col items-center justify-center min-h-full py-8">
          
          {!selectedRole ? (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center w-full"
            >
                <h1 className="text-4xl font-bold font-headline tracking-tight text-white mb-6">
                    Panel Interview Setup
                </h1>
                <p className="text-lg text-white/70 max-w-2xl mx-auto mb-12">
                    First, select the role you are applying for.
                </p>
                <RoleSelectionForm onRoleSelect={setSelectedRole} />
            </motion.div>
          ) : (
            <div className="w-full max-w-4xl">
              <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 mb-8"
              >
                  <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSelectedRole(null)}
                      className="border-white/10 bg-white/5 text-white"
                  >
                      <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                      <p className="text-sm uppercase tracking-wider text-white/60 font-semibold mb-1">Target Role</p>
                      <p className="text-xl text-white font-bold">{selectedRole.name}</p>
                  </div>
              </motion.div>

              <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold font-headline text-white mb-4"
              >
                  Choose Your Panel
              </motion.h2>
              <p className="text-lg text-white/70 mb-8">
                  Select 2 to 3 personas to form your interview panel. Each will ask questions from their unique perspective.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {PANELISTS.map((p) => {
                  const isSelected = selectedPanelists.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => togglePanelist(p.id)}
                      className={`cursor-pointer border p-6 rounded-xl transition-all duration-200 ${
                        isSelected 
                          ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white">{p.name}</h3>
                        {isSelected && <CheckCircle2 className="text-primary h-6 w-6" />}
                      </div>
                      <p className="text-sm text-white/60">{p.focus}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  onClick={handleStart}
                  disabled={selectedPanelists.length < 2 || selectedPanelists.length > 3}
                  className="w-full sm:w-auto min-w-[200px] text-lg h-14"
                >
                  <Users className="mr-2 h-5 w-5" />
                  {selectedPanelists.length < 2 
                    ? 'Select at least 2 panelists' 
                    : selectedPanelists.length > 3
                    ? 'Maximum 3 panelists'
                    : 'Start Panel Interview'
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
