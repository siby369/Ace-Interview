'use client';

import { useState, useRef, useEffect } from 'react';
import { RoleSelectionForm } from '@/components/role-selection-form';
import TopicSelection from '@/components/topic-selection';
import type { Role } from '@/lib/types';
import { unslugify, slugify } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FloatingOrb } from '@/components/floating-orb';

// 3D Tunnel Particles Animation
const TunnelParticles = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<Array<{ x: number; y: number; z: number; r: number }>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0, height = 0, cx = 0, cy = 0;
        const focalLength = 450;
        const particleCount = 350;
        const minZ = 0.6;
        const maxZ = 6;
        const speed = 0.003;

        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.floor(width * window.devicePixelRatio);
            canvas.height = Math.floor(height * window.devicePixelRatio);
            ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
            cx = width / 2;
            cy = height / 2;
        };

        const initParticles = () => {
            particlesRef.current = Array.from({ length: particleCount }).map(() => {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.pow(Math.random(), 1.2) * Math.max(width, height) * 0.3 + 20;
                return {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    z: Math.random() * (maxZ - minZ) + minZ,
                    r: Math.random() * 1.0 + 0.3
                };
            });
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // Subtle vignette
            const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.8);
            grd.addColorStop(0, 'rgba(0,0,0,0)');
            grd.addColorStop(1, 'rgba(0,0,0,0.3)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, width, height);

            // Particles projected toward camera
            ctx.fillStyle = 'rgba(200,210,255,0.4)';
            for (const p of particlesRef.current) {
                p.z -= speed;
                if (p.z <= minZ) {
                    p.z = maxZ;
                }
                const scale = focalLength / (focalLength * p.z);
                const sx = cx + p.x * scale;
                const sy = cy + p.y * scale;
                const radius = Math.max(0.2, p.r * scale * 1.8);
                if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) continue;
                ctx.beginPath();
                ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        resize();
        initParticles();
        animationRef.current = requestAnimationFrame(draw);
        window.addEventListener('resize', () => {
            resize();
            initParticles();
        });

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" aria-hidden />
    );
};

const topicsByRole: Record<string, Record<string, string[]>> = {
    'software-engineer': {
        'Data Structures & Algorithms': [
            'Arrays',
            'Strings',
            'Linked Lists',
            'Stacks',
            'Queues',
            'Heaps / Priority Queues',
            'Trees (Binary, BST, Trie)',
            'Graphs (BFS, DFS, Dijkstra)',
            'Hash Maps / Hash Sets',
            'Sliding Window Technique',
            'Two Pointer Technique',
            'Recursion & Backtracking',
            'Dynamic Programming',
            'Greedy Algorithms',
            'Bit Manipulation',
            'Time and Space Complexity',
        ],
        'Software Design & Architecture': [
            'Object-Oriented Programming (OOP)',
            'Design Patterns (Singleton, Factory, Observer)',
            'Low-Level Design (Class Design)',
            'High-Level Design (System Design)',
            'RESTful API Design',
            'Microservices vs Monolithic',
        ],
        Databases: [
            'SQL Queries (Joins, Aggregates, Subqueries)',
            'Window Functions',
            'Database Design (Schema, ER Models)',
            'Indexing and Query Optimization',
            'Transactions and ACID Properties',
            'NoSQL Databases',
            'CAP Theorem',
        ],
        'Operating Systems & Networking': [
            'Processes vs Threads',
            'Deadlocks and Race Conditions',
            'Memory Management (Stack vs Heap)',
            'Networking Basics (TCP/IP, OSI Model)',
            'HTTP, HTTPS, and WebSockets',
        ],
        Security: [
            'Authentication vs Authorization (OAuth, JWT)',
            'Hashing and Encryption',
            'Common Vulnerabilities (SQL Injection, XSS)',
        ],
        'Software Development Lifecycle & DevOps': [
            'Git and Version Control',
            'CI/CD Basics',
            'Docker and Containerization',
            'Agile Methodologies',
            'Monitoring & Logging',
            'Cloud Basics (AWS, GCP, Azure)',
        ],
        Behavioral: [
            'STAR Method',
            'Teamwork and Conflict Resolution',
            'Motivation and Career Goals',
            'Handling Failure',
        ],
    },
    'product-manager': {
        'Product Sense & Design': [
            'User Research & Customer Empathy',
            'Problem Identification & Framing',
            'Market Research & Competitor Analysis',
            'Product Lifecycle Management',
            'Defining & Prioritizing Features',
            'Feature Trade-offs (Impact vs Effort)',
            'Usability & UX Principles',
            'Design Thinking Process',
            'Wireframing & Prototyping',
            'Accessibility & Inclusive Design',
            'Building 0 to 1 Products',
            'Scaling Products 1 to 100',
        ],
        'Strategy & Roadmapping': [
            'Roadmapping & Strategic Planning',
            'Writing Product Requirements Documents (PRD)',
            'Product Launch Planning',
            'Go-to-Market (GTM) Strategy',
            'Competitive Differentiation',
            'SWOT Analysis',
            'Product-Market Fit',
            'Vision vs Execution Tradeoffs',
            'Product Strategy Alignment',
            'Growth vs Core Product Strategy',
            'Backward Roadmapping',
            'Product Vision Creation',
        ],
        'Execution & Agile': [
            'Agile Methodology (Scrum vs Kanban)',
            'Writing User Stories',
            'Sprint Planning & Backlog Grooming',
            'Customer Feedback Loops',
            'Incident Handling / Crisis Response',
            'Product Sunsetting',
            'PM Tools (Jira, Confluence, etc.)',
        ],
        'Data & Metrics': [
            'Metrics & KPIs (North Star, Retention)',
            'A/B Testing and Experimentation',
            'Funnel Analysis & Conversion Optimization',
            'Prioritization Frameworks (RICE, MoSCoW)',
            'OKRs and Goal Setting',
            'Product Analytics Tools',
            'SQL for Product Managers',
            'Data Interpretation & Decision-Making',
            'Estimation Questions',
            'Metrics Questions',
        ],
        'Technical Acumen': [
            'Technical Concepts (APIs, Cloud)',
            'Understanding Engineering Constraints',
            'Mobile vs Web Product Differences',
            'AI/ML Product Basics',
            'Managing Product Debt',
            'Build vs Buy vs Partner Trade-offs',
        ],
        'Business & Growth': [
            'Growth Hacking Techniques',
            'Retention & Engagement Strategies',
            'Monetization & Pricing Models',
            'Business Model Canvas',
            'Market Sizing (TAM/SAM/SOM)',
            'Revenue & Cost Projections',
        ],
        'Leadership & Communication': [
            'Stakeholder Management',
            'Cross-functional Collaboration',
            'Communication & Presentation Skills',
            'Vision & Strategy Communication',
            'Managing Up & Influence',
            'Leading Through Ambiguity',
            'Conflict Resolution',
        ],
        'Behavioral & Interviewing': [
            'Behavioral Questions (STAR Method)',
            'Handling Difficult Feedback',
            'Time Management & Prioritization',
            'Handling Failure',
            'PM Interview Frameworks (CIRCLES, AARM)',
            'Whiteboard Design Questions',
            'Career Motivation & Role Fit',
        ],
    },
    'ux-designer': {
        'UX Research & Strategy': [
            'User Research Fundamentals',
            'User Interviews & Surveys',
            'Persona Creation & Empathy Mapping',
            'Journey Mapping & Task Analysis',
            'Problem Framing & Competitive Analysis',
            'Heuristic Evaluation & Usability Testing',
            'A/B Testing',
            'Information Architecture (IA)',
        ],
        'Design, Prototyping & Visuals': [
            'Wireframing (Low to High Fidelity)',
            'Prototyping (Clickable Prototypes)',
            'Design Tools (Figma, Sketch, XD)',
            'Interaction Design Principles',
            'Visual Design (Color, Typography, Layout)',
            'UI Design Patterns',
            'Responsive & Mobile-First Design',
            'Microinteractions & Animations',
        ],
        'Design Systems & Principles': [
            'Design Systems & Component Libraries',
            'Atomic Design',
            'Human-Centered Design (HCD)',
            'Design Thinking Process',
            'Inclusive Design & Accessibility (WCAG)',
            'Ethical UX & Dark Patterns',
            'UX Laws (Hick’s, Fitts’s, etc.)',
        ],
        'Collaboration & Communication': [
            'Working with PMs & Engineers',
            'Agile/Scrum Team Collaboration',
            'Conducting Design Critiques',
            'Giving & Receiving Feedback',
            'Presenting Design Work & Storytelling',
            'Stakeholder Management',
            'Developer Handoffs (Specs, Assets)',
        ],
        'Portfolio & Interviewing': [
            'Portfolio Walkthrough & Case Studies',
            'Whiteboard Challenges',
            'App Redesign Critique',
            'Behavioral Questions (STAR Method)',
            'Design Philosophy',
            'Career Motivation ("Why UX?")',
        ],
    },
    'data-analyst': {
        'Core Data Skills': [
            'Data Cleaning & Preprocessing',
            'Data Wrangling',
            'Handling Missing or Duplicate Data',
            'Data Types & Structures',
            'Data Normalization & Standardization',
            'Exploratory Data Analysis (EDA)',
            'Outlier Detection & Handling',
            'Data Aggregation',
            'Data Validation',
        ],
        'SQL & Databases': [
            'SELECT, WHERE, GROUP BY, ORDER BY',
            'JOINs (INNER, LEFT, RIGHT, FULL)',
            'Subqueries and CTEs',
            'Window Functions (ROW_NUMBER, RANK, LEAD/LAG)',
            'Aggregation Functions (SUM, AVG, COUNT)',
            'CASE Statements',
            'Indexes and Query Optimization',
            'UNION vs UNION ALL',
            'Nested Queries',
            'Working with Relational Databases',
            'Data Modeling Basics',
        ],
        'Data Visualization': [
            'Charts (Bar, Line, Pie, Area, Scatter, Histogram)',
            'Dashboards',
            'Choosing the Right Chart',
            'Storytelling with Data',
            'DataViz Tools (Tableau, Power BI, Looker)',
            'Basic Interactivity (filters, slicers)',
            'Visual Best Practices',
            'Creating Reports for Business Users',
            'Time-Series Visualizations',
            'Geospatial Charts (Maps)',
        ],
        'Statistics & Probability': [
            'Mean, Median, Mode, Standard Deviation',
            'Distribution Types (Normal, Skewed)',
            'Hypothesis Testing (p-values, z-test, t-test)',
            'Confidence Intervals',
            'A/B Testing',
            'Correlation vs Causation',
            'Regression Analysis',
            'Chi-Square Test',
            'Probability Rules',
            'Sampling Techniques',
        ],
        'Excel & Spreadsheets': [
            'VLOOKUP / XLOOKUP',
            'Pivot Tables',
            'Conditional Formatting',
            'Data Validation',
            'IF Statements & Nested Logic',
            'Charts & Graphs',
            'Power Query / Power Pivot',
            'Using Excel for EDA',
            'Text & Date Functions',
            'Macros & Automation',
        ],
        'Python & R': [
            'Pandas and NumPy',
            'DataFrames and Series',
            'Data Cleaning with Python',
            'Matplotlib / Seaborn for Visualization',
            'Plotly for Interactive Dashboards',
            'Basic Statistical Analysis with Python',
            'Jupyter Notebooks',
            'Scripting and Automation',
            'R Basics',
            'Tidyverse, ggplot2 (for R)',
        ],
        'Business & Domain Knowledge': [
            'Understanding Business KPIs',
            'Translating Business Questions into Analysis',
            'Communicating Findings to Non-Technical Stakeholders',
            'Measuring Business Impact',
            'Financial Metrics (ROI, LTV, CAC)',
            'Product Metrics (Retention, Churn, DAU, MAU)',
            'Marketing Funnel Analysis',
            'Customer Segmentation',
            'E-commerce / Sales Analysis',
            'Revenue and Growth Trends',
        ],
        'Tools & Platforms': [
            'SQL (MySQL, PostgreSQL)',
            'Excel / Google Sheets',
            'Tableau / Power BI',
            'Python / Jupyter Notebooks',
            'RStudio',
            'Looker Studio',
            'Apache Airflow',
            'Git/GitHub',
            'Google Analytics',
            'Snowflake, Redshift, BigQuery',
        ],
        'Analytical Thinking': [
            'Breaking Down Complex Problems',
            'Identifying Key Metrics',
            'Designing Metrics and KPIs',
            'Interpreting Trends and Anomalies',
            'Root Cause Analysis',
            'Prioritizing Analytical Projects',
            'Critical Thinking',
            'Asking the Right Questions',
            'Being Curious with Data',
            'Communicating Uncertainty & Assumptions',
        ],
        'Interview Scenarios': [
            'SQL Case Studies',
            'A/B Test Design and Interpretation',
            'Dashboard Building Walkthrough',
            'Business Problem Solving',
            'Data Cleaning Challenge',
            'Exploratory Data Report',
            'Real-Time Scenario',
            'Product Usage Analysis',
            'Forecasting Demand or Sales',
            'Behavioral Questions',
        ],
    },
};


export default function NewInterviewPage() {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    // Reset scroll to top when role changes or new page
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [selectedRole]);

    // Clear tunnel overlay on mount and when going back
    useEffect(() => {
        const cleanupUI = () => {
            const overlay = document.getElementById('tunnel-overlay');
            if (overlay) {
                overlay.classList.remove('active', 'fade-black');
                overlay.style.opacity = ''; // Clear inline style so CSS classes can work
            }

            // Reset body background
            document.body.style.backgroundColor = '';

            // Reset any hidden sections or main containers
            const restoreElements = document.querySelectorAll('section, main, canvas');
            restoreElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                // If it was hidden by our transition styles, bring it back
                if (htmlEl.style.opacity === '0') {
                    htmlEl.style.opacity = '1';
                    htmlEl.style.transition = '';
                }
            });
        };

        cleanupUI();

        // Production-specific fallback: ensure it runs after any lingering animations
        const timer = setTimeout(cleanupUI, 100);
        return () => clearTimeout(timer);
    }, [selectedRole]);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
    };

    const handleBack = () => {
        setSelectedRole(null);
    };

    const roleName = selectedRole ? selectedRole.name : '';
    const roleSlug = selectedRole ? slugify(roleName) : '';
    const topics = selectedRole ? topicsByRole[roleSlug] || {} : {};

    return (
        <div className="flex flex-col min-h-screen bg-black overflow-hidden relative">
            <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8 relative overflow-y-auto" ref={containerRef}>
                {/* 3D Tunnel Particles Animation */}
                <TunnelParticles />

                {/* Organic Floating Orbs for Premium Core Vibe */}
                <FloatingOrb className="top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/20 blur-[100px]" delay={0} />
                <FloatingOrb className="bottom-[10%] right-[20%] w-[600px] h-[600px] bg-indigo-500/10 blur-[120px]" delay={2} />

                <div className="w-full max-w-7xl mx-auto relative z-10 flex flex-col items-center justify-center min-h-full py-8">
                    {!selectedRole ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center w-full"
                        >
                            <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-xl leading-[1.1]">
                                Step 1: Choose Your Role
                            </h1>
                            <p className="mt-6 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                                Select a role to begin your mock interview. The questions will be
                                tailored to this position.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="w-full max-w-4xl">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-4 mb-4"
                            >
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleBack}
                                    className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-300 hover:scale-105"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <p className="text-sm uppercase tracking-wider text-white/60 font-semibold mb-1">Current Role</p>
                                    <p className="text-xl text-white font-bold font-headline">{roleName}</p>
                                </div>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl font-bold font-headline tracking-tight sm:text-4xl md:text-5xl text-white drop-shadow-md leading-tight"
                            >
                                Step 2: Customize Your Interview
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mt-4 text-lg text-white/70"
                            >
                                Select the topics and their difficulty for your mock interview.
                            </motion.p>
                        </div>
                    )}

                    <div className="w-full mt-12 flex justify-center">
                        {!selectedRole ? (
                            <RoleSelectionForm onRoleSelect={handleRoleSelect} />
                        ) : (
                            <TopicSelection
                                roleSlug={roleSlug}
                                roleName={roleName}
                                topics={topics}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
