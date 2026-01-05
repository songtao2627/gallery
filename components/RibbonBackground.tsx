import React, { useEffect, useRef, useState } from 'react';

interface WaveProps {
    color: string;
    speed: number;
    amplitude: number;
    frequency: number;
    yOffset: number;
    opacity: number;
}

interface Theme {
    id: string;
    label: string;
    bg: string;       // css background-color
    text: string;     // css color for text
    title: string;    // css color for titles
    waves: WaveProps[];
}

const themes: Theme[] = [
    {
        id: 'fresh',
        label: '清新自然',
        bg: '#f0fdf4', // Light green-ish white
        text: '#14532d', // Dark green
        title: '#166534', // Green 700
        waves: [
            { color: 'rgba(132, 250, 176, 0.4)', speed: 0.0002, amplitude: 50, frequency: 0.005, yOffset: 100, opacity: 0.4 }, // Fresh Lime
            { color: 'rgba(143, 211, 244, 0.4)', speed: 0.0003, amplitude: 70, frequency: 0.004, yOffset: 200, opacity: 0.4 }, // Fresh Cyan
            { color: 'rgba(252, 203, 144, 0.4)', speed: 0.0001, amplitude: 40, frequency: 0.006, yOffset: 300, opacity: 0.4 }, // Fresh Lemon
            { color: 'rgba(0, 147, 233, 0.3)', speed: 0.0004, amplitude: 60, frequency: 0.003, yOffset: 400, opacity: 0.3 }, // Fresh Teal
        ]
    },
    {
        id: 'cyber',
        label: '赛博朋克',
        bg: '#0f172a', // Slate 900
        text: '#e2e8f0', // Slate 200
        title: '#f472b6', // Pink 400
        waves: [
            { color: 'rgba(255, 20, 147, 0.5)', speed: 0.00025, amplitude: 80, frequency: 0.004, yOffset: 100, opacity: 0.5 }, // Neon Pink
            { color: 'rgba(0, 255, 255, 0.5)', speed: 0.00035, amplitude: 60, frequency: 0.005, yOffset: 200, opacity: 0.5 }, // Electric Cyan
            { color: 'rgba(255, 235, 59, 0.6)', speed: 0.00015, amplitude: 40, frequency: 0.006, yOffset: 300, opacity: 0.6 }, // Sunny Yellow
            { color: 'rgba(138, 43, 226, 0.4)', speed: 0.00045, amplitude: 70, frequency: 0.003, yOffset: 400, opacity: 0.4 }, // Vivid Purple
        ]
    },
    {
        id: 'acid',
        label: '酸性波普',
        bg: '#171717', // Neutral 900
        text: '#fef08a', // Yellow 200
        title: '#bef264', // Lime 400
        waves: [
            { color: 'rgba(57, 255, 20, 0.5)', speed: 0.0002, amplitude: 60, frequency: 0.005, yOffset: 120, opacity: 0.5 }, // Lime Punch
            { color: 'rgba(0, 240, 255, 0.5)', speed: 0.0003, amplitude: 80, frequency: 0.004, yOffset: 220, opacity: 0.5 }, // Hot Turquoise
            { color: 'rgba(0, 110, 255, 0.5)', speed: 0.0004, amplitude: 50, frequency: 0.003, yOffset: 320, opacity: 0.5 }, // Electric Blue
            { color: 'rgba(255, 255, 0, 0.5)', speed: 0.00015, amplitude: 70, frequency: 0.006, yOffset: 420, opacity: 0.5 }, // Highlighter Yellow
        ]
    },
    {
        id: 'sunset',
        label: '温暖日落',
        bg: '#fff7ed', // Orange 50
        text: '#7c2d12', // Orange 900
        title: '#c2410c', // Orange 700
        waves: [
            { color: 'rgba(255, 107, 0, 0.5)', speed: 0.00025, amplitude: 70, frequency: 0.004, yOffset: 150, opacity: 0.5 }, // Bright Orange
            { color: 'rgba(255, 0, 128, 0.4)', speed: 0.00035, amplitude: 50, frequency: 0.005, yOffset: 250, opacity: 0.4 }, // Magenta Pop
            { color: 'rgba(223, 255, 0, 0.6)', speed: 0.00015, amplitude: 60, frequency: 0.006, yOffset: 350, opacity: 0.6 }, // Laser Lemon
            { color: 'rgba(0, 255, 170, 0.4)', speed: 0.0004, amplitude: 80, frequency: 0.003, yOffset: 450, opacity: 0.4 }, // Aqua
        ]
    }
];

const RibbonBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

    useEffect(() => {
        // Apply global theme styles
        document.body.style.backgroundColor = currentTheme.bg;
        document.body.style.color = currentTheme.text;
        document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';

        document.documentElement.style.setProperty('--theme-title', currentTheme.title);
        document.documentElement.style.setProperty('--theme-text', currentTheme.text);

        // CSS Injection for common elements to ensure theme application
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
            /* Force transition on everything for smooth switch */
            * { transition-property: background-color, color, border-color; transition-duration: 0.3s; }
        `;

    }, [currentTheme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawWave = (wave: WaveProps) => {
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);

            for (let x = 0; x < canvas.width; x++) {
                // Sine wave formula: y = amplitude * sin(frequency * x + time) + center
                const y = Math.sin(x * wave.frequency + time * wave.speed * 100) * wave.amplitude + (canvas.height / 2) + wave.yOffset;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(canvas.width, canvas.height); // Close path at bottom right
            ctx.lineTo(0, canvas.height); // Close path at bottom left
            ctx.fillStyle = wave.color;
            ctx.fill();
            ctx.closePath();
        };

        const render = () => {
            time++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Re-drawing with new colors happens automatically because we iterate over currentTheme.waves
            currentTheme.waves.forEach(wave => {
                drawWave(wave);
            });

            animationFrameId = window.requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [currentTheme]);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                    pointerEvents: 'none',
                    opacity: 0.6, // Subtle background
                }}
            />
            {/* Theme Switcher UI */}
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
                            border: currentTheme.id === theme.id ? `3px solid ${currentTheme.text}` : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, border 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transform: currentTheme.id === theme.id ? 'scale(1.1)' : 'scale(1)'
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default RibbonBackground;
