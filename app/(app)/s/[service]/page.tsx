import Link from "next/link";
import { notFound } from "next/navigation";
import BrandIcon from "@/components/BrandIcon";
import DoneMarks from "@/components/DoneMarks";
import { platformOf, serviceOf } from "@/lib/catalog";
import { KIND_LABEL, KIND_ORDER, topicsOf } from "@/lib/content";

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const service = serviceOf((await params).service);
  if (!service) notFound();
  const platform = platformOf(service.platform)!;
  const topics = topicsOf(service.id);
  const groups = KIND_ORDER.map((kind) => ({ kind, items: topics.filter((t) => t.kind === kind) })).filter((g) => g.items.length);

  return (
    <>
      <nav className="crumbs" aria-label="مسار التنقل">
        <Link href="/dashboard">المنصات</Link>
        <Link href={`/p/${platform.id}`}>{platform.name}</Link>
        <span>{service.name}</span>
      </nav>
      <section className="page-head with-icon" data-hero>
        <BrandIcon name={service.icon} size={76} />
        <div>
          <h1>{service.name}</h1>
          <p className="lead">{service.blurb}</p>
        </div>
      </section>
      <div className="progress" data-progress hidden>
        <span>تقدّمك في هذه الخدمة</span>
        <i />
        <b />
      </div>
      <DoneMarks />
      {groups.length > 1 && (
        <div className="chips" data-hero>
          {groups.map((g) => (
            <a key={g.kind} href={`#${g.kind}`} className={`chip kind-${g.kind}`}>
              {KIND_LABEL[g.kind]} <b>{g.items.length}</b>
            </a>
          ))}
        </div>
      )}
      {groups.map((g) => (
        <section key={g.kind} id={g.kind} className="topic-group">
          <h2 className={`group-title kind-${g.kind}`} data-reveal>
            {KIND_LABEL[g.kind]}
          </h2>
          <div className="grid cards-2">
            {g.items.map((t, i) => (
              <Link key={t.slug} href={`/s/${service.id}/${t.slug}`} className="card topic-card" data-reveal data-guide={`${service.id}/${t.slug}`}>
                <span className="topic-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.summary}</p>
                  <span className="card-meta">قراءة {t.minutes} دقائق</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      {topics.length === 0 && <p className="muted">لا يوجد محتوى منشور لهذه الخدمة بعد.</p>}
    </>
  );
}
