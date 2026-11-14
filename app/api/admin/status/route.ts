import { NextResponse } from "next/server";
import { sameOrigin, sessionToken } from "@/lib/auth";
import { rpc } from "@/lib/db";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const token = await sessionToken();
  if (!token) return NextResponse.json({ error: "forbidden" }, { status: 401 });
  const { userId, status } = await req.json();
  const out = await rpc<{ ok?: boolean; error?: string }>("admin_set_status", {
    p_token: token,
    p_user_id: String(userId),
    p_status: String(status),
  });
  return NextResponse.json(out, { status: out.ok ? 200 : 403 });
}
