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
    { label: '工作', id: 'work', icon: 'domain' },
    { label: '生活', id: 'life', icon: 'local_florist' },
    { label: '学习', id: 'learning', icon: 'auto_stories' },
    { label: 'IT & 提升', id: 'it', icon: 'terminal' },
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
        className={`pointer-events-auto transition-all duration-300 ease-out flex items-center ${scrolled
          ? 'px-3 py-2 bg-white/[0.15] backdrop-blur-xl border border-white/[0.18] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-full scale-100'
          : 'px-8 py-4 bg-white/[0.15] backdrop-blur-md border border-white/[0.18] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-full scale-105'
          }`}
      >
        <div className="flex items-center gap-1 md:gap-8">
          {/* Logo */}
          <div
            className="group flex items-center gap-2 cursor-pointer pr-4 md:pr-0"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-fresh-teal/50">
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out skew-x-[-20deg] z-10"></div>

              <span className="material-symbols-rounded text-xl relative z-20 group-hover:text-fresh-cyan transition-colors duration-300">grain</span>
            </div>
            <span className={`font-display font-black tracking-tight text-slate-900 hidden md:block ${scrolled ? 'text-lg' : 'text-xl'} transition-all duration-300`}>
              inspire<span className="text-fresh-teal group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-fresh-teal group-hover:to-fresh-lime transition-all duration-300">Joy</span>
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
                className="group relative px-4 py-2 rounded-full hover:bg-white/40 transition-all duration-300 flex items-center gap-1.5 overflow-hidden"
              >
                {/* Sweep Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out skew-x-[-20deg] z-0"></div>

                <span className="material-symbols-rounded text-lg text-slate-400 group-hover:text-fresh-teal transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 transform relative z-10">{link.icon}</span>
                <span className="text-sm md:text-base font-bold text-slate-600 group-hover:text-slate-900 transition-colors duration-200 relative z-10">
                  {link.label}
                </span>

                {/* Glow Dot Indicator */}
                <span className="absolute bottom-1.5 left-1/2 w-1.5 h-1.5 bg-fresh-teal rounded-full -translate-x-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(20,184,166,0.6)] relative z-10"></span>
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