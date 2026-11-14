import { NextResponse } from "next/server";
import { clearSessionCookie, sameOrigin, sessionToken } from "@/lib/auth";
import { rpc } from "@/lib/db";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "server" }, { status: 403 });
  const token = await sessionToken();
  if (token) await rpc("app_logout", { p_token: token }).catch(() => null);
  await clearSessionCookie();
  return NextResponse.json({ redirect: "/" });
}
