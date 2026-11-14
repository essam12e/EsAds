import { NextResponse } from "next/server";
import { homeFor, sameOrigin, setSessionCookie, type SessionUser } from "@/lib/auth";
import { rpc } from "@/lib/db";

type Result = { error?: string; token?: string; user?: SessionUser };

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "server" }, { status: 403 });
  try {
    const { username, password } = await req.json();
    const out = await rpc<Result>("app_login", { p_username: String(username ?? ""), p_password: String(password ?? "") });
    if (!out.token || !out.user) return NextResponse.json({ error: out.error ?? "invalid" }, { status: 401 });
    await setSessionCookie(out.token);
    return NextResponse.json({ redirect: homeFor(out.user) });
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
