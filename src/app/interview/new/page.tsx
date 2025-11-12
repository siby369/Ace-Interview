'use client';

import { useState, useRef, useEffect } from 'react';
import { RoleSelectionForm } from '@/components/role-selection-form';
import TopicSelection from '@/components/topic-selection';
import type { Role } from '@/lib/types';
import { unslugify, slugify } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col min-h-screen bg-black">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-y-auto">
        {/* 3D Tunnel Particles Animation */}
        <TunnelParticles />
        
        {/* Subtle background glow matching landing page */}
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-40 blur-[100px] pointer-events-none z-0"
          style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.08), rgba(0,0,0,0) 70%)' }}
        />
        
        <div className="w-full max-w-6xl mx-auto relative z-10 flex flex-col min-h-full py-6 sm:py-8">
          {/* Split Header: Progress Indicator + Messaging */}
          {!selectedRole ? (
            <div className="w-full mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                    <span className="text-sm font-semibold text-white">1</span>
                  </div>
                  <div className="h-px w-12 bg-gradient-to-r from-white/20 to-transparent" />
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10">
                    <span className="text-sm font-medium text-white/40">2</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl md:text-5xl text-white mb-4">
                  Choose Your Role
                </h1>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  Select a role to begin your mock interview. The questions will be
                  tailored to this position.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleBack}
                    className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white backdrop-blur-sm transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-3 ml-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                      <span className="text-sm font-semibold text-white">1</span>
                    </div>
                    <div className="h-px w-12 bg-gradient-to-r from-white/20 via-white/30 to-white/20" />
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm ring-2 ring-primary/50">
                      <span className="text-sm font-semibold text-white">2</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white/60 mb-1 uppercase tracking-wider">Step 2 of 2</p>
                <h1 className="text-3xl font-bold font-headline tracking-tight sm:text-4xl text-white mb-2">
                  Customize Your Interview
                </h1>
                <p className="text-lg text-white/70">
                  Select topics and difficulty levels for <span className="font-semibold text-white/90">{roleName}</span>
                </p>
              </div>
            </div>
          )}

          {/* Glassmorphism Content Shell */}
          <div className="w-full">
            {!selectedRole ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <RoleSelectionForm onRoleSelect={handleRoleSelect} />
              </div>
            ) : (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <TopicSelection
                  roleSlug={roleSlug}
                  roleName={roleName}
                  topics={topics}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
