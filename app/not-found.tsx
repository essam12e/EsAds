import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="status-page">
      <header className="status-top">
        <Logo />
      </header>
      <section className="status-card tone-wait">
        <h1>الصفحة غير موجودة</h1>
        <p>الرابط الذي فتحته غير صحيح أو أن الصفحة نُقلت.</p>
        <Link className="btn btn-primary" href="/">
          العودة إلى الرئيسية
        </Link>
      </section>
    </main>
  );
}
