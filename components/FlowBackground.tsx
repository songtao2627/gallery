import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    p5: any;
  }
}

const FlowBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<any>(null);

  useEffect(() => {
    // Dynamic Script Loader for P5.js
    const loadP5 = () => {
      return new Promise((resolve, reject) => {
        if (window.p5) {
          resolve(window.p5);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js';
        script.async = true;
        script.onload = () => resolve(window.p5);
        script.onerror = () => reject(new Error('Failed to load p5.js'));
        document.body.appendChild(script);
      });
    };

    const initSketch = async () => {
      try {
        await loadP5();
        
        const sketch = (p: any) => {
          let particles: Particle[] = [];
          const numParticles = 800; // Dense particle count for rich ribbons
          const noiseScale = 0.003; // Low scale for long, smooth curves
          let zoff = 0; // Time dimension

          // High Contrast Dopamine Palette (HSB)
          // Cyan (180), Lime (120), Yellow (55), Magenta (300)
          const palette = [180, 120, 55, 300]; 

          p.setup = () => {
             const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
             canvas.parent(containerRef.current!);
             p.colorMode(p.HSB, 360, 100, 100, 100);
             p.background(0, 0, 100); // Pure White Background
             
             for (let i = 0; i < numParticles; i++) {
               particles.push(new Particle(p));
             }
          };

          p.draw = () => {
             // "Ghosting" Effect:
             // Draw a semi-transparent white rectangle over the previous frame.
             // This creates the trail effect where old lines fade out slowly.
             p.noStroke();
             p.fill(0, 0, 100, 12); // 12% opacity white
             p.rect(0, 0, p.width, p.height);

             for (let particle of particles) {
               particle.follow(noiseScale, zoff);
               particle.update();
               particle.edges();
               particle.show();
             }

             // Evolve the noise field over time (The "Wind" speed)
             zoff += 0.005; 
          };
          
          p.windowResized = () => {
             p.resizeCanvas(p.windowWidth, p.windowHeight);
             p.background(0, 0, 100);
          };

          class Particle {
             p: any;
             pos: any;
             vel: any;
             acc: any;
             maxSpeed: number;
             prevPos: any;
             hue: number;

             constructor(p: any) {
               this.p = p;
               this.pos = p.createVector(p.random(p.width), p.random(p.height));
               this.vel = p.createVector(0, 0);
               this.acc = p.createVector(0, 0);
               this.maxSpeed = p.random(3, 5); // Fast movement for dynamic energy
               this.prevPos = this.pos.copy();
               
               // Randomly assign a color from the palette
               this.hue = p.random(palette);
             }

             follow(scale: number, z: number) {
               // Calculate angle from Perlin Noise
               const angle = this.p.noise(this.pos.x * scale, this.pos.y * scale, z) * this.p.TWO_PI * 2;
               
               // Create vector from angle
               const v = this.p.createVector(Math.cos(angle), Math.sin(angle));
               
               // BIAS VECTOR: "Wind lifting a waterfall"
               // Add a constant force pointing Down-Right to guide the flow
               const windBias = this.p.createVector(0.8, 0.4); 
               v.add(windBias);
               
               v.setMag(1);
               this.acc.add(v);
             }

             update() {
               this.vel.add(this.acc);
               this.vel.limit(this.maxSpeed);
               this.pos.add(this.vel);
               this.acc.mult(0);
             }

             edges() {
               let wrapped = false;
               if (this.pos.x > this.p.width) { this.pos.x = 0; wrapped = true; }
               if (this.pos.x < 0) { this.pos.x = this.p.width; wrapped = true; }
               if (this.pos.y > this.p.height) { this.pos.y = 0; wrapped = true; }
               if (this.pos.y < 0) { this.pos.y = this.p.height; wrapped = true; }
               
               if (wrapped) {
                 this.prevPos.set(this.pos);
               }
             }

             show() {
               // High Saturation (85-100), High Brightness (90-100)
               this.p.stroke(this.hue, 90, 95, 80); 
               this.p.strokeWeight(1.5); // Sharp, thin lines
               this.p.line(this.prevPos.x, this.prevPos.y, this.pos.x, this.pos.y);
               this.updatePrev();
             }

             updatePrev() {
               this.prevPos.x = this.pos.x;
               this.prevPos.y = this.pos.y;
             }
          }
        };

        p5Ref.current = new window.p5(sketch);
      } catch (e) {
        console.error("P5 init error", e);
      }
    };

    initSketch();

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
      }
    };
  }, []);

  return (
    <div 
       ref={containerRef} 
       className="fixed inset-0 pointer-events-none" 
       style={{ zIndex: 0 }} 
    />
  );
};

export default FlowBackground;