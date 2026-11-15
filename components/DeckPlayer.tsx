"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Illustration, { hasIllustration } from "./Illustration";

export type Step = { do: string; ui?: string[]; note?: string };
export type Slide =
  | { type: "idea"; title: string; text: string; visual?: string }
  | { type: "steps"; title: string; steps: Step[] }
  | { type: "cards"; title: string; cards: { title: string; text: string }[] }
  | { type: "compare"; title: string; columns: [string, string]; rows: [string, string, string][] }
  | { type: "dosdonts"; title: string; do: string[]; dont: string[] }
  | { type: "quiz"; title: string; question: string; options: string[]; answer: number; why: string }
  | { type: "checklist"; title: string; items: string[] };
export type Deck = { slides: Slide[] };

const DONE_KEY = "ma_done";
export function readDone(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function markDone(id: string) {
  try {
    const set = new Set(readDone());
    set.add(id);
    localStorage.setItem(DONE_KEY, JSON.stringify([...set]));
  } catch {}
}

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const Cross = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

/* ---------- slide bodies ---------- */

function StepsSlide({ slide, active, setActive }: { slide: Extract<Slide, { type: "steps" }>; active: number; setActive: (n: number) => void }) {
  const step = slide.steps[active];
  const screen = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!screen.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".crumb", { opacity: 0, x: -18, duration: 0.4, stagger: 0.22, ease: "power2.out" });
      gsap.from(".step-do", { opacity: 0, y: 14, duration: 0.45, ease: "power2.out" });
      gsap.fromTo(".click-dot", { scale: 0, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 0.9, delay: 0.25 * (step.ui?.length ?? 1), ease: "power2.out" });
    }, screen);
    return () => ctx.revert();
  }, [active, step.ui?.length]);

  return (
    <div className="steps-wrap">
      <ol className="steps-rail">
        {slide.steps.map((s, i) => (
          <li key={i}>
            <button className={i === active ? "on" : i < active ? "past" : ""} onClick={() => setActive(i)} aria-current={i === active ? "step" : undefined}>
              <span className="rail-num">{i < active ? <Check /> : i + 1}</span>
              <span className="rail-text">{s.do}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="screen" ref={screen} key={active}>
        <div className="screen-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>الخطوة {active + 1} من {slide.steps.length}</span>
        </div>
        <div className="screen-body">
          {step.ui && step.ui.length > 0 && (
            <div className="crumbs-ui" dir="ltr">
              {step.ui.map((u, i) => (
                <span key={i} className={`crumb${i === step.ui!.length - 1 ? " last" : ""}`}>
                  {u}
                  {i === step.ui!.length - 1 && <b className="click-dot" />}
                </span>
              ))}
            </div>
          )}
          <p className="step-do">{step.do}</p>
          {step.note && <p className="step-note">{step.note}</p>}
        </div>
      </div>
    </div>
  );
}

function CardsSlide({ slide }: { slide: Extract<Slide, { type: "cards" }> }) {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <div className={`flip-grid n${slide.cards.length}`}>
      {slide.cards.map((c, i) => {
        const on = open.includes(i);
        return (
          <button key={i} className={`flip${on ? " on" : ""}`} onClick={() => setOpen(on ? open.filter((x) => x !== i) : [...open, i])} aria-expanded={on}>
            <span className="flip-num">{i + 1}</span>
            <b>{c.title}</b>
            <span className="flip-text">{c.text}</span>
            {!on && <span className="flip-hint">اضغط للكشف</span>}
          </button>
        );
      })}
    </div>
  );
}

function CompareSlide({ slide }: { slide: Extract<Slide, { type: "compare" }> }) {
  const [side, setSide] = useState<0 | 1 | null>(null);
  return (
    <div className="cmp">
      <div className="cmp-head">
        <span />
        {slide.columns.map((c, i) => (
          <button key={i} className={`cmp-col c${i}${side === i ? " on" : ""}`} onClick={() => setSide(side === i ? null : (i as 0 | 1))}>
            {c}
          </button>
        ))}
      </div>
      {slide.rows.map((r, i) => (
        <div key={i} className="cmp-row" data-in>
          <span className="cmp-label">{r[0]}</span>
          <span className={`cmp-cell c0${side === 1 ? " dim" : ""}`}>{r[1]}</span>
          <span className={`cmp-cell c1${side === 0 ? " dim" : ""}`}>{r[2]}</span>
        </div>
      ))}
    </div>
  );
}

function QuizSlide({ slide }: { slide: Extract<Slide, { type: "quiz" }> }) {
  const [picked, setPicked] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  function pick(i: number) {
    if (picked === slide.answer) return;
    setPicked(i);
    const el = box.current?.querySelectorAll("button")[i];
    if (!el) return;
    if (i === slide.answer) gsap.fromTo(el, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    else gsap.fromTo(el, { x: -9 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.25)" });
  }
  const solved = picked === slide.answer;
  return (
    <div className="quiz" ref={box}>
      <p className="quiz-q">{slide.question}</p>
      <div className="quiz-opts">
        {slide.options.map((o, i) => (
          <button key={i} onClick={() => pick(i)} className={picked === i ? (i === slide.answer ? "right" : "wrong") : solved && i === slide.answer ? "right" : ""}>
            <span className="opt-mark">{picked === i ? i === slide.answer ? <Check /> : <Cross /> : ["أ", "ب", "ج", "د"][i]}</span>
            {o}
          </button>
        ))}
      </div>
      <p className={`quiz-why${picked === null ? "" : solved ? " ok" : " no"}`} role="status">
        {picked === null ? "اختر إجابة" : solved ? `صحيح. ${slide.why}` : "ليست هذه. جرّب مرة أخرى."}
      </p>
    </div>
  );
}

function ChecklistSlide({ slide, onAllDone }: { slide: Extract<Slide, { type: "checklist" }>; onAllDone: () => void }) {
  const [ticked, setTicked] = useState<number[]>([]);
  const all = ticked.length === slide.items.length;
  useEffect(() => {
    if (all) onAllDone();
  }, [all, onAllDone]);
  return (
    <div className="checks">
      {slide.items.map((t, i) => {
        const on = ticked.includes(i);
        return (
          <button key={i} className={on ? "on" : ""} onClick={() => setTicked(on ? ticked.filter((x) => x !== i) : [...ticked, i])} role="checkbox" aria-checked={on}>
            <span className="tick">{on && <Check />}</span>
            {t}
          </button>
        );
      })}
      <p className={`checks-done${all ? " show" : ""}`} role="status">
        أحسنت، أتممت هذا الدليل.
      </p>
    </div>
  );
}

/* ---------- player ---------- */

export default function DeckPlayer({ deck, guideId }: { deck: Deck; guideId: string }) {
  const slides = deck.slides;
  const [index, setIndex] = useState(0);
  const [stepAt, setStepAt] = useState(0);
  const [dir, setDir] = useState(1);
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const slide = slides[index];

  const go = useCallback(
    (delta: number) => {
      // Inside a steps slide, "next" walks the steps first.
      if (slide.type === "steps") {
        const n = stepAt + delta;
        if (n >= 0 && n < slide.steps.length) return setStepAt(n);
      }
      const next = index + delta;
      if (next < 0 || next >= slides.length) return;
      const target = slides[next];
      setDir(delta);
      setStepAt(delta < 0 && target.type === "steps" ? target.steps.length - 1 : 0);
      setIndex(next);
    },
    [index, slide, slides, stepAt],
  );

  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, x: -60 * dir, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.55, ease: "power3.out" });
      gsap.from("[data-in]", { opacity: 0, y: 22, duration: 0.5, stagger: 0.09, delay: 0.15, ease: "power2.out" });
      gsap.from(".illus [data-step]", { opacity: 0, scale: 0.85, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.14, delay: 0.25, ease: "back.out(1.6)" });
    }, el);
    return () => ctx.revert();
  }, [index, dir]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!root.current) return;
      const r = root.current.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const touch = useRef<number | null>(null);
  const isLast = index === slides.length - 1;
  const atEnd = isLast && (slide.type !== "steps" || stepAt === slide.steps.length - 1);
  const atStart = index === 0 && stepAt === 0;
  const onAllDone = useCallback(() => {
    markDone(guideId);
    const el = root.current?.querySelector(".burst");
    if (el) gsap.fromTo(el.children, { x: 0, y: 0, opacity: 1, scale: 1 }, { x: () => gsap.utils.random(-170, 170), y: () => gsap.utils.random(-130, 40), opacity: 0, scale: 0.3, duration: 1.1, ease: "power2.out", stagger: 0.015 });
  }, [guideId]);

  return (
    <section className="deck" ref={root} aria-roledescription="عرض تفاعلي">
      <div className="deck-top">
        <span className="deck-badge">عرض تفاعلي</span>
        <div className="deck-dots" role="tablist" aria-label="الشرائح">
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`الشريحة ${i + 1}`}
              className={i === index ? "on" : i < index ? "past" : ""}
              onClick={() => {
                setDir(i > index ? 1 : -1);
                setStepAt(0);
                setIndex(i);
              }}
            />
          ))}
        </div>
        <span className="deck-count">
          {index + 1} / {slides.length}
        </span>
      </div>

      <div
        className={`deck-stage type-${slide.type}`}
        ref={stage}
        key={index}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 60) go(dx > 0 ? 1 : -1);
        }}
      >
        <h2 className="deck-title" data-in>
          {slide.title}
        </h2>
        {slide.type === "idea" && (
          <div className="idea">
            <p className="idea-text" data-in>
              {slide.text}
            </p>
            {slide.visual && hasIllustration(slide.visual) && <Illustration name={slide.visual} />}
          </div>
        )}
        {slide.type === "steps" && <StepsSlide slide={slide} active={stepAt} setActive={setStepAt} />}
        {slide.type === "cards" && <CardsSlide slide={slide} />}
        {slide.type === "compare" && <CompareSlide slide={slide} />}
        {slide.type === "dosdonts" && (
          <div className="dd">
            <div className="dd-col do" data-in>
              <h3>افعل</h3>
              {slide.do.map((t, i) => (
                <p key={i}>
                  <span className="dd-mark">
                    <Check />
                  </span>
                  {t}
                </p>
              ))}
            </div>
            <div className="dd-col dont" data-in>
              <h3>لا تفعل</h3>
              {slide.dont.map((t, i) => (
                <p key={i}>
                  <span className="dd-mark">
                    <Cross />
                  </span>
                  {t}
                </p>
              ))}
            </div>
          </div>
        )}
        {slide.type === "quiz" && <QuizSlide slide={slide} />}
        {slide.type === "checklist" && <ChecklistSlide slide={slide} onAllDone={onAllDone} />}
        <div className="burst" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => (
            <i key={i} style={{ background: ["#2f80ed", "#7c3aed", "#06b6d4", "#0f9d6b", "#f59e0b"][i % 5] }} />
          ))}
        </div>
      </div>

      <div className="deck-nav">
        <button className="btn btn-ghost" onClick={() => go(-1)} disabled={atStart}>
          <Arrow flip /> السابق
        </button>
        <span className="deck-hint">استخدم الأسهم أو اسحب</span>
        <button className="btn btn-primary" onClick={() => go(1)} disabled={atEnd}>
          {slide.type === "steps" && stepAt < slide.steps.length - 1 ? "الخطوة التالية" : "التالي"} <Arrow />
        </button>
      </div>
    </section>
  );
}
