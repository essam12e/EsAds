import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BrandIcon from "@/components/BrandIcon";
import DeckPlayer, { type Deck } from "@/components/DeckPlayer";
import Illustration, { hasIllustration } from "@/components/Illustration";
import { platformOf, serviceOf } from "@/lib/catalog";
import { KIND_LABEL, deckOf, topicOf, topicsOf } from "@/lib/content";

type Params = Promise<{ service: string; topic: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { service, topic } = await params;
  return { title: topicOf(service, topic)?.title ?? "دليل" };
}

/** Blockquotes that open with a bold label become coloured callouts. */
function calloutClass(children: React.ReactNode): string {
  const text = JSON.stringify(children);
  if (text.includes("تنبيه")) return "callout warn";
  if (text.includes("خطأ شائع")) return "callout bad";
  return "callout tip";
}

export default async function TopicPage({ params }: { params: Params }) {
  const { service: serviceId, topic: slug } = await params;
  const service = serviceOf(serviceId);
  const topic = service && topicOf(service.id, slug);
  if (!service || !topic) notFound();
  const platform = platformOf(service.platform)!;
  const all = topicsOf(service.id);
  const idx = all.findIndex((t) => t.slug === slug);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const deck = deckOf(service.id, slug) as Deck | null;

  const body = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        blockquote: ({ children }) => <blockquote className={calloutClass(children)}>{children}</blockquote>,
        table: ({ children }) => (
          <div className="table-wrap">
            <table>{children}</table>
          </div>
        ),
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        code: ({ children }) => <code dir="auto">{children}</code>,
      }}
    >
      {topic.body}
    </ReactMarkdown>
  );

  return (
    <article className="guide">
      <nav className="crumbs" aria-label="مسار التنقل">
        <Link href="/dashboard">المنصات</Link>
        <Link href={`/p/${platform.id}`}>{platform.name}</Link>
        <Link href={`/s/${service.id}`}>{service.name}</Link>
      </nav>
      <header className="guide-head" data-hero>
        <div className="guide-tags">
          <BrandIcon name={service.icon} size={40} />
          <span className={`chip kind-${topic.kind}`}>{KIND_LABEL[topic.kind]}</span>
          <span className="muted">قراءة {topic.minutes} دقائق</span>
        </div>
        <h1>{topic.title}</h1>
        {topic.summary && <p className="lead">{topic.summary}</p>}
      </header>
      {deck ? (
        <>
          <DeckPlayer deck={deck} guideId={`${service.id}/${slug}`} />
          <details className="full-text">
            <summary>
              <span>الشرح المفصّل</span>
              <small>كل التفاصيل والخطوات مكتوبة، لمن يريد الرجوع إليها</small>
            </summary>
            <div className="prose">
{body}
            </div>
          </details>
        </>
      ) : (
        <>
          {hasIllustration(topic.illustration) && <Illustration name={topic.illustration} />}
          <div className="prose">
{body}
          </div>
        </>
      )}
      <nav className="guide-nav">
        {prev ? (
          <Link href={`/s/${service.id}/${prev.slug}`} className="card nav-card">
            <span className="muted">الدليل السابق</span>
            <b>{prev.title}</b>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/s/${service.id}/${next.slug}`} className="card nav-card next">
            <span className="muted">الدليل التالي</span>
            <b>{next.title}</b>
          </Link>
        ) : (
          <Link href={`/s/${service.id}`} className="card nav-card next">
            <span className="muted">أنهيت أدلة هذه الخدمة</span>
            <b>العودة إلى {service.name}</b>
          </Link>
        )}
      </nav>
    </article>
  );
}
