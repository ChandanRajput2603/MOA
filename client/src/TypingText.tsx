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
    let started = false;
    let timer: number | undefined;
    setCount(0);
    const observer = new IntersectionObserver(entries => {
      if (started || stopped || !entries.some(e => e.isIntersecting)) return;
      started = true;
      observer.disconnect();
      let next = 0;
      const tick = () => {
        if (stopped) return;
        next += 1;
        setCount(next);
        if (next < text.length) timer = window.setTimeout(tick, 65);
      };
      timer = window.setTimeout(tick, delay);
    }, { threshold: 0.15 });
    observer.observe(element);
    const showAll = () => {
      if (!reduced()) return;
      stopped = true;
      window.clearTimeout(timer);
      observer.disconnect();
      setCount(text.length);
    };
    const preferences = new MutationObserver(showAll);
    preferences.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    media.addEventListener("change", showAll);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      observer.disconnect();
      preferences.disconnect();
      media.removeEventListener("change", showAll);
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
