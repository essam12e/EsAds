/**
 * Animated explanatory diagrams. Pure inline SVG: the continuous motion (flowing
 * dashes, pulses) is CSS, the entrance sequence is driven by GSAP via data-step.
 */

type Node = { label: string; sub?: string };
type Flow = { caption: string; nodes: Node[]; arrows?: boolean };

const TONES = ["#2f80ed", "#7c3aed", "#0891b2", "#4f46e5", "#0f766e", "#9333ea"];
const W = 760;

const FLOWS: Record<string, Flow> = {
  "account-hierarchy": {
    caption: "كل مستوى يحمل إعداداته: من الحساب نزولاً إلى الإعلان الذي يراه العميل",
    nodes: [
      { label: "الحساب", sub: "الفوترة والصلاحيات" },
      { label: "الحملة", sub: "الهدف والميزانية" },
      { label: "المجموعة الإعلانية", sub: "الجمهور والاستهداف" },
      { label: "الإعلان", sub: "النص والصورة والرابط" },
    ],
  },
  "ad-auction": {
    caption: "في كل عملية بحث يُجرى مزاد لحظي يحدد أي إعلان يظهر وبأي ترتيب",
    nodes: [
      { label: "عملية بحث", sub: "العميل يكتب ما يريد" },
      { label: "المزاد", sub: "عرض السعر × الجودة" },
      { label: "ترتيب الإعلان", sub: "الأعلى يظهر أولاً" },
      { label: "ظهور الإعلان", sub: "تدفع عند النقر" },
    ],
  },
  "pixel-flow": {
    caption: "البكسل يرسل ما يفعله الزائر في متجرك إلى المنصة لتتعلم من يشتري",
    nodes: [
      { label: "الزائر", sub: "ينقر على الإعلان" },
      { label: "متجرك", sub: "يتصفح ويشتري" },
      { label: "البكسل", sub: "يسجّل الأحداث" },
      { label: "المنصة الإعلانية", sub: "تحسّن الاستهداف" },
    ],
  },
  "tag-manager": {
    caption: "المشغّل يحدد متى، والوسم يحدد ماذا يُرسل، والمتغيّر يحمل القيمة",
    nodes: [
      { label: "حدث في الموقع", sub: "زيارة أو نقرة أو شراء" },
      { label: "المشغّل", sub: "متى يعمل الوسم؟" },
      { label: "الوسم", sub: "ماذا يُرسل؟" },
      { label: "الوجهة", sub: "التحليلات والإعلانات" },
    ],
  },
  "product-feed": {
    caption: "بيانات منتجاتك تنتقل تلقائياً من المتجر حتى تظهر كإعلانات تسوق",
    nodes: [
      { label: "المتجر", sub: "المنتجات والأسعار" },
      { label: "خلاصة المنتجات", sub: "ملف بيانات محدَّث" },
      { label: "مركز التجار", sub: "مراجعة واعتماد" },
      { label: "إعلانات التسوق", sub: "صورة وسعر في البحث" },
    ],
  },
  "conversion-tracking": {
    caption: "تتبع التحويل يربط كل عملية شراء بالإعلان الذي جاء منه العميل",
    nodes: [
      { label: "نقرة على الإعلان" },
      { label: "زيارة المتجر" },
      { label: "إتمام الشراء" },
      { label: "تسجيل التحويل", sub: "يظهر في تقاريرك" },
    ],
  },
  "campaign-steps": {
    caption: "كل حملة تمر بالمحطات نفسها مهما اختلفت المنصة",
    nodes: [
      { label: "الهدف" },
      { label: "الجمهور" },
      { label: "الميزانية" },
      { label: "الإعلان" },
      { label: "النشر" },
    ],
  },
  copywriting: {
    caption: "النص الإعلاني الناجح: يوقف التمرير، ثم يقنع، ثم يطلب خطوة واضحة",
    nodes: [
      { label: "الجذب", sub: "جملة توقف التمرير" },
      { label: "القيمة", sub: "ماذا يستفيد العميل؟" },
      { label: "الدعوة", sub: "اطلب الآن" },
    ],
  },
  "audience-targeting": {
    caption: "من بيانات عملائك الحاليين تبني المنصة جمهوراً جديداً يشبههم",
    nodes: [
      { label: "زوار متجرك", sub: "وعملاؤك الحاليون" },
      { label: "جمهور مخصص", sub: "إعادة الاستهداف" },
      { label: "جمهور مشابه", sub: "أشخاص يشبهونهم" },
      { label: "عملاء جدد" },
    ],
  },
  "budget-bidding": {
    caption: "الميزانية تحدد كم تنفق، وعرض السعر يحدد كيف تتنافس في المزاد",
    nodes: [
      { label: "الميزانية اليومية", sub: "سقف الإنفاق" },
      { label: "استراتيجية العرض", sub: "نقرات أم تحويلات؟" },
      { label: "المزاد" },
      { label: "النتائج", sub: "نقرات ومبيعات" },
    ],
  },
  "video-formats": {
    caption: "لكل صيغة فيديو مدة وطريقة عرض تناسب هدفاً مختلفاً",
    arrows: false,
    nodes: [
      { label: "قابل للتخطي", sub: "يتخطاه المشاهد بعد ثوانٍ" },
      { label: "غير قابل للتخطي", sub: "يُشاهَد كاملاً" },
      { label: "خاطف", sub: "حتى 6 ثوانٍ" },
      { label: "عمودي قصير", sub: "بين المقاطع القصيرة" },
    ],
  },
};

function wrap(label: string, max = 13): string[] {
  const words = label.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > max) {
      lines.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines;
}

function FlowDiagram({ flow }: { flow: Flow }) {
  const n = flow.nodes.length;
  const gap = n >= 5 ? 22 : 34;
  const bw = (W - 40 - gap * (n - 1)) / n;
  const bh = 104;
  const y = 58;
  // Right-to-left: the first node sits on the right.
  const xOf = (i: number) => W - 20 - bw - i * (bw + gap);
  return (
    <svg viewBox={`0 0 ${W} 220`} role="img" aria-label={flow.caption}>
      {flow.arrows !== false &&
        flow.nodes.slice(0, -1).map((_, i) => {
          const x1 = xOf(i) - 3;
          const x2 = xOf(i + 1) + bw + 9;
          const cy = y + bh / 2;
          return (
            <g key={`a${i}`} data-step>
              <line x1={x1} y1={cy} x2={x2} y2={cy} stroke="#a5b4fc" strokeWidth="2.5" className="mg-flow" />
              <path d={`M${x2 - 8} ${cy} l10 -6 v12 z`} fill="#818cf8" />
            </g>
          );
        })}
      {flow.nodes.map((node, i) => {
        const tone = TONES[i % TONES.length];
        const x = xOf(i);
        const lines = wrap(node.label, n >= 5 ? 9 : 14);
        const subLines = node.sub ? wrap(node.sub, n >= 5 ? 12 : 18) : [];
        const total = lines.length * 22 + subLines.length * 17;
        let ty = y + (bh - total) / 2 + 17;
        return (
          <g key={i} data-step>
            <rect x={x} y={y} width={bw} height={bh} rx="16" fill="#fff" stroke={tone} strokeWidth="2" />
            <rect x={x} y={y} width={bw} height="7" rx="3.5" fill={tone} />
            <circle cx={x + bw - 2} cy={y + 2} r="13" fill={tone} />
            <text x={x + bw - 2} y={y + 7} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              {i + 1}
            </text>
            {lines.map((l, k) => (
              <text key={k} x={x + bw / 2} y={ty + k * 22} textAnchor="middle" fontSize="16.5" fontWeight="700" fill="#0f1b4d">
                {l}
              </text>
            ))}
            {subLines.map((l, k) => (
              <text key={`s${k}`} x={x + bw / 2} y={ty + lines.length * 22 + k * 17 - 2} textAnchor="middle" fontSize="12.5" fill="#5b6490">
                {l}
              </text>
            ))}
          </g>
        );
      })}
      <text x={W / 2} y="204" textAnchor="middle" fontSize="13.5" fill="#5b6490">
        {flow.caption}
      </text>
    </svg>
  );
}

function Funnel() {
  const rows = [
    { label: "الوعي", sub: "يتعرف العميل على متجرك", w: 560, tone: "#2f80ed" },
    { label: "الاهتمام", sub: "يزور ويتصفح ويقارن", w: 420, tone: "#7c3aed" },
    { label: "الشراء", sub: "يطلب ويدفع", w: 280, tone: "#0891b2" },
  ];
  return (
    <svg viewBox={`0 0 ${W} 250`} role="img" aria-label="قمع التسويق من الوعي إلى الشراء">
      {rows.map((r, i) => {
        const y = 16 + i * 66;
        const next = rows[i + 1]?.w ?? r.w - 110;
        const x1 = (W - r.w) / 2;
        const x2 = (W - next) / 2;
        return (
          <g key={i} data-step>
            <path d={`M${x1} ${y} H${x1 + r.w} L${x2 + next} ${y + 56} H${x2} Z`} fill={r.tone} opacity="0.92" />
            <text x={W / 2} y={y + 25} textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">
              {r.label}
            </text>
            <text x={W / 2} y={y + 45} textAnchor="middle" fontSize="12.5" fill="#e0e7ff">
              {r.sub}
            </text>
          </g>
        );
      })}
      <circle cx={W / 2} cy="226" r="7" fill="#0891b2" className="mg-pulse" />
      <text x={W / 2} y="246" textAnchor="middle" fontSize="13" fill="#5b6490">
        كلما نزلت في القمع قلّ العدد وزادت قيمة كل عميل
      </text>
    </svg>
  );
}

function KeywordMatch() {
  const rings = [
    { r: 104, label: "مطابقة واسعة", sub: "أكبر وصول، أقل تحكم", tone: "#2f80ed", ty: -80 },
    { r: 70, label: "مطابقة العبارة", sub: "نفس المعنى", tone: "#7c3aed", ty: -46 },
    { r: 36, label: "تامة", sub: "", tone: "#0891b2", ty: 5 },
  ];
  return (
    <svg viewBox={`0 0 ${W} 250`} role="img" aria-label="أنواع مطابقة الكلمات المفتاحية">
      <g transform={`translate(${W / 2 + 130} 122)`}>
        {rings.map((g, i) => (
          <g key={i} data-step>
            <circle r={g.r} fill={g.tone} opacity={0.14 + i * 0.1} stroke={g.tone} strokeWidth="2" />
            <text y={g.ty} textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f1b4d">
              {g.label}
            </text>
          </g>
        ))}
        <circle r="112" fill="none" stroke="#a5b4fc" strokeWidth="1.5" className="mg-flow" />
      </g>
      <g data-step>
        {[
          ["واسعة", "تظهر لعمليات بحث مرتبطة بالمعنى العام", "#2f80ed"],
          ["عبارة", "تظهر لعمليات بحث تتضمن معنى العبارة", "#7c3aed"],
          ["تامة", "تظهر لعمليات بحث بالمعنى نفسه فقط", "#0891b2"],
        ].map(([t, d, c], i) => (
          <g key={i} transform={`translate(0 ${58 + i * 52})`}>
            <rect x={330} y={-18} width="12" height="12" rx="3" fill={c} />
            <text x={322} y={-7} textAnchor="start" fontSize="15" fontWeight="700" fill="#0f1b4d">
              {t}
            </text>
            <text x={342} y={14} textAnchor="start" fontSize="12.5" fill="#5b6490">
              {d}
            </text>
          </g>
        ))}
      </g>
      <text x={W / 2} y="244" textAnchor="middle" fontSize="13" fill="#5b6490">
        كلما ضاقت الدائرة زاد التحكم وقلّ عدد مرات الظهور
      </text>
    </svg>
  );
}

function AnalyticsReport() {
  const bars = [46, 70, 58, 96, 82, 124, 110];
  return (
    <svg viewBox={`0 0 ${W} 250`} role="img" aria-label="تقرير تحليلات يوضح تطور الزيارات والمبيعات">
      <rect x="20" y="14" width={W - 40} height="196" rx="18" fill="#fff" stroke="#dbe1f5" strokeWidth="1.5" />
      {[60, 100, 140, 180].map((y) => (
        <line key={y} x1="50" x2={W - 50} y1={y} y2={y} stroke="#eef1fb" strokeWidth="1.5" />
      ))}
      {bars.map((h, i) => (
        <rect key={i} data-step x={W - 110 - i * 86} y={186 - h} width="44" height={h} rx="8" fill={i % 2 ? "#7c3aed" : "#2f80ed"} opacity="0.9" />
      ))}
      <polyline
        data-step
        points={bars.map((h, i) => `${W - 88 - i * 86},${170 - h}`).join(" ")}
        fill="none"
        stroke="#0891b2"
        strokeWidth="3"
        strokeLinecap="round"
        className="mg-flow"
      />
      <circle cx={W - 88 - 5 * 86} cy={170 - 124} r="7" fill="#0891b2" className="mg-pulse" />
      <text x={W / 2} y="236" textAnchor="middle" fontSize="13" fill="#5b6490">
        التقارير تحوّل زيارات متجرك إلى أرقام تقرأ منها ما ينجح وما يحتاج تعديلاً
      </text>
    </svg>
  );
}

function SearchPerformance() {
  const cards = [
    ["مرات الظهور", "كم مرة ظهرت في البحث", "#7c3aed"],
    ["النقرات", "كم مرة زاروا متجرك", "#2f80ed"],
    ["نسبة النقر", "النقرات ÷ مرات الظهور", "#0891b2"],
    ["متوسط الترتيب", "موقعك في النتائج", "#4f46e5"],
  ];
  const cw = 164;
  return (
    <svg viewBox={`0 0 ${W} 250`} role="img" aria-label="مقاييس الأداء في نتائج البحث">
      {cards.map(([t, d, c], i) => {
        const x = W - 24 - cw - i * (cw + 18);
        return (
          <g key={i} data-step>
            <rect x={x} y="18" width={cw} height="86" rx="14" fill="#fff" stroke={c} strokeWidth="2" />
            <rect x={x} y="18" width={cw} height="7" rx="3.5" fill={c} />
            <text x={x + cw / 2} y="58" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f1b4d">
              {t}
            </text>
            <text x={x + cw / 2} y="82" textAnchor="middle" fontSize="12" fill="#5b6490">
              {d}
            </text>
          </g>
        );
      })}
      <path data-step d={`M30 196 C 150 190, 210 150, 320 158 S 520 120, ${W - 30} 128`} fill="none" stroke="#2f80ed" strokeWidth="3" strokeLinecap="round" className="mg-flow" />
      <path data-step d={`M30 206 C 160 204, 240 186, 340 188 S 540 170, ${W - 30} 166`} fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <text x={W / 2} y="240" textAnchor="middle" fontSize="13" fill="#5b6490">
        أربعة أرقام تلخّص حضور متجرك في نتائج البحث المجانية
      </text>
    </svg>
  );
}

function StoreLinking() {
  const spokes = ["التحليلات", "مدير الوسوم", "مركز التجار", "بكسل ميتا", "بكسل تيك توك", "بكسل سناب"];
  const cx = W / 2;
  const cy = 112;
  return (
    <svg viewBox={`0 0 ${W} 250`} role="img" aria-label="ربط المتجر بالمنصات وأدوات التتبع">
      {spokes.map((s, i) => {
        const left = i % 2 === 1;
        const row = Math.floor(i / 2);
        const x = left ? 44 : W - 44 - 170;
        const y = 22 + row * 66;
        const ex = left ? x + 170 : x;
        return (
          <g key={i} data-step>
            <path d={`M${cx + (left ? -78 : 78)} ${cy} C ${cx + (left ? -150 : 150)} ${cy}, ${ex + (left ? 60 : -60)} ${y + 24}, ${ex} ${y + 24}`} fill="none" stroke="#a5b4fc" strokeWidth="2.5" className={left ? "mg-flow-rev" : "mg-flow"} />
            <rect x={x} y={y} width="170" height="48" rx="13" fill="#fff" stroke={TONES[i % TONES.length]} strokeWidth="2" />
            <text x={x + 85} y={y + 30} textAnchor="middle" fontSize="15" fontWeight="700" fill="#0f1b4d">
              {s}
            </text>
          </g>
        );
      })}
      <g data-step>
        <circle cx={cx} cy={cy} r="88" fill="#7c3aed" opacity="0.1" className="mg-pulse" />
        <circle cx={cx} cy={cy} r="74" fill="#0f1b4d" />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff">
          متجرك
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="12" fill="#c7d2fe">
          نقطة الانطلاق
        </text>
      </g>
      <text x={W / 2} y="242" textAnchor="middle" fontSize="13" fill="#5b6490">
        اربط متجرك مرة واحدة فتصل بياناته إلى كل منصة تعلن عليها
      </text>
    </svg>
  );
}

const CUSTOM: Record<string, () => React.ReactElement> = {
  funnel: Funnel,
  "keyword-match": KeywordMatch,
  "analytics-report": AnalyticsReport,
  "search-performance": SearchPerformance,
  "store-linking": StoreLinking,
};

export const hasIllustration = (key: string) => key in FLOWS || key in CUSTOM;

export default function Illustration({ name }: { name: string }) {
  const Custom = CUSTOM[name];
  const flow = FLOWS[name];
  if (!Custom && !flow) return null;
  return (
    <figure className="illus" data-illus>
      {Custom ? <Custom /> : <FlowDiagram flow={flow} />}
    </figure>
  );
}
