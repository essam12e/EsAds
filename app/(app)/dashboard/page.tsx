import Link from "next/link";
import BrandIcon from "@/components/BrandIcon";
import { getSession } from "@/lib/auth";
import { PLATFORMS, servicesOf } from "@/lib/catalog";
import { topicsOf } from "@/lib/content";

export const metadata = { title: "المنصات" };

export default async function Dashboard() {
  const user = await getSession();
  const platforms = PLATFORMS.map((p) => {
    const services = servicesOf(p.id).filter((s) => topicsOf(s.id).length > 0);
    const guides = services.reduce((n, s) => n + topicsOf(s.id).length, 0);
    return { ...p, services, guides };
  }).filter((p) => p.guides > 0);

  return (
    <>
      <section className="page-head" data-hero>
        <p className="eyebrow">مرحباً {user?.username}</p>
        <h1>اختر المنصة التي تريد العمل عليها</h1>
        <p className="lead">كل منصة تفتح لك خدماتها، وكل خدمة تفتح أدلة الربط وإنشاء الحملات خطوة بخطوة.</p>
      </section>
      <div className="grid cards-3">
        {platforms.map((p) => (
          <Link key={p.id} href={`/p/${p.id}`} className="card platform-card" data-reveal>
            <BrandIcon name={p.icon} size={64} />
            <h2>{p.name}</h2>
            <span className="card-sub">{p.nameAr}</span>
            <p>{p.blurb}</p>
            <span className="card-meta">
              {p.services.length} {p.services.length > 2 ? "خدمات" : p.services.length === 2 ? "خدمتان" : "خدمة"} · {p.guides} دليلاً
            </span>
          </Link>
        ))}
      </div>
      {platforms.length === 0 && <p className="muted">لا يوجد محتوى منشور بعد.</p>}
    </>
  );
}
