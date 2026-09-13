import React, { useEffect, useRef, useState } from 'react';

export function HomeMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let seen = true;
    try { seen = sessionStorage.getItem('moa-intro-seen') === '1'; sessionStorage.setItem('moa-intro-seen', '1'); } catch { /* Storage may be unavailable. */ }
    if (!seen && !reduced.matches) setIntro(true);
    const timer = window.setTimeout(() => setIntro(false), 1500);
    const nodes = root.current?.querySelectorAll('.public-stats, .section-head, .public-grid, .notice-banner, .hero-side');
    let observer: IntersectionObserver | undefined;
    if (!reduced.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('home-visible'); observer?.unobserve(entry.target); }
      }), { threshold: 0.08 });
      nodes?.forEach(node => { node.classList.add('home-reveal'); observer!.observe(node); });
    }
    const reveal = () => { if (reduced.matches) { setIntro(false); nodes?.forEach(n => n.classList.add('home-visible')); } };
    reduced.addEventListener('change', reveal);
    return () => { clearTimeout(timer); observer?.disconnect(); reduced.removeEventListener('change', reveal); };
  }, []);
  return <div ref={root} className="home-experience">
    {intro && <div className="home-intro" aria-hidden="true"><img src="/MOALOGO.webp" alt="" /><span>THE SPIRIT OF MAHARASHTRA</span></div>}
    {children}
  </div>;
}
