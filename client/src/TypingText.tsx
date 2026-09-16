import React, { useEffect, useRef, useState } from "react";

/** Reveal characters without changing the heading's final dimensions. */
export default function TypingText({ text, delay = 300 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(text.length);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = () => media.matches || document.documentElement.dataset.motion === "reduced";
    if (reduced() || !("IntersectionObserver" in window)) { setCount(text.length); return; }
    let stopped = false;
    let visible = false;
    let timer: number | undefined;
    let next = 0;
    const clear = () => window.clearTimeout(timer);
    const allowed = () => !stopped && visible && !document.hidden && !reduced();
    const tick = () => {
      if (!allowed()) return;
      next += 1;
      setCount(next);
      if (next < text.length) timer = window.setTimeout(tick, 65);
      else timer = window.setTimeout(() => {
        if (!allowed()) return;
        next = 0;
        setCount(0);
        timer = window.setTimeout(tick, 350);
      }, 3500);
    };
    const restart = () => {
      clear();
      if (!allowed()) { setCount(text.length); return; }
      next = 0;
      setCount(0);
      timer = window.setTimeout(tick, delay);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(e => e.isIntersecting);
      restart();
    }, { threshold: 0.15 });
    observer.observe(element);
    const preferences = new MutationObserver(restart);
    preferences.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    media.addEventListener("change", restart);
    document.addEventListener("visibilitychange", restart);
    return () => {
      stopped = true;
      clear();
      observer.disconnect();
      preferences.disconnect();
      media.removeEventListener("change", restart);
      document.removeEventListener("visibilitychange", restart);
    };
  }, [text, delay]);
  let offset = 0;
  return <em ref={ref} className="ch-typing">
    <span className="ch-typing-readable">{text}</span>
    <span aria-hidden="true">{text.split(/(\s+)/).map((part, index) => {
      const start = offset; offset += part.length;
      if (/^\s+$/.test(part)) return <React.Fragment key={index}>{part}</React.Fragment>;
      return <span className="ch-typing-word" key={index}>{Array.from(part).map((character, i) =>
        <span className={start + i < count ? "ch-typing-char" : "ch-typing-char ch-typing-hidden"} key={i}>{character}</span>
      )}</span>;
    })}</span>
  </em>;
}
