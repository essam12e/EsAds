import Image from "next/image";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import Logo from "@/components/Logo";
import { getSession, homeFor } from "@/lib/auth";

export const metadata = { title: "إنشاء حساب" };

export default async function Page() {
  const user = await getSession();
  if (user) redirect(homeFor(user));
  return (
    <main className="auth-page">
      <div className="auth-art" aria-hidden="true">
        <Image src="/logo-full.png" alt="" width={420} height={347} priority data-float />
      </div>
      <section className="auth-card" data-hero>
        <Logo />
        <h1>إنشاء حساب</h1>
        <p className="muted">اختر اسم مستخدم وكلمة سر. يُفعَّل حسابك بعد موافقة الإدارة.</p>
        <AuthForm mode="register" />
      </section>
    </main>
  );
}
