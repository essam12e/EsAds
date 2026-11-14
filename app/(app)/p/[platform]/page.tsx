import Link from "next/link";
import { notFound } from "next/navigation";
import BrandIcon from "@/components/BrandIcon";
import { platformOf, servicesOf } from "@/lib/catalog";
import { topicsOf } from "@/lib/content";

export default async function PlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const platform = platformOf((await params).platform);
  if (!platform) notFound();
  const services = servicesOf(platform.id)
    .map((s) => ({ ...s, count: topicsOf(s.id).length }))
    .filter((s) => s.count > 0);

  return (
    <>
      <nav className="crumbs" aria-label="مسار التنقل">
        <Link href="/dashboard">المنصات</Link>
        <span>{platform.name}</span>
      </nav>
      <section className="page-head with-icon" data-hero>
        <BrandIcon name={platform.icon} size={76} />
        <div>
          <h1>{platform.name}</h1>
          <p className="lead">{platform.blurb}</p>
        </div>
      </section>
      <div className="grid cards-3">
        {services.map((s) => (
          <Link key={s.id} href={`/s/${s.id}`} className="card service-card" data-reveal>
            <BrandIcon name={s.icon} size={52} />
            <h2>{s.name}</h2>
            <span className="card-sub">{s.nameAr}</span>
            <p>{s.blurb}</p>
            <span className="card-meta">{s.count} دليلاً</span>
          </Link>
        ))}
      </div>
      {services.length === 0 && <p className="muted">لا يوجد محتوى منشور لهذه المنصة بعد.</p>}
    </>
  );
}
