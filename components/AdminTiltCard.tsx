import React, { useRef } from 'react';
import { Project } from '../types';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface AdminTiltCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
    showActions?: boolean;
}

const AdminTiltCard: React.FC<AdminTiltCardProps> = ({ project, onEdit, onDelete, showActions = true }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sheenRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // ... (keep existing GSAP hooks and handlers unmodified) ...
    // GSAP Optimized Animation Setters
    const xTo = useRef<gsap.QuickToFunc | null>(null);
    const yTo = useRef<gsap.QuickToFunc | null>(null);
    const sheenXTo = useRef<gsap.QuickToFunc | null>(null);
    const sheenYTo = useRef<gsap.QuickToFunc | null>(null);

    useGSAP(() => {
        if (!containerRef.current || !sheenRef.current) return;

        // Initialize QuickTo functions for performance
        xTo.current = gsap.quickTo(containerRef.current, "rotationX", { duration: 0.4, ease: "power3.out" });
        yTo.current = gsap.quickTo(containerRef.current, "rotationY", { duration: 0.4, ease: "power3.out" });

        // Sheen movement
        sheenXTo.current = gsap.quickTo(sheenRef.current, "x", { duration: 0.4, ease: "power3.out" });
        sheenYTo.current = gsap.quickTo(sheenRef.current, "y", { duration: 0.4, ease: "power3.out" });

        // Initial State
        gsap.set(containerRef.current, { transformPerspective: 1000, transformStyle: "preserve-3d" });
    }, { scope: cardRef });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !xTo.current || !yTo.current || !sheenXTo.current || !sheenYTo.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Mouse position relative to card center
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const centerX = width / 2;
        const centerY = height / 2;

        // Rotation math (Limit rotation to around 10 degrees)
        const rotateX = ((mouseY - centerY) / centerY) * -10;
        const rotateY = ((mouseX - centerX) / centerX) * 10;

        // Apply rotation
        xTo.current(rotateX);
        yTo.current(rotateY);

        // Sheen math (Move gradient opposite to mouse or follow mouse)
        sheenXTo.current(mouseX - width / 2);
        sheenYTo.current(mouseY - height / 2);
    };

    const handleMouseEnter = () => {
        if (containerRef.current) {
            gsap.to(containerRef.current, { scale: 1.05, duration: 0.3, ease: "back.out(1.2)" });
        }
        if (sheenRef.current) {
            gsap.to(sheenRef.current, { opacity: 0.4, duration: 0.3 });
        }
    };

    const handleMouseLeave = () => {
        if (!xTo.current || !yTo.current) return;

        // Reset rotation
        xTo.current(0);
        yTo.current(0);

        if (containerRef.current) {
            gsap.to(containerRef.current, { scale: 1, duration: 0.5, ease: "power3.out" });
        }
        if (sheenRef.current) {
            gsap.to(sheenRef.current, { opacity: 0, duration: 0.5 });
        }
    };


    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative h-full w-full"
            style={{ perspective: '1000px' }}
        >
            {/* Animated Container */}
            <div
                ref={containerRef}
                className={`
            group relative flex flex-col h-full rounded-[2rem] p-4
            bg-white/[0.15] backdrop-blur-xl border border-white/[0.18]
            shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
            will-change-transform cursor-default
        `}
            >
                {/* Sheen / Glare Effect */}
                <div
                    className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none z-0"
                    style={{ maskImage: 'linear-gradient(to bottom, white, white)' }}
                >
                    <div
                        ref={sheenRef}
                        className="absolute inset-0 w-[200%] h-[200%] top-[-50%] left-[-50%] opacity-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.8)_0%,_rgba(255,255,255,0)_60%)] mix-blend-overlay"
                    />
                </div>

                {/* Image Container */}
                <div className="relative h-[65%] w-full overflow-hidden rounded-[1.5rem] bg-white/50 z-20 translate-z-20">
                    <img
                        src={project.imagePath}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Icon */}
                    <div
                        className="absolute top-4 left-4 h-12 w-12 rounded-2xl bg-white shadow-lg flex items-center justify-center pointer-events-none"
                        style={{ transformStyle: 'preserve-3d', transform: 'translateZ(30px)' }}
                    >
                        <span className={`material-symbols-rounded text-2xl ${project.color}`}>
                            {project.icon}
                        </span>
                    </div>

                    {/* Action Buttons Overlay */}
                    {showActions && (
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-30 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center gap-3 pb-6">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                                className="px-4 py-2 bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2 transform hover:scale-105"
                            >
                                <span className="material-symbols-rounded text-sm">edit</span>
                                Edit
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                                className="px-4 py-2 bg-red-600/90 hover:bg-red-500 backdrop-blur-md rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-red-500/50 transition-all flex items-center gap-2 transform hover:scale-105"
                            >
                                <span className="material-symbols-rounded text-sm">delete</span>
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Text Container */}
                <div ref={contentRef} className="flex-1 pt-4 flex flex-col justify-between z-20 translate-z-10">
                    <div>
                        <h3 className="text-xl font-black text-[var(--theme-title)] leading-tight mb-2 tracking-tight drop-shadow-sm">
                            {project.title}
                        </h3>
                        <p className="text-sm font-medium text-[var(--theme-text)] line-clamp-2 leading-relaxed opacity-90">
                            {project.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 relative z-30">
                        <div className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-black/30 border border-white/20 text-white backdrop-blur-md">
                            {project.category}
                        </div>
                        {project.tags?.map((tag, i) => (
                            <div key={i} className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 backdrop-blur-md">
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTiltCard;
