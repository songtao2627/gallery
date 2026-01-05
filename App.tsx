import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TiltCard from './components/TiltCard';
import { PROJECTS } from './constants';
import { Category } from './types';

const SectionHeader: React.FC<{ 
  title: string; 
  subtitle: string; 
  gradient: string;
}> = ({ title, subtitle, gradient }) => (
  <div className="flex flex-col items-center mb-16 text-center relative">
    <span className="text-sm font-extrabold uppercase tracking-[0.3em] mb-3 text-slate-400">
      {subtitle}
    </span>
    <h2 className={`font-display text-5xl md:text-6xl font-black text-transparent bg-clip-text ${gradient} drop-shadow-sm pb-2`}>
      {title}
    </h2>
    <div className="w-16 h-1 bg-slate-100 rounded-full mt-4"></div>
  </div>
);

const App: React.FC = () => {
  const getProjects = (cat: Category) => PROJECTS.filter(p => p.category === cat);
  
  // Triple the list to ensure smooth infinite scrolling even on ultra-wide monitors
  const railProjects = [...PROJECTS, ...PROJECTS, ...PROJECTS];

  return (
    <div className="min-h-screen w-full font-body relative overflow-x-hidden selection:bg-fresh-lime selection:text-slate-900 bg-slate-50">
      
      {/* Ribbons - Pushed to edges/bottom as requested */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         {/* Cyan - Top Left (Behind Navbar) */}
         <div className="ribbon-shape bg-fresh-cyan w-[60vw] h-[60vw] top-[-30%] left-[-10%] animate-liquid" style={{animationDuration: '25s'}}></div>
         {/* Lemon - Bottom Right */}
         <div className="ribbon-shape bg-fresh-lemon w-[50vw] h-[50vw] bottom-[-20%] right-[-10%] animate-liquid" style={{animationDuration: '30s', animationDelay: '-5s'}}></div>
         {/* Lime - Bottom Left */}
         <div className="ribbon-shape bg-fresh-lime w-[55vw] h-[55vw] bottom-[-10%] left-[-20%] animate-liquid" style={{animationDuration: '35s', animationDelay: '-12s'}}></div>
      </div>

      <Navbar />

      {/* IMMERSIVE GALLERY RAIL (New Hero) */}
      <section className="relative pt-32 pb-12 z-10 w-full overflow-hidden">
         <div className="px-6 md:px-12 mb-8 flex items-end justify-between">
            <h1 className="font-display font-black text-4xl text-slate-900 leading-tight">
               Latest <span className="text-fresh-teal">Artworks</span>
            </h1>
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest">
               <span className="w-8 h-[2px] bg-fresh-lime"></span>
               <span>Live Gallery</span>
            </div>
         </div>

         {/* Infinite Scrolling Rail */}
         <div className="w-full">
            <div 
              className="flex gap-8 w-max animate-scroll-left hover:[animation-play-state:paused] py-4 px-4"
              style={{ animationDuration: '60s' }}
            >
               {railProjects.map((p, i) => (
                 <div 
                   key={`${p.id}-${i}`} 
                   className="relative w-[300px] sm:w-[400px] aspect-[16/10] flex-shrink-0 rounded-2xl shadow-lg shadow-slate-200/60 bg-white overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-fresh-cyan/20 cursor-pointer group"
                 >
                    <img 
                      src={p.imagePath} 
                      alt={p.title} 
                      className="w-full h-full object-cover" 
                    />
                    {/* Glass Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                       <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur text-white border border-white/20 mb-2`}>
                          {p.category}
                       </span>
                       <h3 className="text-white font-display font-bold text-lg">{p.title}</h3>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <main className="relative z-10 px-4 md:px-8 pb-32 space-y-24 max-w-8xl mx-auto mt-12">
        
        {/* Work Section */}
        <section id="work" className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader 
              title="工作" 
              subtitle="Efficiency / 高效" 
              gradient="bg-gradient-to-r from-fresh-teal to-fresh-cyan"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-[450px]">
              {getProjects('Work').map((project, i) => (
                <div key={project.id} className={`${i % 2 === 0 ? 'lg:translate-y-12' : ''} transition-transform duration-500`}>
                  <TiltCard project={project} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Life Section */}
        <section id="life" className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader 
              title="生活" 
              subtitle="Lifestyle / 方式" 
              gradient="bg-gradient-to-r from-fresh-lime to-emerald-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[400px]">
               <div className="md:col-span-2 md:row-span-2 min-h-[500px]">
                  {getProjects('Life')[0] && <TiltCard project={getProjects('Life')[0]} />}
               </div>
               {getProjects('Life').slice(1).map(p => (
                 <div key={p.id}>
                   <TiltCard project={p} />
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Learning Section */}
        <section id="learning" className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader 
              title="学习" 
              subtitle="Knowledge / 知识" 
              gradient="bg-gradient-to-r from-fresh-teal to-blue-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[400px]">
              {getProjects('Learning').map((project) => (
                <TiltCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

        {/* IT Section */}
        <section id="it" className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader 
              title="IT & 成长" 
              subtitle="Growth / 成长" 
              gradient="bg-gradient-to-r from-fresh-lemon to-orange-400"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[420px]">
              {getProjects('IT').map((project) => (
                <TiltCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default App;
