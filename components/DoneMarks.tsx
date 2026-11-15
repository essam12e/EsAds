"use client";

import { useEffect } from "react";
import { readDone } from "./DeckPlayer";

/** Marks finished guides (elements carrying data-guide) and fills [data-progress] bars. */
export default function DoneMarks() {
  useEffect(() => {
    const done = new Set(readDone());
    const cards = document.querySelectorAll<HTMLElement>("[data-guide]");
    let n = 0;
    cards.forEach((el) => {
      if (done.has(el.dataset.guide!)) {
        el.classList.add("is-done");
        n++;
      }
    });
    const bar = document.querySelector<HTMLElement>("[data-progress]");
    if (bar && cards.length) {
      bar.hidden = false;
      bar.style.setProperty("--p", `${Math.round((n / cards.length) * 100)}%`);
      const label = bar.querySelector("b");
      if (label) label.textContent = `${n} من ${cards.length}`;
    }
  }, []);
  return null;
}
