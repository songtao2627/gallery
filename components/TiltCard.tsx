import React, { useRef, useState, MouseEvent } from 'react';
import { Project } from '../types';

interface TiltCardProps {
  project: Project;
}

const TiltCard: React.FC<TiltCardProps> = ({ project }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -2; // Reduced rotation for cleaner feel
    const rotateY = ((x - centerX) / centerX) * 2;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const style = {
    transform: isHovering
      ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.02)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: isHovering ? 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.5s ease-out',
  };

  return (
    <a
      href={project.projectPath}
      className="block h-full outline-none"
      target="_self"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={style}
        className={`
          group relative flex flex-col h-full rounded-[2rem] p-4
          bg-white/40 backdrop-blur-xl border border-white/60
          shadow-lg shadow-slate-200/50 
          transition-all duration-300
          hover:shadow-fresh-cyan/50 hover:shadow-2xl hover:-translate-y-2
          hover:bg-white/60
        `}
      >
        {/* Image Container - 75% Height */}
        <div className="relative h-[75%] w-full overflow-hidden rounded-[1.5rem] bg-white/50">
          <img
            src={project.imagePath}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Floating Icon - White Glass */}
          <div className="absolute top-4 left-4 h-12 w-12 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <span className={`material-symbols-rounded text-2xl ${project.color}`}>
              {project.icon}
            </span>
          </div>

          {/* "View" Button Pill - appears on hover */}
          <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
             <div className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-full shadow-lg flex items-center gap-2 text-sm">
               <span>访问</span>
               <span className="material-symbols-rounded text-sm">arrow_outward</span>
             </div>
          </div>
        </div>

        {/* Text Container */}
        <div className="flex-1 pt-5 flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-extrabold text-slate-800 leading-tight mb-2 tracking-tight group-hover:text-fresh-teal transition-colors drop-shadow-sm">{project.title}</h3>
              <p className="text-sm font-bold text-slate-600 line-clamp-2 leading-relaxed">{project.description}</p>
           </div>
           
           <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-white/60 border border-slate-200 text-slate-600 group-hover:border-fresh-cyan/30 group-hover:text-fresh-teal transition-colors">
                  {tag}
                </span>
              ))}
           </div>
        </div>
      </div>
    </a>
  );
};

export default TiltCard;
