"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  value,
  locale = "es-PE",
}: {
  value: number;
  locale?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || value <= 0) {
      const frame = requestAnimationFrame(() => setCount(value));
      return () => cancelAnimationFrame(frame);
    }

    let frame = 0;
    let startTime = 0;
    const duration = 850;

    const run = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          frame = requestAnimationFrame(run);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{count.toLocaleString(locale)}</span>;
}
