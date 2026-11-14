import { NextResponse } from "next/server";
import { sameOrigin, sessionToken } from "@/lib/auth";
import { rpc } from "@/lib/db";

export async function GET() {
  const token = await sessionToken();
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await rpc("app_notifications", { p_token: token }));
}

/** Marks every notification as read. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "server" }, { status: 403 });
  const token = await sessionToken();
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await rpc("app_notifications_read", { p_token: token }));
}
