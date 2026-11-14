import icons from "@/lib/brand-icons.json";
import { WHATSAPP_NUMBER } from "@/lib/catalog";

export default function WhatsAppWidget() {
  const text = encodeURIComponent("السلام عليكم، أتواصل معك من موقع أكاديمية المتجر.");
  return (
    <a
      className="wa-widget"
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل مع المطوّر عبر واتساب"
    >
      <span className="wa-ring" aria-hidden="true" />
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={(icons as Record<string, { path: string }>).whatsapp.path} fill="#fff" />
      </svg>
      <span className="wa-label">تواصل مع المطوّر</span>
    </a>
  );
}
