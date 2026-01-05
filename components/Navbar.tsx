import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: '工作', id: 'work' },
    { label: '生活', id: 'life' },
    { label: '学习', id: 'learning' },
    { label: 'IT & 成长', id: 'it' },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center pointer-events-none px-4">
      <nav
        className={`pointer-events-auto transition-all duration-300 ease-out flex items-center ${
          scrolled
            ? 'px-3 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-fresh-cyan/10 rounded-full scale-100'
            : 'px-8 py-4 bg-white/90 backdrop-blur-md border border-white/50 shadow-2xl shadow-fresh-cyan/10 rounded-full scale-105'
        }`}
      >
        <div className="flex items-center gap-1 md:gap-8">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer pr-4 md:pr-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-md">
              <span className="material-symbols-rounded text-xl">grain</span>
            </div>
            <span className={`font-display font-black tracking-tight text-slate-900 hidden md:block ${scrolled ? 'text-lg' : 'text-xl'}`}>
              Inspired<span className="text-fresh-teal">Joy</span>
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          {/* Links */}
          <div className="flex items-center">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="relative px-3 md:px-5 py-2 text-sm md:text-base font-bold text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
              >
                {link.label}
                <span className="absolute bottom-1.5 left-1/2 w-1 h-1 bg-fresh-teal rounded-full -translate-x-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
              </button>
            ))}
          </div>
          
           <div className="md:hidden ml-2">
             <button className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-900">
               <span className="material-symbols-rounded">menu</span>
             </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;