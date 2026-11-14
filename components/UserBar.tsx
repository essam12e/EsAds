"use client";

import { useEffect, useRef, useState } from "react";

type Notice = { id: number; kind: string; title: string; body: string; read: boolean; created_at: string };

export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  return `قبل ${Math.round(hours / 24)} يوم`;
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.assign("/");
}

export function LogoutButton() {
  return (
    <button className="btn btn-ghost btn-sm" onClick={logout}>
      خروج
    </button>
  );
}

export default function UserBar({ username, unread }: { username: string; unread: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notice[] | null>(null);
  const [count, setCount] = useState(unread);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    const data = await fetch("/api/notifications").then((r) => r.json()).catch(() => ({ items: [] }));
    setItems(data.items ?? []);
    if (count > 0) {
      setCount(0);
      fetch("/api/notifications", { method: "POST" });
    }
  }

  return (
    <div className="userbar">
      <div className="bell-wrap" ref={box}>
        <button className="bell" onClick={toggle} aria-label={`الإشعارات${count ? `، ${count} غير مقروءة` : ""}`} aria-expanded={open}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z" />
            <path d="M10 19.5a2 2 0 0 0 4 0" />
          </svg>
          {count > 0 && <span className="bell-badge">{count}</span>}
        </button>
        {open && (
          <div className="notice-panel" role="dialog" aria-label="الإشعارات">
            <strong>الإشعارات</strong>
            {items === null && <p className="muted">جارٍ التحميل...</p>}
            {items?.length === 0 && <p className="muted">لا توجد إشعارات.</p>}
            {items?.map((n) => (
              <div key={n.id} className={`notice notice-${n.kind}${n.read ? "" : " unread"}`}>
                <b>{n.title}</b>
                <p>{n.body}</p>
                <time>{timeAgo(n.created_at)}</time>
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="user-chip">{username}</span>
      <LogoutButton />
    </div>
  );
}
