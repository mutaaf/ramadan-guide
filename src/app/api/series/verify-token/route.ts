import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const expectedToken = process.env.ADMIN_SECRET;

  if (!expectedToken) {
    return NextResponse.json(
      { error: "ADMIN_SECRET not configured on server" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { token } = body as { token?: string };

  if (!token || token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return NextResponse.json({ valid: true });
}
