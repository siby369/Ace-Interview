'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BotMessageSquare, BrainCircuit, MicVocal, ArrowRight, Zap } from 'lucide-react';
import BackgroundParticles from '@/components/background-particles';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// Tunnel transition handler
function handleTunnelTransition(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();

    const link = e.currentTarget as HTMLElement;
    const button = link.querySelector('button') as HTMLElement;
    if (!button) return;

    // Hide background content immediately (particles, glow, etc.)
    const section = document.querySelector('section');
    if (section) {
        section.style.opacity = '0';
        section.style.transition = 'opacity 0.15s ease-out';
    }

    // Hide tunnel particles canvas
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((canvas) => {
        (canvas as HTMLElement).style.opacity = '0';
        (canvas as HTMLElement).style.transition = 'opacity 0.15s ease-out';
    });

    // Hide any background glows and particles
    const backgroundElements = document.querySelectorAll('section > div[style*="radial-gradient"], section > div[style*="blur"]');
    backgroundElements.forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.transition = 'opacity 0.15s ease-out';
    });

    // Set background to black immediately
    document.body.style.backgroundColor = '#000000';
    document.body.style.transition = 'background-color 0.1s ease-out';

    // STEP 1: Compute button center FIRST (before any DOM changes)
    const buttonRect = button.getBoundingClientRect();
    const cx = buttonRect.left + buttonRect.width / 2;
    const cy = buttonRect.top + buttonRect.height / 2;

    // STEP 2: Set CSS variables IMMEDIATELY on both root and overlay
    document.documentElement.style.setProperty('--tunnel-cx', `${cx}px`);
    document.documentElement.style.setProperty('--tunnel-cy', `${cy}px`);

    const overlay = document.getElementById('tunnel-overlay') as HTMLElement;
    if (overlay) {
        overlay.style.setProperty('--tunnel-cx', `${cx}px`);
        overlay.style.setProperty('--tunnel-cy', `${cy}px`);
        // Force reflow to apply CSS variables
        void overlay.offsetWidth;
    }

    // STEP 3: Get screen center for button animation
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    // STEP 4: Calculate translation needed for button animation
    const translateX = screenCenterX - cx;
    const translateY = screenCenterY - cy;

    // STEP 5: Clone button BEFORE hiding original (prevents jumping)
    const buttonClone = button.cloneNode(true) as HTMLElement;
    const computedStyle = window.getComputedStyle(button);

    // Set exact position and dimensions to match original
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const maxDimension = Math.max(buttonWidth, buttonHeight);

    buttonClone.style.position = 'fixed';
    buttonClone.style.left = `${buttonRect.left}px`;
    buttonClone.style.top = `${buttonRect.top}px`;
    buttonClone.style.width = `${buttonWidth}px`;
    buttonClone.style.height = `${buttonHeight}px`;
    buttonClone.style.margin = '0';
    buttonClone.style.padding = computedStyle.padding;
    buttonClone.style.transformOrigin = 'center center';
    // Start with original border-radius, transition to perfect circle
    const originalBorderRadius = computedStyle.borderRadius || '0px';
    buttonClone.style.borderRadius = originalBorderRadius;
    buttonClone.style.transform = 'translate(0, 0) scale(1)';
    buttonClone.style.opacity = '1';
    buttonClone.style.zIndex = '10000';
    buttonClone.style.pointerEvents = 'none';
    // All transitions happen simultaneously with same easing and duration (faster)
    buttonClone.style.transition = 'transform 0.3s cubic-bezier(0.35, 0.0, 0.25, 1), border-radius 0.3s cubic-bezier(0.35, 0.0, 0.25, 1), opacity 0.1s cubic-bezier(0.35, 0.0, 0.25, 1) 0.2s';
    buttonClone.className = button.className;

    // Append to body (isolated from parent transforms)
    document.body.appendChild(buttonClone);

    // STEP 6: Force reflow to ensure clone is positioned correctly
    void buttonClone.offsetWidth;

    // STEP 7: Hide original button AFTER clone is positioned
    button.style.opacity = '0';
    button.style.pointerEvents = 'none';
    link.style.pointerEvents = 'none';

    // STEP 8: Animate button to center with simultaneous shrink to circle
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Move to center and shrink to circle simultaneously
            // Perfect circle: use 50% border-radius (works for any aspect ratio when scaled)
            buttonClone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.15)`;
            buttonClone.style.borderRadius = '50%'; // Perfect circle collapse
            // Fade out during last 30% (starts at 70% = 0.2s of 0.3s total)
            buttonClone.style.opacity = '0';
        });
    });

    // STEP 9: After button reaches center, update tunnel center and activate
    const buttonAnimationDuration = 300; // 300ms duration (faster)
    setTimeout(() => {
        // Update tunnel center to screen center (where button animation ends)
        const finalCx = screenCenterX;
        const finalCy = screenCenterY;

        document.documentElement.style.setProperty('--tunnel-cx', `${finalCx}px`);
        document.documentElement.style.setProperty('--tunnel-cy', `${finalCy}px`);

        if (overlay) {
            overlay.style.setProperty('--tunnel-cx', `${finalCx}px`);
            overlay.style.setProperty('--tunnel-cy', `${finalCy}px`);

            // Force reflow to apply new position BEFORE activating
            void overlay.offsetWidth;

            // Force reflow on all rings to ensure proper positioning
            const rings = overlay.querySelectorAll('.tunnel-ring');
            rings.forEach(ring => {
                void (ring as HTMLElement).offsetWidth;
            });

            // Small delay before activating tunnel (prevents flicker)
            setTimeout(() => {
                overlay.classList.add('active');

                // Fade to black immediately (faster transition)
                setTimeout(() => {
                    overlay.classList.add('fade-black');
                }, 300);

                // Navigate faster after animation completes
                setTimeout(() => {
                    window.location.href = '/interview/new';
                }, 1000);
            }, 50);
        } else {
            // Fallback
            window.location.href = '/interview/new';
        }

        // Clean up clone
        setTimeout(() => {
            if (buttonClone.parentNode) {
                buttonClone.parentNode.removeChild(buttonClone);
            }
        }, 2000);
    }, buttonAnimationDuration);
}

const features = [
    {
        icon: <BrainCircuit size={32} className="text-primary" />,
        title: 'AI-Generated Questions',
        description: 'Every session brings fresh, tailored questions designed for your target role and chosen topics.',
        delay: 0.12
    },
    {
        icon: <BotMessageSquare size={32} className="text-primary" />,
        title: 'Instant, In-Depth Feedback',
        description: 'Get real-time insights on what you said and how you said it—content and delivery analyzed together.',
        delay: 0.27
    },
    {
        icon: <MicVocal size={32} className="text-primary" />,
        title: 'Pronunciation Analysis',
        description: 'Build clarity and confidence with detailed pronunciation feedback, scores, and actionable improvement tips.',
        delay: 0.41
    }
];

// Floating gradient orb component for depth effect with organic movement
const FloatingOrb = ({ delay = 0, className = '' }: { delay?: number; className?: string }) => {
    // Add subtle randomness to create organic feel
    const baseDuration = 7.5 + Math.random() * 2.5 + delay;
    const jitterAmount = 2 + Math.random() * 3;

    return (
        <motion.div
            className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
            style={{
                borderRadius: `${45 + Math.random() * 10}%`,
            }}
            animate={{
                y: [0, -25 - jitterAmount, 0],
                x: [0, 15 + Math.random() * 10, 0],
                scale: [1, 1.08 + Math.random() * 0.04, 1],
                opacity: [0.18, 0.22 + Math.random() * 0.03, 0.18],
            }}
            transition={{
                duration: baseDuration,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1], // More organic easing
                times: [0, 0.5, 1],
            }}
        />
    );
};

// Tunnel-like particle field converging toward the center glow
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
        const focalLength = 450; // controls perspective depth
        const particleCount = 450; // dense but subtle
        const minZ = 0.6; // near plane
        const maxZ = 6; // far plane
        const baseSpeed = 0.003; // forward pull speed

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
                const radius = Math.pow(Math.random(), 1.2) * Math.max(width, height) * 0.35 + 20;
                // Vary particle sizes more dramatically for organic feel
                const sizeVariation = Math.random();
                const baseRadius = sizeVariation < 0.1 ? 0.3 : sizeVariation < 0.4 ? 0.6 : sizeVariation < 0.7 ? 1.0 : 1.8;
                return {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    z: Math.random() * (maxZ - minZ) + minZ,
                    r: baseRadius + Math.random() * 0.4,
                    speed: baseSpeed * (0.7 + Math.random() * 0.6) // Vary speed for organic movement
                };
            });
        };

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            // subtle vignette to help the tunnel read
            const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.8);
            grd.addColorStop(0, 'rgba(0,0,0,0)');
            grd.addColorStop(1, 'rgba(0,0,0,0.4)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, width, height);

            // particles projected toward camera with varied speeds
            ctx.fillStyle = 'rgba(230,235,255,0.55)';
            for (const p of particlesRef.current) {
                const particleSpeed = (p as any).speed || baseSpeed;
                p.z -= particleSpeed;
                if (p.z <= minZ) {
                    p.z = maxZ;
                    // Add slight randomness when resetting for organic feel
                    p.x += (Math.random() - 0.5) * 10;
                    p.y += (Math.random() - 0.5) * 10;
                }
                const scale = focalLength / (focalLength * p.z);
                const sx = cx + p.x * scale;
                const sy = cy + p.y * scale;
                const radius = Math.max(0.3, p.r * scale * 2.0);
                // Vary opacity slightly for depth
                const opacity = 0.45 + (p.z / maxZ) * 0.15;
                if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) continue;
                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(sx, sy, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
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
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />
    );
};

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);

    // RESET UI STATE ON MOUNT (Handles Production BFCache / Back Button)
    useEffect(() => {
        const resetGlobalUI = () => {
            // Reset tunnel overlay
            const overlay = document.getElementById('tunnel-overlay');
            if (overlay) {
                overlay.classList.remove('active', 'fade-black');
            }

            // Reset body
            document.body.style.backgroundColor = '';

            // Restore visibility to sections and canvases
            const sections = document.querySelectorAll('section');
            sections.forEach((s) => {
                (s as HTMLElement).style.opacity = '1';
                (s as HTMLElement).style.transition = '';
            });

            const canvases = document.querySelectorAll('canvas');
            canvases.forEach((c) => {
                (c as HTMLElement).style.opacity = '1';
                (c as HTMLElement).style.transition = '';
            });
        };

        resetGlobalUI();

        // Handle browser Back/Forward cache restores
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                resetGlobalUI();
            }
        });

        return () => window.removeEventListener('pageshow', resetGlobalUI);
    }, []);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    });

    // Cursor-reactive glow
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Parallax transforms
    const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
    const featuresY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

    // Cursor-reactive glow position with spring physics
    const glowX = useSpring(useMotionValue(mousePosition.x), { stiffness: 50, damping: 20 });
    const glowY = useSpring(useMotionValue(mousePosition.y), { stiffness: 50, damping: 20 });

    useEffect(() => {
        glowX.set(mousePosition.x);
        glowY.set(mousePosition.y);
    }, [mousePosition, glowX, glowY]);

    return (
        <div ref={containerRef} className="flex flex-col min-h-screen overflow-hidden">
            {/* Navigation Header */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-6 h-16 flex items-center backdrop-blur-xl bg-background/80"
            >
                <Link href="#" className="flex items-center justify-center group" prefetch={false}>
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        <BotMessageSquare className="h-6 w-6 text-primary" />
                    </motion.div>
                    <span className="sr-only">Ace Interview</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link
                        href="/interview/new"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                        prefetch={false}
                    >
                        <span className="inline-flex items-center gap-1 transition-transform duration-300 group-hover:-translate-y-0.5">
                            Start Interview
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                        </span>
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-primary/0 via-primary to-primary/0 group-hover:w-full transition-all duration-500 animate-gradient" />
                    </Link>
                    <Link
                        href="/practice/pronunciation"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                        prefetch={false}
                    >
                        <span className="inline-flex items-center gap-1 transition-transform duration-300 group-hover:-translate-y-0.5">
                            Pronunciation Practice
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                        </span>
                        <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-primary/0 via-primary to-primary/0 group-hover:w-full transition-all duration-500 animate-gradient" />
                    </Link>
                </nav>
            </motion.header>

            <main className="flex-1 relative">
                {/* Subtle noise texture overlay */}
                <div className="noise-overlay" />

                {/* Immersive tunnel hero */}
                <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-black">
                    {/* Center glow that expands slightly on scroll - more organic */}
                    <motion.div aria-hidden className="absolute inset-0" style={{ scale: glowScale }}>
                        <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] opacity-60 blur-[120px]"
                            style={{
                                borderRadius: '45%',
                                background: 'radial-gradient(ellipse closest-side, rgba(255,255,255,0.08), rgba(255,255,255,0.03) 50%, rgba(0,0,0,0) 75%)'
                            }}
                        />
                        {/* Additional subtle glow layer for depth */}
                        <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30 blur-[80px]"
                            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05), transparent 60%)' }}
                        />
                    </motion.div>

                    {/* Cursor-reactive subtle glow */}
                    <motion.div
                        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%)',
                            mixBlendMode: 'screen',
                            x: useTransform(glowX, (x) => x - 300),
                            y: useTransform(glowY, (y) => y - 300),
                        }}
                        animate={{
                            opacity: [0, 0.12, 0],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />

                    {/* Tunnel particles converging to center */}
                    <TunnelParticles />

                    {/* Hero Content with float-in fade */}
                    <motion.div
                        style={{ y: heroY }}
                        className="container px-4 md:px-6 text-center relative z-10"
                    >
                        <div className="space-y-7 sm:space-y-9 max-w-5xl mx-auto">
                            <motion.h1
                                initial={{ opacity: 0, y: 24, scale: 1.02 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                                className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline leading-[1.08]"
                                style={{
                                    textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.1)',
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                <span className="font-bold tracking-[-0.015em]">Enter</span>{' '}
                                <span className="font-semibold tracking-[-0.01em]">the</span>{' '}
                                <span className="font-bold tracking-[-0.02em]">Interview</span>{' '}
                                <span className="font-semibold tracking-[-0.018em]">Chamber</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 18, scale: 1.02 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
                                className="mx-auto max-w-[760px] text-white/75 md:text-xl text-lg leading-[1.65] tracking-[-0.01em]"
                                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                            >
                                Step into an immersive practice space where AI guides your preparation. Real-time feedback. Calm confidence. Real results.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 16, scale: 1.02 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1], delay: 0.48 }}
                                className="flex items-center justify-center pt-2"
                            >
                                <Link href="/interview/new" onClick={handleTunnelTransition}>
                                    <Button
                                        size="lg"
                                        className="group relative px-8 h-12 rounded-lg bg-white text-black hover:bg-white/95 transition-all duration-300 active:scale-[0.96] hover:-translate-y-0.5 hover:scale-[1.01]"
                                        style={{
                                            boxShadow: '0 12px 36px -18px rgba(210,220,255,0.45)',
                                            borderRadius: '0.5rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 18px 52px -10px rgba(210,220,255,0.65)';
                                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 12px 36px -18px rgba(210,220,255,0.45)';
                                            e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                        }}
                                        onMouseDown={(e) => {
                                            e.currentTarget.style.transform = 'scale(0.96) translateY(0)';
                                        }}
                                        onMouseUp={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.01) translateY(-2px)';
                                        }}
                                    >
                                        <span className="relative z-10 inline-flex items-center gap-2.5 font-semibold tracking-[-0.01em]">
                                            Start Your Free Mock Interview
                                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                                        </span>
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Minimal scroll cue with organic movement */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: 1.1, duration: 0.65 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2.3, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                            className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2"
                            style={{ borderRadius: '9999px' }}
                        >
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 2.3, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                                className="w-1.5 h-1.5 bg-white/60 rounded-full"
                            />
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <motion.section
                    style={{ y: featuresY }}
                    id="features"
                    className="relative w-full py-24 md:py-32 lg:py-40 bg-black"
                >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10 pointer-events-none" />

                    <div className="container px-4 md:px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center justify-center space-y-5 text-center mb-20"
                        >
                            <div className="space-y-4">
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter text-white"
                                    style={{
                                        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                        letterSpacing: '-0.03em'
                                    }}
                                >
                                    Key Features
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.68, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                                    className="max-w-[900px] text-white/75 md:text-xl lg:text-lg xl:text-xl leading-relaxed tracking-[-0.01em]"
                                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                                >
                                    Everything you need to walk in prepared, practice with purpose, and perform with confidence when it matters most.
                                </motion.p>
                            </div>
                        </motion.div>

                        <div className="mx-auto grid max-w-6xl items-start gap-7 sm:grid-cols-2 md:gap-9 lg:grid-cols-3">
                            {features.map((feature, i) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.65, delay: feature.delay, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ y: -6, scale: 1.015 }}
                                    className="group relative p-9 rounded-2xl bg-black border border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-2xl hover:shadow-white/10 transition-all duration-500 overflow-hidden"
                                    style={{
                                        borderRadius: i === 1 ? '1.5rem' : '1.75rem', // Subtle asymmetry
                                        opacity: 0.98 + (i * 0.01) // Slight opacity variation
                                    }}
                                >
                                    {/* Hover gradient effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Subtle glow on hover */}
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

                                    <div className="relative z-10 space-y-5">
                                        <motion.div
                                            whileHover={{ scale: 1.12, rotate: 3 + Math.random() * 4 }}
                                            transition={{ type: 'spring', stiffness: 280, damping: 12 }}
                                            className="inline-flex p-3.5 rounded-xl bg-black border border-white/20"
                                            style={{ borderRadius: '0.75rem' }}
                                        >
                                            {feature.icon}
                                        </motion.div>
                                        <h3 className="text-xl font-bold font-headline text-white group-hover:text-white transition-colors tracking-[-0.01em]" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-white/72 leading-relaxed tracking-[-0.005em]">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            </main>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center justify-center px-4 md:px-6 bg-background/50 backdrop-blur-sm"
            >
                <p className="text-xs text-muted-foreground">
                    © 2025 Ace Interview. All rights reserved.
                </p>
            </motion.footer>
        </div>
    );
}
