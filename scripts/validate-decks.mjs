// Validates the interactive decks: node scripts/validate-decks.mjs [service ...]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "content");
const VISUALS = ["account-hierarchy","ad-auction","funnel","pixel-flow","tag-manager","product-feed","keyword-match","conversion-tracking","audience-targeting","budget-bidding","analytics-report","search-performance","store-linking","campaign-steps","video-formats","copywriting"];
const words = (s) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
const BAD = /مدرّب|المدرب|تفريغ|⏱|ملاحظة تحقق|غير واضح|[\u{1F300}-\u{1FAFF}☀-➿]/u;
const services = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(ROOT);
let errors = 0, decks = 0, missing = 0;
const fail = (f, m) => { errors++; console.log(`✗ ${f}: ${m}`); };

for (const service of services) {
  const dir = path.join(ROOT, service);
  for (const md of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const file = path.join(service, md.replace(/\.md$/, ".deck.json"));
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) { missing++; continue; }
    decks++;
    let deck;
    const raw = fs.readFileSync(full, "utf8");
    try { deck = JSON.parse(raw); } catch (e) { fail(file, "invalid JSON: " + e.message); continue; }
    if (BAD.test(raw)) fail(file, "forbidden word or emoji");
    const slides = deck.slides;
    if (!Array.isArray(slides) || slides.length < 4 || slides.length > 9) { fail(file, "slides must be 4-9"); continue; }
    if (slides[0].type !== "idea") fail(file, "first slide must be idea");
    if (slides.at(-1).type !== "checklist") fail(file, "last slide must be checklist");
    if (!slides.some((s) => s.type === "quiz")) fail(file, "needs one quiz slide");
    let total = 0;
    slides.forEach((s, i) => {
      const at = `slide ${i + 1} (${s.type})`;
      if (!s.title || words(s.title) > 9) fail(file, `${at}: title missing or > 9 words`);
      total += words(s.title);
      const lim = (v, n, what) => { total += words(v); if (!v || words(v) > n) fail(file, `${at}: ${what} missing or > ${n} words`); };
      switch (s.type) {
        case "idea":
          lim(s.text, 26, "text");
          if (s.visual && !VISUALS.includes(s.visual)) fail(file, `${at}: unknown visual ${s.visual}`);
          break;
        case "steps":
          if (!Array.isArray(s.steps) || s.steps.length < 2 || s.steps.length > 6) { fail(file, `${at}: 2-6 steps`); break; }
          s.steps.forEach((st) => { lim(st.do, 16, "step.do"); if (st.note) lim(st.note, 14, "step.note"); if (st.ui && !Array.isArray(st.ui)) fail(file, `${at}: ui must be array`); });
          break;
        case "cards":
          if (!Array.isArray(s.cards) || s.cards.length < 2 || s.cards.length > 6) { fail(file, `${at}: 2-6 cards`); break; }
          s.cards.forEach((c) => { lim(c.title, 6, "card.title"); lim(c.text, 18, "card.text"); });
          break;
        case "compare":
          if (!Array.isArray(s.columns) || s.columns.length !== 2) { fail(file, `${at}: exactly 2 columns`); break; }
          if (!Array.isArray(s.rows) || s.rows.length < 2 || s.rows.length > 5) { fail(file, `${at}: 2-5 rows`); break; }
          s.rows.forEach((r) => { if (!Array.isArray(r) || r.length !== 3) fail(file, `${at}: each row = [label, a, b]`); else r.forEach((c) => lim(c, 9, "cell")); });
          break;
        case "dosdonts":
          for (const k of ["do", "dont"]) { if (!Array.isArray(s[k]) || s[k].length < 1 || s[k].length > 4) fail(file, `${at}: ${k} 1-4 items`); else s[k].forEach((t) => lim(t, 12, k)); }
          break;
        case "quiz":
          lim(s.question, 18, "question");
          if (!Array.isArray(s.options) || s.options.length < 2 || s.options.length > 4) fail(file, `${at}: 2-4 options`); else s.options.forEach((o) => lim(o, 10, "option"));
          if (!Number.isInteger(s.answer) || s.answer < 0 || s.answer >= (s.options?.length ?? 0)) fail(file, `${at}: answer index`);
          lim(s.why, 20, "why");
          break;
        case "checklist":
          if (!Array.isArray(s.items) || s.items.length < 3 || s.items.length > 5) fail(file, `${at}: 3-5 items`); else s.items.forEach((t) => lim(t, 12, "item"));
          break;
        default: fail(file, `${at}: unknown type`);
      }
    });
    if (total > 260) fail(file, `too wordy: ${total} words (max 260)`);
  }
}
console.log(`${decks} decks checked, ${missing} guides without a deck, ${errors} problems`);
process.exit(errors ? 1 : 0);
