'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Code, PenTool, PieChart } from 'lucide-react';
import { extractJdTopics } from '@/ai/flows/extract-jd-topics';
import { parseDocumentToText } from '@/ai/flows/parse-document';

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
  const [customRole, setCustomRole] = useState('');
  const [persona, setPersona] = useState(PERSONAS[0].id);
  const [count, setCount] = useState(5);
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [setupMode, setSetupMode] = useState<'manual' | 'jd'>('manual');
  const [difficulty, setDifficulty] = useState('Medium');
  const [practiceMode, setPracticeMode] = useState<'Standard' | 'Coding Only'>('Standard');
  
  const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
  const availableTopics = topicsByRole[roleSlug] || [];
  
  const [selectedTopics, setSelectedTopics] = useState<Record<string, boolean>>({});
  const [customTopics, setCustomTopics] = useState<string[]>([]);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [customPersona, setCustomPersona] = useState('');
  const [customCount, setCustomCount] = useState<string>('');
  const [extractedTopics, setExtractedTopics] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedJdTopics, setSelectedJdTopics] = useState<Record<string, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const toggleTopic = (t: string) => {
    setSelectedTopics(prev => ({ ...prev, [t]: !prev[t] }));
  };

  const toggleJdTopic = (t: string) => {
    setSelectedJdTopics(prev => ({ ...prev, [t]: !prev[t] }));
  };

  const isSelected = (t: string) => selectedTopics[t] !== false; // true by default

  const handleAddCustomTopic = () => {
    const val = customTopicInput.trim();
    if (!val) return;
    const topicsToAdd = val.split(',').map(t => t.trim()).filter(t => t.length > 0);
    setCustomTopics(prev => {
      const next = [...prev];
      topicsToAdd.forEach(t => {
        if (!next.includes(t) && !availableTopics.includes(t)) {
          next.push(t);
        }
      });
      return next;
    });
    setCustomTopicInput('');
  };

  const handleAddJdTopic = () => {
    const val = customTopicInput.trim();
    if (!val) return;
    const topicsToAdd = val.split(',').map(t => t.trim()).filter(t => t.length > 0);
    setExtractedTopics(prev => {
      const next = [...prev];
      topicsToAdd.forEach(t => {
        if (!next.includes(t)) {
          next.push(t);
        }
      });
      return next;
    });
    setSelectedJdTopics(prev => {
      const next = { ...prev };
      topicsToAdd.forEach(t => {
        next[t] = true;
      });
      return next;
    });
    setCustomTopicInput('');
  };

  const handleExtractTopics = async () => {
    if (!jobDescription.trim()) return;
    setIsExtracting(true);
    try {
      const result = await extractJdTopics(jobDescription);
      setExtractedTopics(result.topics);
      const initialSelection: Record<string, boolean> = {};
      result.topics.forEach(t => initialSelection[t] = true);
      setSelectedJdTopics(initialSelection);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await parseDocumentToText(formData);
      if (result.error) {
        alert(result.error);
      } else {
        setJobDescription(result.text);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to parse document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStart = () => {
    const searchParams = new URLSearchParams();
    
    if (setupMode === 'manual') {
      searchParams.set('role', customRole.trim() || role);
      availableTopics.forEach(t => {
        if (isSelected(t)) {
          searchParams.set(t.toLowerCase().replace(/\s+/g, '-'), difficulty); // default medium
        }
      });
      customTopics.forEach(t => {
        if (isSelected(t)) {
          searchParams.set(t.toLowerCase().replace(/\s+/g, '-'), difficulty);
        }
      });
    } else {
      searchParams.set('role', customRole.trim() || 'Candidate');
      if (companyName.trim()) {
        searchParams.set('company', companyName.trim());
      }
      if (jobDescription.trim()) {
        searchParams.set('jd', jobDescription.trim());
      }
      extractedTopics.forEach(t => {
        if (selectedJdTopics[t] !== false) {
          searchParams.set(t.toLowerCase().replace(/\s+/g, '-'), difficulty);
        }
      });
    }

    if (practiceMode === 'Coding Only') {
      searchParams.set('codingOnly', 'true');
    }
    
    searchParams.set('questionCount', customCount || count.toString());
    searchParams.set('persona', customPersona.trim() || persona);

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
          <p className="text-[#E1E0CC]/50 max-w-lg mb-8">
            Configure your AI interview parameters. We will tailor the questions and feedback to match your selections exactly.
          </p>

          <div className="flex bg-white/5 p-1 rounded-full w-fit">
            <button 
              onClick={() => setSetupMode('manual')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${setupMode === 'manual' ? 'bg-[#E1E0CC] text-black shadow-sm' : 'text-[#E1E0CC]/50 hover:text-[#E1E0CC]'}`}
            >
              Role & Topics
            </button>
            <button 
              onClick={() => setSetupMode('jd')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${setupMode === 'jd' ? 'bg-[#E1E0CC] text-black shadow-sm' : 'text-[#E1E0CC]/50 hover:text-[#E1E0CC]'}`}
            >
              Job Description
            </button>
          </div>
        </motion.div>

        {/* Form Sections */}
        <div className="flex flex-col gap-12">
          
          {setupMode === 'manual' ? (
            <>
              {/* Role */}
              <motion.div key="manual-role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">1. Target Role</h2>
                <div className="flex flex-wrap gap-3 mb-6">
                  {ROLES.map((r) => (
                    <button
                      key={r.name}
                      onClick={() => { setRole(r.name); setCustomRole(''); }}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-colors flex items-center gap-2 border ${
                        role === r.name && !customRole
                          ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                          : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                      }`}
                    >
                      <r.icon className="w-4 h-4" />
                      {r.name}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={customRole}
                  onChange={(e) => { setCustomRole(e.target.value); }}
                  placeholder="Or type a custom role (e.g., Senior iOS Developer)"
                  className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 focus:outline-none focus:border-[#E1E0CC] focus:ring-1 focus:ring-[#E1E0CC] transition-all"
                />
              </motion.div>

              {/* Topics */}
              <motion.div key="manual-topics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">2. Focus Areas</h2>
                <div className="flex flex-wrap gap-3 mb-6">
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
                  {customTopics.map((t) => (
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
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTopic();
                      }
                    }}
                    placeholder="Type custom topics (e.g., React, Node.js, Webpack) and press Enter"
                    className="flex-1 px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 focus:outline-none focus:border-[#E1E0CC] focus:ring-1 focus:ring-[#E1E0CC] transition-all"
                  />
                  <button 
                    onClick={handleAddCustomTopic}
                    className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-sm font-medium text-[#E1E0CC]"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              {/* Job Title & Company */}
              <motion.div key="jd-role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">1. Target Job Title (Optional)</h2>
                  <input 
                    type="text" 
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 focus:outline-none focus:border-[#E1E0CC] focus:ring-1 focus:ring-[#E1E0CC] transition-all"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">2. Company Name (Optional)</h2>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Apple, Acme Corp"
                    className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 focus:outline-none focus:border-[#E1E0CC] focus:ring-1 focus:ring-[#E1E0CC] transition-all"
                  />
                </div>
              </motion.div>

              {/* Job Description */}
              <motion.div key="jd-desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40">3. Job Description</h2>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept=".pdf,.docx,.txt"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-[#E1E0CC] disabled:opacity-50"
                    >
                      {isUploading ? 'Parsing Document...' : 'Upload File (.pdf, .docx, .txt)'}
                    </button>
                  </div>
                </div>
                <textarea 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here. We will analyze it to tailor your interview questions."
                  className="w-full h-48 px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 focus:outline-none focus:border-[#E1E0CC] focus:ring-1 focus:ring-[#E1E0CC] transition-all resize-none"
                />

                <div className="flex mt-4">
                  <button 
                    onClick={handleExtractTopics} 
                    disabled={isExtracting || !jobDescription.trim()}
                    className="px-5 py-2.5 rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-sm font-medium disabled:opacity-50 text-[#E1E0CC]"
                  >
                    {isExtracting ? 'Extracting Skills...' : 'Extract Skills from JD'}
                  </button>
                </div>

                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-sm font-medium text-[#E1E0CC]/70 mb-4 tracking-widest uppercase">Focus Areas</h3>
                  {extractedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {extractedTopics.map(t => (
                        <button
                          key={t}
                          onClick={() => toggleJdTopic(t)}
                          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors border ${
                            selectedJdTopics[t] !== false
                              ? 'bg-white/10 text-[#E1E0CC] border-white/20' 
                              : 'bg-transparent text-[#E1E0CC]/30 border-white/5 hover:border-white/10 hover:text-[#E1E0CC]/50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddJdTopic();
                        }
                      }}
                      placeholder="Add focus areas (e.g., React, Node.js, System Design)"
                      className="flex-1 px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 focus:outline-none focus:border-[#E1E0CC] focus:ring-1 focus:ring-[#E1E0CC] transition-all"
                    />
                    <button 
                      onClick={handleAddJdTopic}
                      className="px-6 py-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-sm font-medium text-[#E1E0CC]"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}

          {/* Difficulty */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">
              {setupMode === 'manual' ? '3' : '4'}. Difficulty
            </h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border ${
                    difficulty === d
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Practice Mode */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">
              {setupMode === 'manual' ? '4' : '5'}. Practice Mode
            </h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Standard', 'Coding Only'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPracticeMode(mode as any)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border ${
                    practiceMode === mode
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Persona */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">
              {setupMode === 'manual' ? '5' : '6'}. AI Persona
            </h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPersona(p.id); setCustomPersona(''); }}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border flex flex-col items-start ${
                    persona === p.id && !customPersona
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
            <input 
              type="text" 
              value={customPersona}
              onChange={(e) => { setCustomPersona(e.target.value); }}
              placeholder="Or describe a custom persona (e.g., A tough technical lead)"
              className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 focus:outline-none focus:border-[#E1E0CC] focus:ring-1 focus:ring-[#E1E0CC] transition-all"
            />
          </motion.div>

          {/* Question Count */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="text-sm font-medium tracking-widest uppercase text-[#E1E0CC]/40 mb-6">
              {setupMode === 'manual' ? '6' : '7'}. Length
            </h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCount(c); setCustomCount(''); }}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-colors border ${
                    count === c && !customCount
                      ? 'bg-[#E1E0CC] text-black border-[#E1E0CC]' 
                      : 'bg-white/[0.02] text-[#E1E0CC]/70 border-white/10 hover:bg-white/[0.05] hover:text-[#E1E0CC]'
                  }`}
                >
                  {c} Questions
                </button>
              ))}
            </div>
            <input 
              type="number" 
              min="1" max="50"
              value={customCount}
              onChange={(e) => { setCustomCount(e.target.value); }}
              placeholder="Or enter a custom number"
              className="w-full max-w-xs px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-[#E1E0CC] placeholder:text-[#E1E0CC]/30 focus:outline-none focus:border-[#E1E0CC] focus:ring-1 focus:ring-[#E1E0CC] transition-all"
            />
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
