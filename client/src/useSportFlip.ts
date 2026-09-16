import { useEffect, useRef, useState } from "react";

export function useSportFlip(selected: string) {
  const shown = useRef(selected);
  const [displayed, setDisplayed] = useState(selected);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = () => media.matches || document.documentElement.dataset.motion === "reduced";
    let swap: number | undefined;
    let finish: number | undefined;
    const settle = () => {
      clearTimeout(swap); clearTimeout(finish);
      shown.current = selected; setDisplayed(selected); setPhase("idle");
    };
    if (!selected || !shown.current || selected === shown.current || reduced()) {
      settle(); return;
    }
    setPhase("out");
    swap = window.setTimeout(() => {
      shown.current = selected; setDisplayed(selected); setPhase("in");
    }, 220);
    finish = window.setTimeout(() => setPhase("idle"), 520);
    const preferenceChanged = () => { if (reduced()) settle(); };
    media.addEventListener("change", preferenceChanged);
    const observer = new MutationObserver(preferenceChanged);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      clearTimeout(swap); clearTimeout(finish);
      media.removeEventListener("change", preferenceChanged); observer.disconnect();
    };
  }, [selected]);
  return { displayed, phase };
}
