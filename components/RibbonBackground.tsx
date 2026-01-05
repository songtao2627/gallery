import React, { useEffect, useRef } from 'react';

interface WaveProps {
    color: string;
    speed: number;
    amplitude: number;
    frequency: number;
    yOffset: number;
    opacity: number;
}

const RibbonBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        // const waves: WaveProps[] = [
        //     { color: 'rgba(132, 250, 176, 0.4)', speed: 0.0004, amplitude: 50, frequency: 0.005, yOffset: 100, opacity: 0.4 }, // Fresh Lime
        //     { color: 'rgba(143, 211, 244, 0.4)', speed: 0.0006, amplitude: 70, frequency: 0.004, yOffset: 200, opacity: 0.4 }, // Fresh Cyan
        //     { color: 'rgba(252, 203, 144, 0.4)', speed: 0.0002, amplitude: 40, frequency: 0.006, yOffset: 300, opacity: 0.4 }, // Fresh Lemon
        //     { color: 'rgba(0, 147, 233, 0.3)', speed: 0.0008, amplitude: 60, frequency: 0.003, yOffset: 400, opacity: 0.3 }, // Fresh Teal
        // ];

        // const waves: WaveProps[] = [
        //     // Neon Pink (高亮粉 - 视觉焦点)
        //     { color: 'rgba(255, 20, 147, 0.5)', speed: 0.0005, amplitude: 80, frequency: 0.004, yOffset: 100, opacity: 0.5 },
        //     // Electric Cyan (电光青 - 极度清爽)
        //     { color: 'rgba(0, 255, 255, 0.5)', speed: 0.0007, amplitude: 60, frequency: 0.005, yOffset: 200, opacity: 0.5 },
        //     // Sunny Yellow (阳光黄 - 提亮整体)
        //     { color: 'rgba(255, 235, 59, 0.6)', speed: 0.0003, amplitude: 40, frequency: 0.006, yOffset: 300, opacity: 0.6 },
        //     // Vivid Purple (鲜艳紫 - 增加深邃感)
        //     { color: 'rgba(138, 43, 226, 0.4)', speed: 0.0009, amplitude: 70, frequency: 0.003, yOffset: 400, opacity: 0.4 },
        // ];

        // const waves: WaveProps[] = [
        //     // Lime Punch (酸性青柠 - 极其刺眼醒目)
        //     { color: 'rgba(57, 255, 20, 0.5)', speed: 0.0004, amplitude: 60, frequency: 0.005, yOffset: 120, opacity: 0.5 },
        //     // Hot Turquoise (热带绿松石 - 蓝绿之间的完美平衡)
        //     { color: 'rgba(0, 240, 255, 0.5)', speed: 0.0006, amplitude: 80, frequency: 0.004, yOffset: 220, opacity: 0.5 },
        //     // Electric Blue (电光蓝 - 深邃且高能)
        //     { color: 'rgba(0, 110, 255, 0.5)', speed: 0.0008, amplitude: 50, frequency: 0.003, yOffset: 320, opacity: 0.5 },
        //     // Highlighter Yellow (荧光笔黄 - 强烈的对比)
        //     { color: 'rgba(255, 255, 0, 0.5)', speed: 0.0003, amplitude: 70, frequency: 0.006, yOffset: 420, opacity: 0.5 },
        // ];

        const waves: WaveProps[] = [
            // Bright Orange (亮橙色 - 活力之源)
            { color: 'rgba(255, 107, 0, 0.5)', speed: 0.0005, amplitude: 70, frequency: 0.004, yOffset: 150, opacity: 0.5 },
            // Magenta Pop (洋红 - 时尚感)
            { color: 'rgba(255, 0, 128, 0.4)', speed: 0.0007, amplitude: 50, frequency: 0.005, yOffset: 250, opacity: 0.4 },
            // Laser Lemon (镭射柠檬 - 透亮)
            { color: 'rgba(223, 255, 0, 0.6)', speed: 0.0003, amplitude: 60, frequency: 0.006, yOffset: 350, opacity: 0.6 },
            // Aqua (水绿色 - 一点点冷色来平衡)
            { color: 'rgba(0, 255, 170, 0.4)', speed: 0.0008, amplitude: 80, frequency: 0.003, yOffset: 450, opacity: 0.4 },
        ];

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

        // Alternative: Stroke-only ribbons (more "ribbon-like", less "liquid")
        const drawRibbon = (wave: WaveProps) => {
            ctx.beginPath();

            for (let x = 0; x <= canvas.width; x += 10) { // Optimization: step by 10
                const y = Math.sin(x * wave.frequency + time * wave.speed * 50) * wave.amplitude + (canvas.height * 0.4) + wave.yOffset;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.strokeStyle = wave.color.replace('0.4', '0.8').replace('0.3', '0.8'); // More opaque stroke
            ctx.lineWidth = 40; // Thick ribbons
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        };

        const render = () => {
            time++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Use composite operation for nice blending
            // ctx.globalCompositeOperation = 'screen'; 

            waves.forEach(wave => {
                // We use the "Ribbon" style (stroke) or "Wave" style (fill). 
                // User asked for "Ribbons", so stroke might look better, 
                // BUT "Liquid flowing" implies fill. 
                // Let's try a hybrid: Filled waves for liquid feel.
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
    }, []);

    return (
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
    );
};

export default RibbonBackground;
