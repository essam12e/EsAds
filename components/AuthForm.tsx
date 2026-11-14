"use client";

import { useState } from "react";
import Link from "next/link";

const ERRORS: Record<string, string> = {
  invalid: "اسم المستخدم أو كلمة السر غير صحيحة.",
  locked: "تم إيقاف المحاولات مؤقتاً بعد عدة محاولات خاطئة. حاول بعد 15 دقيقة.",
  taken: "اسم المستخدم مستخدم من قبل. اختر اسماً آخر.",
  bad_username: "اسم المستخدم من 3 إلى 24 خانة: أحرف وأرقام ونقطة وشرطة فقط، بلا مسافات.",
  bad_password: "كلمة السر 8 خانات على الأقل.",
  mismatch: "كلمتا السر غير متطابقتين.",
  busy: "الخدمة مشغولة حالياً. حاول بعد قليل.",
  server: "تعذّر الاتصال بالخادم. حاول مرة أخرى.",
};

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (isRegister && password !== String(form.get("confirm") ?? "")) return setError(ERRORS.mismatch);
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.redirect) {
        window.location.assign(data.redirect);
        return;
      }
      setError(ERRORS[data.error] ?? ERRORS.server);
    } catch {
      setError(ERRORS.server);
    }
    setBusy(false);
  }

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <label>
        <span>اسم المستخدم</span>
        <input name="username" autoComplete="username" required minLength={3} maxLength={24} dir="auto" autoFocus />
      </label>
      <label>
        <span>كلمة السر</span>
        <input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={8} maxLength={72} dir="ltr" />
      </label>
      {isRegister && (
        <label>
          <span>تأكيد كلمة السر</span>
          <input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={72} dir="ltr" />
        </label>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "لحظة..." : isRegister ? "إنشاء الحساب" : "تسجيل الدخول"}
      </button>
      <p className="auth-switch">
        {isRegister ? (
          <>
            لديك حساب؟ <Link href="/login">سجّل الدخول</Link>
          </>
        ) : (
          <>
            ليس لديك حساب؟ <Link href="/register">أنشئ حساباً جديداً</Link>
          </>
        )}
      </p>
    </form>
  );
}
