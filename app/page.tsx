import Image from "next/image";
import Link from "next/link";
import BrandIcon from "@/components/BrandIcon";
import Illustration from "@/components/Illustration";
import Logo from "@/components/Logo";
import { getSession, homeFor } from "@/lib/auth";
import { SERVICES } from "@/lib/catalog";
import { topicsOf } from "@/lib/content";

const LOGOS = ["google", "googleads", "youtube", "analytics", "tagmanager", "searchconsole", "meta", "facebook", "instagram", "tiktok", "snapchat", "linkedin", "x", "salla", "zid", "shopify", "woocommerce"];

const FEATURES = [
  ["ربط المتجر أولاً", "أدلة تبدأ من متجرك: سلة، زد، Shopify أو WooCommerce، وتربطه بأدوات التتبع والبكسلات قبل أي إنفاق إعلاني."],
  ["حملات خطوة بخطوة", "كل حملة مشروحة بترتيب الشاشات نفسها: الهدف، الجمهور، الميزانية، ثم الإعلان، مع اسم كل زر وخيار."],
  ["تتبع وقياس صحيح", "تعرف من أين جاء كل طلب: تتبع التحويلات، مدير الوسوم، التحليلات، ومركز التجار."],
  ["رسوم توضيحية متحركة", "كل فكرة أساسية مرسومة: كيف يعمل البكسل، كيف يجري المزاد، وكيف تنتقل بيانات منتجاتك."],
];

const STEPS = [
  ["أنشئ حسابك", "اسم مستخدم وكلمة سر فقط، بلا بريد إلكتروني."],
  ["انتظر الموافقة", "تراجع الإدارة طلبك، ويصلك إشعار داخل الموقع عند تفعيل الحساب."],
  ["اختر منصتك", "افتح المنصة التي تريدها ثم الخدمة، وابدأ بدليل الربط."],
  ["أطلق حملتك", "اتبع الخطوات حتى النشر، ثم تابع النتائج وحسّنها."],
];

export default async function Landing() {
  const user = await getSession();
  const guides = SERVICES.reduce((n, s) => n + topicsOf(s.id).length, 0);
  const services = SERVICES.filter((s) => topicsOf(s.id).length > 0).length;

  return (
    <div className="landing">
      <header className="topbar">
        <div className="wrap topbar-in">
          <Logo />
          <nav className="topnav">
            <a href="#features">ماذا نقدّم</a>
            <a href="#platforms">المنصات</a>
            <a href="#how">كيف تبدأ</a>
          </nav>
          <div className="userbar">
            {user ? (
              <Link className="btn btn-primary btn-sm" href={homeFor(user)}>
                الدخول إلى حسابي
              </Link>
            ) : (
              <>
                <Link className="btn btn-ghost btn-sm" href="/login">
                  تسجيل الدخول
                </Link>
                <Link className="btn btn-primary btn-sm" href="/register">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <span className="blob b1" data-float aria-hidden="true" />
        <span className="blob b2" data-float aria-hidden="true" />
        <div className="wrap hero-in">
          <div className="hero-copy">
            <p className="eyebrow" data-hero>
              دليلك لبناء متجر ناجح وحملات إعلانية فعّالة
            </p>
            <h1 data-hero>
              من ربط متجرك إلى <span className="grad">أول حملة إعلانية</span>، خطوة بخطوة
            </h1>
            <p className="lead" data-hero>
              أكاديمية المتجر دليل عملي بالعربية لأصحاب المتاجر الإلكترونية: تربط متجرك بالمنصات الإعلانية وأدوات التتبع، ثم تنشئ حملاتك على Google و Meta و TikTok و Snapchat وغيرها بشرح واضح لكل شاشة.
            </p>
            <div className="hero-cta" data-hero>
              <Link className="btn btn-primary btn-lg" href={user ? homeFor(user) : "/register"}>
                {user ? "الدخول إلى حسابي" : "ابدأ الآن"}
              </Link>
              <a className="btn btn-ghost btn-lg" href="#features">
                تعرّف على الأكاديمية
              </a>
            </div>
            {guides > 0 && (
              <div className="hero-stats" data-hero>
                <div>
                  <b data-count={guides}>{guides}</b>
                  <span>دليلاً عملياً</span>
                </div>
                <div>
                  <b data-count={services}>{services}</b>
                  <span>خدمة ومنصة</span>
                </div>
                <div>
                  <b data-count={4}>4</b>
                  <span>منصات متاجر</span>
                </div>
              </div>
            )}
          </div>
          <div className="hero-art" data-hero>
            <Image src="/logo-full.png" alt="شعار أكاديمية المتجر" width={520} height={430} priority data-float />
          </div>
        </div>
      </section>

      <section className="logo-strip" aria-label="المنصات التي تغطيها الأكاديمية">
        <div className="marquee">
          <div className="marquee-track">
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <BrandIcon key={i} name={l} size={58} />
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section wrap">
        <h2 className="section-title" data-reveal>
          ماذا تقدّم لك الأكاديمية؟
        </h2>
        <div className="grid cards-2">
          {FEATURES.map(([t, d], i) => (
            <div key={t} className="card feature" data-reveal>
              <span className="topic-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <h2 className="section-title" data-reveal>
          نشرح الفكرة قبل الخطوات
        </h2>
        <p className="section-lead" data-reveal>
          مثال من داخل الأدلة: هكذا تتصل بيانات متجرك بكل منصة تعلن عليها.
        </p>
        <div data-reveal>
          <Illustration name="store-linking" />
        </div>
      </section>

      <section id="platforms" className="section wrap">
        <h2 className="section-title" data-reveal>
          المنصات والخدمات
        </h2>
        <div className="grid cards-4">
          {SERVICES.map((s) => (
            <div key={s.id} className="card mini" data-reveal>
              <BrandIcon name={s.icon} size={46} />
              <div>
                <b>{s.name}</b>
                <span>{s.nameAr}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="section wrap">
        <h2 className="section-title" data-reveal>
          كيف تبدأ؟
        </h2>
        <div className="steps">
          {STEPS.map(([t, d], i) => (
            <div key={t} className="step" data-reveal>
              <span className="step-num">{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <div className="cta-band" data-reveal>
          <h2>جاهز لربط متجرك وإطلاق حملتك؟</h2>
          <Link className="btn btn-light btn-lg" href={user ? homeFor(user) : "/register"}>
            {user ? "الدخول إلى حسابي" : "أنشئ حسابك الآن"}
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-in">
          <Logo />
          <p>دليلك لبناء متجر ناجح وحملات إعلانية فعّالة.</p>
          <p className="muted">أسماء المنصات وشعاراتها علامات تجارية لأصحابها، وتُعرض هنا للدلالة عليها فقط.</p>
        </div>
      </footer>
    </div>
  );
}
