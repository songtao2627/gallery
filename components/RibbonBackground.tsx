import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface WaveConfig {
    color: string;
    speed: number;
    amplitude: number;
    frequency: number;
    yOffset: number;
    opacity: number;
    direction: 1 | -1; // New: Wave direction
}

interface ParticleConfig {
    size: number;
    speed: number;
    offset: number; // Initial x offset (0-1)
    waveIndex: number; // Which wave to follow
    color: string;
}

interface Theme {
    id: string;
    label: string;
    bg: string;
    text: string;
    title: string;
    waves: WaveConfig[];
    particles: ParticleConfig[];
}

const themes: Theme[] = [
    {
        id: 'fresh',
        label: '清新自然',
        bg: '#f0fdf4',
        text: '#374151', // Deep Gray-Green for readability
        title: '#15803d', // Vibrancy Green
        waves: [
            { color: 'rgba(132, 250, 176, 0.4)', speed: 0.2, amplitude: 50, frequency: 0.005, yOffset: 100, opacity: 0.4, direction: 1 },
            { color: 'rgba(143, 211, 244, 0.4)', speed: 0.3, amplitude: 70, frequency: 0.004, yOffset: 150, opacity: 0.4, direction: -1 },
            { color: 'rgba(252, 203, 144, 0.4)', speed: 0.15, amplitude: 40, frequency: 0.006, yOffset: 250, opacity: 0.4, direction: 1 },
            { color: 'rgba(0, 147, 233, 0.3)', speed: 0.4, amplitude: 60, frequency: 0.003, yOffset: 350, opacity: 0.3, direction: -1 },
        ],
        particles: [
            { size: 4, speed: 0.001, offset: 0.1, waveIndex: 1, color: '#ffffff' },
            { size: 6, speed: 0.0015, offset: 0.4, waveIndex: 0, color: 'rgba(255,255,255,0.8)' },
            { size: 3, speed: 0.0008, offset: 0.7, waveIndex: 2, color: '#ffffff' },
        ]
    },
    {
        id: 'cyber',
        label: '赛博朋克',
        bg: '#020617', // Deepest Blue/Black
        text: '#cbd5e1', // Light Slate for visibility on dark
        title: '#22d3ee', // Neon Cyan
        waves: [
            { color: 'rgba(255, 20, 147, 0.5)', speed: 0.25, amplitude: 80, frequency: 0.004, yOffset: 100, opacity: 0.5, direction: 1 },
            { color: 'rgba(0, 255, 255, 0.5)', speed: 0.35, amplitude: 60, frequency: 0.005, yOffset: 200, opacity: 0.5, direction: -1 },
            { color: 'rgba(255, 235, 59, 0.6)', speed: 0.15, amplitude: 40, frequency: 0.006, yOffset: 300, opacity: 0.6, direction: 1 },
            { color: 'rgba(138, 43, 226, 0.4)', speed: 0.45, amplitude: 70, frequency: 0.003, yOffset: 400, opacity: 0.4, direction: -1 },
        ],
        particles: [
            { size: 3, speed: 0.002, offset: 0.2, waveIndex: 1, color: '#00ffff' },
            { size: 4, speed: 0.003, offset: 0.6, waveIndex: 0, color: '#ff00ff' },
            { size: 2, speed: 0.001, offset: 0.8, waveIndex: 3, color: '#ffff00' },
        ]
    },
    {
        id: 'acid',
        label: '酸性波普',
        bg: '#171717',
        text: '#e2e8f0', // White/Gray instead of Yellow for readability
        title: '#d9f99d', // Acid Green
        waves: [
            { color: 'rgba(57, 255, 20, 0.5)', speed: 0.2, amplitude: 60, frequency: 0.005, yOffset: 120, opacity: 0.5, direction: 1 },
            { color: 'rgba(0, 240, 255, 0.5)', speed: 0.3, amplitude: 80, frequency: 0.004, yOffset: 220, opacity: 0.5, direction: -1 },
            { color: 'rgba(0, 110, 255, 0.5)', speed: 0.4, amplitude: 50, frequency: 0.003, yOffset: 320, opacity: 0.5, direction: 1 },
            { color: 'rgba(255, 255, 0, 0.5)', speed: 0.15, amplitude: 70, frequency: 0.006, yOffset: 420, opacity: 0.5, direction: -1 },
        ],
        particles: [
            { size: 5, speed: 0.002, offset: 0.3, waveIndex: 0, color: '#39ff14' },
            { size: 4, speed: 0.002, offset: 0.5, waveIndex: 1, color: '#00f0ff' },
        ]
    },
    {
        id: 'sunset',
        label: '温暖日落',
        bg: '#fff7ed',
        text: '#78350f', // Deep Warm Brown
        title: '#ea580c', // Burnt Orange
        waves: [
            { color: 'rgba(255, 107, 0, 0.5)', speed: 0.25, amplitude: 70, frequency: 0.004, yOffset: 150, opacity: 0.5, direction: 1 },
            { color: 'rgba(255, 0, 128, 0.4)', speed: 0.35, amplitude: 50, frequency: 0.005, yOffset: 250, opacity: 0.4, direction: -1 },
            { color: 'rgba(223, 255, 0, 0.6)', speed: 0.15, amplitude: 60, frequency: 0.006, yOffset: 350, opacity: 0.6, direction: 1 },
            { color: 'rgba(0, 255, 170, 0.4)', speed: 0.4, amplitude: 80, frequency: 0.003, yOffset: 450, opacity: 0.4, direction: -1 },
        ],
        particles: []
    }
];

const RibbonBackground: React.FC<{ initialThemeId?: string }> = ({ initialThemeId }) => {
    const containerRef = useRef<SVGSVGElement>(null);
    const [currentTheme, setCurrentTheme] = useState<Theme>(
        themes.find(t => t.id === initialThemeId) || themes[0]
    );
    const pathsRef = useRef<(SVGPathElement | null)[]>([]);
    const particlesRef = useRef<(SVGCircleElement | null)[]>([]);

    // Theme application effect (Document styles)
    useGSAP(() => {
        gsap.to(document.body, {
            backgroundColor: currentTheme.bg,
            color: currentTheme.text,
            duration: 0.5
        });

        document.documentElement.style.setProperty('--theme-title', currentTheme.title);
        document.documentElement.style.setProperty('--theme-text', currentTheme.text);
        document.documentElement.style.setProperty('--theme-bg', currentTheme.bg);

        // Fallback or additional global styles if needed
        const styleId = 'dynamic-theme-style';
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
            h1, h2, h3, h4, h5, h6 { color: var(--theme-title) !important; transition: color 0.5s ease; }
            p, span, div, li, a { color: var(--theme-text); transition: color 0.5s ease; }
            a { text-decoration-color: var(--theme-title); }
            * { transition-property: border-color; transition-duration: 0.3s; }
        `;
    }, { dependencies: [currentTheme] });

    // Animation Logic
    useGSAP(() => {
        if (!containerRef.current) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Entrance Application
        const tl = gsap.timeline();

        // Animate paths entering
        tl.from(pathsRef.current, {
            y: 100,
            opacity: 0,
            duration: 1.5,
            stagger: 0.1,
            ease: "power3.out"
        }, 0);

        // Render loop
        const startTime = Date.now();

        const render = () => {
            const now = (Date.now() - startTime) * 0.001; // time in seconds

            // 1. Update Waves
            currentTheme.waves.forEach((wave, i) => {
                const pathEl = pathsRef.current[i];
                if (!pathEl) return;

                // Build path string
                // Using fewer points for performance, using Bezier curves would be smoother but sine is easy
                // To optimize, we calculate points ~every 10px
                let d = `M 0 ${height}`; // Start bottom-left

                // We need to trace the top surface of the wave
                const step = 20; // px steps
                for (let x = 0; x <= width + step; x += step) {
                    // Sine calculation
                    // phase shift = time * speed
                    const timeComponent = now * wave.speed;
                    // direction
                    const phase = wave.direction * timeComponent;

                    const y = Math.sin(x * wave.frequency + phase) * wave.amplitude
                        + (height / 2) + wave.yOffset;

                    if (x === 0) d += ` L 0 ${y}`;
                    else d += ` L ${x} ${y}`;
                }

                d += ` L ${width} ${height} Z`; // Close bottom-right and back to bottom-left
                pathEl.setAttribute('d', d);
            });

            // 2. Update Particles (Path Following)
            currentTheme.particles.forEach((p, i) => {
                const particleEl = particlesRef.current[i];
                if (!particleEl) return;

                const wave = currentTheme.waves[p.waveIndex];
                if (!wave) return;

                // Calculate x position based on infinite scroll or loop
                // Position 0-1 across screen
                let currentProgress = (p.offset + now * p.speed) % 1;
                const x = currentProgress * width;

                // Calculate Y exactly matching the wave equation at this X
                const timeComponent = now * wave.speed;
                const phase = wave.direction * timeComponent;
                const y = Math.sin(x * wave.frequency + phase) * wave.amplitude
                    + (height / 2) + wave.yOffset;

                particleEl.setAttribute('cx', String(x));
                particleEl.setAttribute('cy', String(y));
            });
        };

        gsap.ticker.add(render);

        return () => {
            gsap.ticker.remove(render);
        };

    }, { scope: containerRef, dependencies: [currentTheme] }); // Re-run when theme changes to reset timeline/elements

    return (
        <>
            <svg
                ref={containerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                    pointerEvents: 'none',
                    // Using CSS transition for background color of the SVG itself if needed, but we animate body
                }}
            >
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Waves */}
                {currentTheme.waves.map((wave, i) => (
                    <path
                        key={`wave-${i}`}
                        ref={el => { pathsRef.current[i] = el; }}
                        fill={wave.color}
                        style={{
                            transition: 'fill 0.5s ease', // Smooth color transition when theme changes
                        }}
                    />
                ))}

                {/* Particles */}
                {currentTheme.particles.map((p, i) => (
                    <circle
                        key={`particle-${i}`}
                        ref={el => { particlesRef.current[i] = el; }}
                        r={p.size}
                        fill={p.color}
                        style={{
                            filter: 'url(#glow)',
                            opacity: 0.8
                        }}
                    />
                ))}
            </svg>

            {/* Theme Switcher UI (Simplified from previous) */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                gap: '12px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                borderRadius: '50px',
                zIndex: 9999,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.18)'
            }}>
                {themes.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => setCurrentTheme(theme)}
                        title={theme.label}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.title}, ${theme.bg})`,
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: currentTheme.id === theme.id
                                ? `0 0 0 3px ${currentTheme.text}, 0 2px 4px rgba(0,0,0,0.2)`
                                : '0 2px 4px rgba(0,0,0,0.2)',
                            transform: currentTheme.id === theme.id ? 'scale(1.1)' : 'scale(1)'
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default RibbonBackground;
