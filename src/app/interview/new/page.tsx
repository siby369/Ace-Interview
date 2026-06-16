'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Code, PenTool, PieChart } from 'lucide-react';

const ROLES = [
  { name: 'Software Engineer', icon: Code },
  { name: 'Product Manager', icon: Briefcase },
  { name: 'UX Designer', icon: PenTool },
  { name: 'Data Analyst', icon: PieChart },
];

const PERSONAS = [
  { id: 'friendly', name: 'Friendly', desc: 'Supportive & conversational' },
  { id: 'formal', name: 'Formal', desc: 'Strict & professional' },
  { id: 'aggressive', name: 'Aggressive', desc: 'High-pressure & challenging' },
];

const COUNTS = [3, 5, 10];

const topicsByRole: Record<string, string[]> = {
  'software-engineer': ['Data Structures & Algorithms', 'System Design', 'Databases', 'Operating Systems & Networking', 'Security', 'Behavioral'],
  'product-manager': ['Product Sense & Design', 'Strategy & Roadmapping', 'Execution & Agile', 'Data & Metrics', 'Technical Acumen', 'Behavioral'],
  'ux-designer': ['UX Research & Strategy', 'Prototyping & Visuals', 'Design Systems', 'Collaboration & Communication', 'Portfolio & Interviewing'],
  'data-analyst': ['Core Data Skills', 'SQL & Databases', 'Data Visualization', 'Statistics & Probability', 'Python & R', 'Business & Domain Knowledge'],
};

export default function NewInterviewPage() {
  const router = useRouter();
  
  const [role, setRole] = useState(ROLES[0].name);
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const [count, setCount] = useState(5);
  
  const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
  const availableTopics = topicsByRole[roleSlug] || [];
  
  // Track selected topics (default to all)
  const [selectedTopics, setSelectedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (t: string) => {
    setSelectedTopics(prev => ({ ...prev, [t]: !prev[t] }));
  };

  const isSelected = (t: string) => selectedTopics[t] !== false; // true by default

  const handleStart = () => {
    const searchParams = new URLSearchParams();
    searchParams.set('role', role);
    searchParams.set('questionCount', count.toString());
    searchParams.set('persona', persona);
    
    availableTopics.forEach(t => {
      if (isSelected(t)) {
        searchParams.set(t.toLowerCase().replace(/\s+/g, '-'), 'Medium'); // default medium
      }
    });

    // Start transition
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease-in-out';
    
    setTimeout(() => {
      router.push(`/interview/start?${searchParams.toString()}`);
      setTimeout(() => {
         document.body.style.opacity = '1';
      }, 500);
    }, 800);
  };

  return (
    <div className="relative min-h-screen text-[#E1E0CC]">
      <main className="w-full max-w-4xl mx-auto px-6 py-24 relative z-10 flex flex-col gap-16">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-[#E1E0CC] drop-shadow-sm mb-4" style={{ letterSpacing: "-0.05em" }}>
            Setup Session*
          </h1>
          <p className="text-[#E1E0CC]/50 max-w-lg">
            Configure your AI interview parameters. We will tailor the questions and feedback to match your selections exactly.
          </p>
        </motion.div>

        {/* Form Sections */}
        <div className="flex flex-col gap-12">
          
          {/* Role */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">1. Target Role</h2>
            <div className="flex flex-wrap gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.name}
                  onClick={() => setRole(r.name)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors flex items-center gap-2 border ${
                    role === r.name 
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  <r.icon className="w-4 h-4" />
                  {r.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Persona */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">2. AI Persona</h2>
            <div className="flex flex-wrap gap-3">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border flex flex-col items-start ${
                    persona === p.id 
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Question Count */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">3. Length</h2>
            <div className="flex flex-wrap gap-3">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border ${
                    count === c 
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  {c} Questions
                </button>
              ))}
            </div>
          </motion.div>

          {/* Topics */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">4. Focus Areas</h2>
            <div className="flex flex-wrap gap-3">
              {availableTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTopic(t)}
                  className={`px-5 py-2.5 rounded-full text-xs font-medium transition-colors border ${
                    isSelected(t)
                      ? 'bg-white/10 text-[#E1E0CC] border-white/20' 
                      : 'bg-transparent text-[#E1E0CC]/30 border-white/5 hover:border-white/10 hover:text-[#E1E0CC]/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mt-12">
          <button
            onClick={handleStart}
            className="group inline-flex items-center gap-3 rounded-full bg-[#E1E0CC] py-2 pl-8 pr-2 text-lg font-medium text-black transition-all hover:gap-4 hover:scale-105"
          >
            Start Session
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110">
              <ArrowRight className="h-5 w-5" style={{ color: "#E1E0CC" }} />
            </span>
          </button>
        </motion.div>
        
      </main>
    </div>
  );
}
