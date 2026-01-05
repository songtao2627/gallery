import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TiltCard from './components/TiltCard';
import RibbonBackground from './components/RibbonBackground';
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
    <div className="w-16 h-1 bg-slate-300 rounded-full mt-4"></div>
  </div>
);

const App: React.FC = () => {
  const getProjects = (cat: Category) => PROJECTS.filter(p => p.category === cat);

  // Quadruple the list to ensure seamless infinite scrolling loop
  const railProjects = [...PROJECTS, ...PROJECTS, ...PROJECTS, ...PROJECTS];

  return (
    <div className="min-h-screen w-full font-body relative overflow-x-hidden selection:bg-pink-500 selection:text-white bg-transparent">

      {/* BACKGROUND LAYER (z-0) */}
      <RibbonBackground />

      {/* NAVBAR (z-50) */}
      <Navbar />

      {/* HERO SECTION (z-10) */}
      <section className="relative pt-32 pb-4 z-10 w-full overflow-hidden mb-12">
        {/* Minimal Header for the Rail */}
        <div className="px-6 md:px-12 mb-6 flex items-end justify-between relative z-10">
          <h1 className="font-display font-black text-4xl text-slate-900 leading-tight drop-shadow-sm">
            Selected <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">Works</span>
          </h1>
          <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-widest">
            <span className="w-8 h-[3px] bg-pink-500"></span>
            <span>Live Gallery</span>
          </div>
        </div>

        {/* Infinite Scrolling Rail Container */}
        <div className="w-full relative z-10">
          <div
            className="flex gap-6 w-max animate-scroll-left hover:[animation-play-state:paused] py-4 px-4"
          >
            {railProjects.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="relative w-[320px] sm:w-[420px] aspect-[16/10] flex-shrink-0 rounded-xl shadow-lg shadow-slate-300/60 bg-white border border-white/50 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/30 cursor-pointer group"
              >
                <img
                  src={p.imagePath}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Glass Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-900`}>
                      {p.category}
                    </span>
                  </div>
                  <h3 className="text-white font-display font-bold text-xl">{p.title}</h3>
                  <p className="text-slate-300 text-xs mt-1 line-clamp-1">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT (z-10) */}
      <main className="relative z-10 px-4 md:px-8 pb-32 space-y-32 max-w-8xl mx-auto">

        {/* Work Section */}
        <section id="work" className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              title="工作"
              subtitle="Efficiency / 高效"
              gradient="bg-gradient-to-r from-blue-600 to-cyan-500"
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
              gradient="bg-gradient-to-r from-lime-600 to-green-600"
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
              gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
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
              gradient="bg-gradient-to-r from-orange-500 to-amber-500"
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