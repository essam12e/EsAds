"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { timeAgo } from "./UserBar";

export type AdminUser = { id: string; username: string; status: "pending" | "approved" | "rejected"; created_at: string; decided_at: string | null };

const STATUS: Record<AdminUser["status"], string> = { pending: "بانتظار الموافقة", approved: "مقبول", rejected: "مرفوض" };
const FILTERS = [
  ["pending", "بانتظار الموافقة"],
  ["approved", "المقبولون"],
  ["rejected", "المرفوضون"],
  ["all", "الكل"],
] as const;

export default function AdminTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>(users.some((u) => u.status === "pending") ? "pending" : "all");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const shown = users.filter((u) => filter === "all" || u.status === filter);

  async function decide(userId: string, status: "approved" | "rejected") {
    setBusy(userId);
    setError("");
    const res = await fetch("/api/admin/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    }).catch(() => null);
    if (!res?.ok) setError("تعذّر تنفيذ العملية. حاول مرة أخرى.");
    setBusy("");
    router.refresh();
  }

  return (
    <>
      <div className="chips">
        {FILTERS.map(([key, label]) => (
          <button key={key} className={`chip${filter === key ? " active" : ""}`} onClick={() => setFilter(key)}>
            {label} <b>{key === "all" ? users.length : users.filter((u) => u.status === key).length}</b>
          </button>
        ))}
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="admin-list">
        {shown.length === 0 && <p className="muted empty">لا يوجد مستخدمون في هذه القائمة.</p>}
        {shown.map((u) => (
          <div key={u.id} className="admin-row">
            <div className="admin-user">
              <span className="avatar" aria-hidden="true">
                {u.username.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <b>{u.username}</b>
                <span className="muted">سجّل {timeAgo(u.created_at)}</span>
              </div>
            </div>
            <span className={`badge st-${u.status}`}>{STATUS[u.status]}</span>
            <div className="admin-actions">
              {u.status !== "approved" && (
                <button className="btn btn-ok btn-sm" disabled={busy === u.id} onClick={() => decide(u.id, "approved")}>
                  موافقة
                </button>
              )}
              {u.status !== "rejected" && (
                <button className="btn btn-no btn-sm" disabled={busy === u.id} onClick={() => decide(u.id, "rejected")}>
                  {u.status === "approved" ? "إلغاء الموافقة" : "رفض"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
