import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import UserBar from "@/components/UserBar";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Everything under this layout is locked until the admin approves the account. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin" && user.status !== "approved") redirect("/pending");
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-in">
          <Logo href="/dashboard" />
          <nav className="topnav">
            <Link href="/dashboard">المنصات</Link>
            {user.role === "admin" && <Link href="/admin">لوحة الإدارة</Link>}
          </nav>
          <UserBar username={user.username} unread={user.unread} />
        </div>
      </header>
      <main className="wrap app-main">{children}</main>
    </>
  );
}
