import Link from "next/link";
import { redirect } from "next/navigation";
import AdminTable, { type AdminUser } from "@/components/AdminTable";
import AutoRefresh from "@/components/AutoRefresh";
import Logo from "@/components/Logo";
import { LogoutButton } from "@/components/UserBar";
import { getSession, sessionToken } from "@/lib/auth";
import { rpc } from "@/lib/db";

export const metadata = { title: "لوحة الإدارة" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  const { items = [] } = await rpc<{ items?: AdminUser[] }>("admin_users", { p_token: await sessionToken() });
  const count = (s: AdminUser["status"]) => items.filter((u) => u.status === s).length;

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <Logo href="/admin" />
          <nav className="topnav">
            <Link href="/dashboard">عرض الأكاديمية</Link>
          </nav>
          <div className="userbar">
            <span className="user-chip">{user.username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="wrap app-main">
        <section className="page-head" data-hero>
          <p className="eyebrow">لوحة الإدارة</p>
          <h1>طلبات التسجيل والمستخدمون</h1>
          <p className="lead">وافق على الحساب ليُفتح لصاحبه الموقع، أو ارفضه. يصل المستخدمَ إشعار بالقرار في الحالتين.</p>
        </section>
        <div className="stats" data-hero>
          <div className="stat st-pending">
            <b>{count("pending")}</b>
            <span>بانتظار الموافقة</span>
          </div>
          <div className="stat st-approved">
            <b>{count("approved")}</b>
            <span>مقبولون</span>
          </div>
          <div className="stat st-rejected">
            <b>{count("rejected")}</b>
            <span>مرفوضون</span>
          </div>
        </div>
        <AdminTable users={items} />
        <AutoRefresh seconds={30} />
      </main>
    </>
  );
}
