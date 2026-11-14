"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Site-wide GSAP choreography. Elements opt in with data attributes:
 *  data-hero       hero timeline pieces (in DOM order)
 *  data-reveal     fades up when scrolled into view (batched + staggered)
 *  data-float      slow idle float
 *  data-illus      illustration: its [data-step] children draw in sequence
 */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const hero = gsap.utils.toArray<HTMLElement>("[data-hero]");
      if (hero.length) {
        gsap.from(hero, { y: 34, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 });
      }
      gsap.utils.toArray<HTMLElement>("[data-float]").forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 12 : -12, duration: 3 + (i % 3), ease: "sine.inOut", repeat: -1, yoyo: true });
      });
      gsap.set("[data-reveal]", { opacity: 0, y: 28 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 92%",
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07, overwrite: true }),
      });
      gsap.utils.toArray<HTMLElement>("[data-illus]").forEach((el) => {
        const steps = el.querySelectorAll("[data-step]");
        gsap.from(steps, {
          opacity: 0,
          scale: 0.86,
          y: 14,
          transformOrigin: "50% 50%",
          duration: 0.6,
          ease: "back.out(1.6)",
          stagger: 0.16,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
          onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString("en-US")),
        });
      });
    });
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
