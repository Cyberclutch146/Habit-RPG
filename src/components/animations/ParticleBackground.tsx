import React, { useRef, useEffect } from 'react';
import { useUserStore } from '../../store/useUserStore';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useUserStore(state => state.user?.reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    const numberOfParticles = window.innerWidth > 768 ? 80 : 40; // Scale nodes by device

    // Resize handler
    const resizeHandler = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resizeHandler);
    resizeHandler();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.size = Math.random() * 2 + 0.2;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (canvas && (this.x < 0 || this.x > canvas.width)) this.speedX = -this.speedX;
        if (canvas && (this.y < 0 || this.y > canvas.height)) this.speedY = -this.speedY;
      }
      
      draw() {
        if(!ctx) return;
        // Primary brand reference via hardcode (can be retrieved from CSS vars if preferred)
        ctx.fillStyle = 'rgba(255, 60, 60, 0.4)'; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    const connect = () => {
       for (let a = 0; a < particlesArray.length; a++) {
           for (let b = a; b < particlesArray.length; b++) {
               const dx = particlesArray[a].x - particlesArray[b].x;
               const dy = particlesArray[a].y - particlesArray[b].y;
               const distance = Math.sqrt(dx * dx + dy * dy);
               if (distance < 100) {
                   ctx.strokeStyle = `rgba(255, 60, 60, ${0.1 - distance/1000})`;
                   ctx.lineWidth = 1;
                   ctx.beginPath();
                   ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                   ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                   ctx.stroke();
               }
           }
       }
    }

    let animationFrameId: number;
    const animate = () => {
      if (canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeHandler);
    }
  }, [reducedMotion]);

  if (reducedMotion) return <div className="absolute inset-0 bg-background z-[-1]" />;

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-[-1]"
    />
  );
};
