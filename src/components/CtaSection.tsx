"use client";

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Star, ArrowRight } from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CtaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaButtonRef = useRef<HTMLDivElement>(null);
  const particle1Ref = useRef<HTMLDivElement>(null);
  const particle2Ref = useRef<HTMLDivElement>(null);
  const particle3Ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create timeline for CTA animations
    const ctaTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none none"
      }
    });
    
    // Title animation with reveal effect
    if (titleRef.current) {
      // Split text by lines
      const lines = titleRef.current.innerHTML.split('<br>');
      titleRef.current.innerHTML = '';
      
      lines.forEach((line, i) => {
        const lineContainer = document.createElement('div');
        lineContainer.style.overflow = 'hidden';
        lineContainer.style.display = 'block';
        
        const lineSpan = document.createElement('div');
        lineSpan.innerHTML = line;
        lineSpan.style.display = 'inline-block';
        lineSpan.style.transform = 'translateY(100%)';
        
        lineContainer.appendChild(lineSpan);
        titleRef.current?.appendChild(lineContainer);
        
        ctaTl.to(lineSpan, {
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: i * 0.15
        });
      });
    }
    
    // Description fade in
    ctaTl.fromTo(
      descriptionRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    );
    
    // Button animation with scale effect
    ctaTl.fromTo(
      ctaButtonRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.3"
    );
    
    // Create particle animations
    const particles = [particle1Ref.current, particle2Ref.current, particle3Ref.current].filter(Boolean);
    
    // Generate random paths for particles
    particles.forEach((particle, i) => {
      if (!particle) return;
      
      // Initial position and scale
      gsap.set(particle, { 
        opacity: 0,
        scale: 0.5,
        x: 0,
        y: 0
      });
      
      // Fade in with delay
      ctaTl.to(particle, {
        opacity: 0.8,
        scale: 1,
        duration: 0.6,
        delay: i * 0.2,
        ease: "power2.out"
      }, "-=0.2");
      
      // Create random path points
      const path = [
        { x: 0, y: 0 },
        { x: gsap.utils.random(-30, 30), y: gsap.utils.random(-30, 30) },
        { x: gsap.utils.random(-60, 60), y: gsap.utils.random(-20, 20) },
        { x: gsap.utils.random(-20, 20), y: gsap.utils.random(-40, 40) },
        { x: 0, y: 0 }
      ];
      
      // Animate along path
      gsap.to(particle, {
        motionPath: {
          path: path,
          autoRotate: true,
          curviness: 1.5
        },
        duration: 15 + i * 5,
        ease: "none",
        repeat: -1
      });
      
      // Subtle rotation
      gsap.to(particle, {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1
      });
    });
    
    // Button hover animation
    if (ctaButtonRef.current) {
      const btn = ctaButtonRef.current.querySelector('a');
      if (btn) {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { 
            scale: 1.05, 
            duration: 0.3,
            ease: "power2.out"
          });
          
          // Increase particle activity
          gsap.to(particles, { 
            scale: 1.2, 
            opacity: 1,
            duration: 0.3,
            stagger: 0.1,
            ease: "power2.out"
          });
        });
        
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { 
            scale: 1, 
            duration: 0.3,
            ease: "power2.out"
          });
          
          gsap.to(particles, { 
            scale: 1, 
            opacity: 0.8,
            duration: 0.3,
            stagger: 0.1,
            ease: "power2.out"
          });
        });
      }
    }
    
    return () => {
      if (ctaButtonRef.current) {
        const btn = ctaButtonRef.current.querySelector('a');
        if (btn) {
          btn.removeEventListener('mouseenter', () => {});
          btn.removeEventListener('mouseleave', () => {});
        }
      }
    };
  }, []);
  
  return (
    <div 
      ref={sectionRef}
      className="py-20 lg:py-32 relative overflow-hidden bg-gradient-mesh"
    >
      {/* Background and decorations */}
      <div className="noise-overlay"></div>
      <div className="dots-pattern"></div>
      
      {/* Animated particles */}
      <div 
        ref={particle1Ref}
        className="absolute top-1/4 right-[15%] z-10"
      >
        <div className="p-2 bg-primary/10 rounded-2xl accent-glow">
          <Sparkles className="h-6 w-6 md:h-10 md:w-10 text-primary" />
        </div>
      </div>
      <div 
        ref={particle2Ref}
        className="absolute bottom-1/3 left-[20%] z-10"
      >
        <div className="p-2 bg-primary/10 rounded-2xl accent-glow">
          <Star className="h-8 w-8 md:h-12 md:w-12 text-primary/70" />
        </div>
      </div>
      <div 
        ref={particle3Ref}
        className="absolute top-2/3 right-[25%] z-10"
      >
        <div className="p-2 bg-primary/10 rounded-2xl accent-glow">
          <Sparkles className="h-4 w-4 md:h-8 md:w-8 text-primary/50" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-glow"
          >
            Ready to Transform<br />Your Medical Practice?
          </h2>
          
          <p 
            ref={descriptionRef}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Join thousands of healthcare professionals who are already 
            streamlining their workflows and delivering better patient care.
          </p>
          
          <div ref={ctaButtonRef} className="inline-block">
            <Button asChild size="lg" className="px-8 py-7 text-lg gap-2 button-neo">
              <Link href="/auth">
                Get Started Today
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 