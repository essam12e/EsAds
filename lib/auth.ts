import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { rpc } from "./db";

export const SESSION_COOKIE = "ma_session";

export type SessionUser = {
  id: string;
  username: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected";
  unread: number;
};

export type Notice = {
  id: number;
  kind: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export async function sessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = await sessionToken();
  if (!token) return null;
  try {
    return await rpc<SessionUser | null>("app_session", { p_token: token });
  } catch {
    return null;
  }
});

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Where a signed-in user belongs. */
export function homeFor(user: SessionUser): string {
  if (user.role === "admin") return "/admin";
  return user.status === "approved" ? "/dashboard" : "/pending";
}

/** Rejects cross-site form posts: the Origin header must match the host. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}
