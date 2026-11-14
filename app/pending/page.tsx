import Link from "next/link";
import { redirect } from "next/navigation";
import AutoRefresh from "@/components/AutoRefresh";
import Logo from "@/components/Logo";
import { LogoutButton } from "@/components/UserBar";
import { getSession, sessionToken, type Notice } from "@/lib/auth";
import { rpc } from "@/lib/db";

export const metadata = { title: "حالة الحساب" };

export default async function PendingPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  const token = await sessionToken();
  const { items = [] } = await rpc<{ items?: Notice[] }>("app_notifications", { p_token: token });
  if (user.unread > 0) await rpc("app_notifications_read", { p_token: token }).catch(() => null);

  const state = {
    pending: { title: "حسابك بانتظار الموافقة", text: "استلمنا طلبك. لن تُفتح لك الأدلة قبل أن توافق الإدارة على حسابك، وستجد الإشعار هنا فور صدور القرار.", tone: "wait" },
    approved: { title: "حسابك جاهز للاستخدام", text: "تمت الموافقة على حسابك. يمكنك الآن الدخول إلى جميع الأدلة.", tone: "ok" },
    rejected: { title: "لم تتم الموافقة على حسابك", text: "نعتذر، رُفض طلب التسجيل. للاستفسار تواصل مع المطوّر عبر زر واتساب أسفل الصفحة.", tone: "no" },
  }[user.status];

  return (
    <main className="status-page">
      <header className="status-top">
        <Logo />
        <LogoutButton />
      </header>
      <section className={`status-card tone-${state.tone}`} data-hero>
        <div className="status-mark" aria-hidden="true">
          <span />
        </div>
        <p className="muted">مرحباً {user.username}</p>
        <h1>{state.title}</h1>
        <p>{state.text}</p>
        {user.status === "approved" && (
          <Link className="btn btn-primary" href="/dashboard">
            ادخل إلى الأكاديمية
          </Link>
        )}
      </section>
      <section className="status-notices" data-hero>
        <h2>الإشعارات</h2>
        {items.length === 0 && <p className="muted">لا توجد إشعارات.</p>}
        {items.map((n) => (
          <div key={n.id} className={`notice notice-${n.kind}`}>
            <b>{n.title}</b>
            <p>{n.body}</p>
          </div>
        ))}
      </section>
      {user.status === "pending" && <AutoRefresh seconds={20} />}
    </main>
  );
}
