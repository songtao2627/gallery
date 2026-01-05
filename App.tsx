import React, { useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TiltCard from './components/TiltCard';
import RibbonBackground from './components/RibbonBackground';
import { PROJECTS } from './constants';
import { Category } from './types';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable);

/* 
  Helper function for horizontal loop (infinite scroll)
  Source: https://gsap.com/docs/v3/HelperFunctions#helpers
*/
function horizontalLoop(items: HTMLElement[], config: any) {
  items = gsap.utils.toArray(items);
  config = config || {};
  let tl = gsap.timeline({ repeat: config.repeat, paused: config.paused, defaults: { ease: "none" }, onReverseComplete: () => { tl.totalTime(tl.rawTime() + tl.duration() * 100); } }),
    length = items.length,
    startX = items[0].offsetLeft,
    times: number[] = [],
    widths: number[] = [],
    xPercents: number[] = [],
    curIndex = 0,
    pixelsPerSecond = (config.speed || 1) * 100,
    snap = config.snap === false ? (v: number) => v : gsap.utils.snap(config.snap || 1),
    totalWidth: number,
    curX: number,
    distanceToStart: number,
    distanceToLoop: number,
    item: HTMLElement,
    i: number;

  gsap.set(items, { // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
    xPercent: (i, el) => {
      let w = widths[i] = parseFloat(gsap.getProperty(el, "width", "px") as string);
      xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px") as string) / w * 100 + gsap.getProperty(el, "xPercent") as number);
      return xPercents[i];
    }
  });
  gsap.set(items, { x: 0 });
  totalWidth = items[length - 1].offsetLeft + xPercents[length - 1] / 100 * widths[length - 1] - startX + items[length - 1].offsetWidth * parseFloat(gsap.getProperty(items[length - 1], "scaleX") as string) + (parseFloat(config.paddingRight) || 0);
  for (i = 0; i < length; i++) {
    item = items[i];
    curX = xPercents[i] / 100 * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop = distanceToStart + widths[i] * parseFloat(gsap.getProperty(item, "scaleX") as string);
    tl.to(item, { xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
      .fromTo(item, { xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100) }, { xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - distanceToStart) / pixelsPerSecond, immediateRender: false }, distanceToLoop / pixelsPerSecond)
      .add("label" + i, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }

  function toIndex(index: number, vars: any) {
    vars = vars || {};
    (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); // always go in the shortest direction
    let newIndex = gsap.utils.wrap(0, length, index),
      time = times[newIndex];
    if (time > tl.time() !== index > curIndex) { // if we're wrapping the timeline's playhead, make the proper adjustments
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next = (vars: any) => toIndex(curIndex + 1, vars);
  tl.previous = (vars: any) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index: number, vars: any) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true); // pre-render for performance
  if (config.reversed) {
    (tl.vars as any).onReverseComplete();
    tl.reverse();
  }
  return tl;
}

const SectionHeader: React.FC<{
  title: string;
  subtitle: string;
  gradient: string;
}> = ({ title, subtitle, gradient }) => (
  <div className="flex flex-col items-center mb-16 text-center relative section-header opacity-0 translate-y-8">
    <span className="text-xs font-extrabold uppercase tracking-[0.4em] mb-3 text-slate-400">
      {subtitle}
    </span>
    <h2 className={`font-display text-5xl md:text-7xl font-black text-transparent bg-clip-text ${gradient} drop-shadow-sm pb-2 tracking-tighter`}>
      {title}
    </h2>
    <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-4"></div>
  </div>
);

const App: React.FC = () => {
  const getProjects = (cat: Category) => PROJECTS.filter(p => p.category === cat);
  const railRef = useRef<HTMLDivElement>(null);
  const workRef = useRef<HTMLDivElement>(null);
  const lifeRef = useRef<HTMLDivElement>(null);
  const learningRef = useRef<HTMLDivElement>(null);
  const itRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Quadruple the list to ensure seamless infinite scrolling loop
  const railProjects = [...PROJECTS, ...PROJECTS, ...PROJECTS, ...PROJECTS];

  // GSAP Animations
  useGSAP(() => {
    // 1. Horizontal Loop for Rail
    if (railRef.current) {
      const boxes = gsap.utils.toArray('.rail-item');
      const loop = horizontalLoop(boxes as HTMLElement[], {
        speed: 1, // pixels per second (x100)
        repeat: -1,
        paddingRight: 24 // match gap-6 (24px)
      });

      // Hover to pause/slow
      railRef.current.addEventListener("mouseenter", () => gsap.to(loop, { timeScale: 0.1, duration: 0.5 }));
      railRef.current.addEventListener("mouseleave", () => gsap.to(loop, { timeScale: 1, duration: 0.5 }));
    }

    // 2. Section Stagger Animations
    const sections = [workRef, lifeRef, learningRef, itRef];

    sections.forEach(ref => {
      if (!ref.current) return;

      // Header Animation
      const header = ref.current.querySelector('.section-header');
      if (header) {
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top 80%",
          onEnter: () => gsap.to(header, { opacity: 1, y: 0, duration: 1, ease: "power3.out" })
        });
      }

      // Cards Animation
      const cards = gsap.utils.toArray(ref.current.querySelectorAll('.tilt-card-wrapper'));
      if (cards.length > 0) {
        ScrollTrigger.batch(cards as Element[], {
          start: "top 85%",
          onEnter: batch => gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: "back.out(1.2)",
            overwrite: true
          }),
          onLeaveBack: batch => gsap.to(batch, {
            // opacity: 0, y: 50, duration: 0.5 // Optional: disappear when scrolling back up
          })
        });
      }
    });

  }, { scope: mainRef });

  return (
    <div ref={mainRef as any} className="min-h-screen w-full font-body relative overflow-x-hidden selection:bg-pink-500 selection:text-white bg-transparent">

      {/* BACKGROUND LAYER (z-0) */}
      <RibbonBackground />

      {/* NAVBAR (z-50) */}
      <Navbar />

      {/* HERO SECTION (z-10) */}
      <section className="relative pt-32 pb-4 z-10 w-full overflow-hidden mb-12">
        {/* Minimal Header for the Rail */}
        <div className="px-6 md:px-12 mb-6 flex items-end justify-between relative z-10">
          <h1 className="font-display font-black text-5xl md:text-6xl text-slate-900 leading-none drop-shadow-sm tracking-tighter">
            Selected <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400">Works</span>
          </h1>
          <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-[0.25em]">
            <span className="w-8 h-[2px] bg-pink-500"></span>
            <span>Live Gallery</span>
          </div>
        </div>

        {/* Infinite Scrolling Rail Container */}
        <div className="w-full relative z-10">
          <div
            ref={railRef}
            className="flex relative w-full h-[400px] overflow-hidden" // Changed to relative and overflow-hidden for GSAP
          >
            {railProjects.map((p, i) => (
              <div
                key={`${p.id}-${i}`}
                className="rail-item absolute top-0 left-0 w-[320px] sm:w-[420px] aspect-[16/10] flex-shrink-0 rounded-xl shadow-lg shadow-slate-300/60 bg-white border border-white/50 overflow-hidden transform cursor-pointer group"
                style={{ left: i * (420 + 24) }} // Initial simple positioning, GSAP takes over
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
        <section id="work" ref={workRef} className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              title="工作"
              subtitle="Efficiency / 高效"
              gradient="bg-gradient-to-r from-blue-600 to-cyan-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-[450px]">
              {getProjects('Work').map((project, i) => (
                <div key={project.id} className={`tilt-card-wrapper opacity-0 translate-y-8 ${i % 2 === 0 ? 'lg:translate-y-12' : ''} transition-transform duration-500`}>
                  <TiltCard project={project} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Life Section */}
        <section id="life" ref={lifeRef} className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              title="生活"
              subtitle="Lifestyle / 方式"
              gradient="bg-gradient-to-r from-lime-600 to-green-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[400px]">
              <div className="md:col-span-2 md:row-span-2 min-h-[500px] tilt-card-wrapper opacity-0 translate-y-8">
                {getProjects('Life')[0] && <TiltCard project={getProjects('Life')[0]} />}
              </div>
              {getProjects('Life').slice(1).map(p => (
                <div key={p.id} className="tilt-card-wrapper opacity-0 translate-y-8">
                  <TiltCard project={p} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Section */}
        <section id="learning" ref={learningRef} className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              title="学习"
              subtitle="Knowledge / 知识"
              gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[400px]">
              {getProjects('Learning').map((project) => (
                <div key={project.id} className="tilt-card-wrapper opacity-0 translate-y-8">
                  <TiltCard project={project} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IT Section */}
        <section id="it" ref={itRef} className="scroll-mt-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              title="IT & 成长"
              subtitle="Growth / 成长"
              gradient="bg-gradient-to-r from-orange-500 to-amber-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[420px]">
              {getProjects('IT').map((project) => (
                <div key={project.id} className="tilt-card-wrapper opacity-0 translate-y-8">
                  <TiltCard project={project} />
                </div>
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