
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ userId: z.string(), via: z.string().optional() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
      include: { membership: true }
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const active = user.membership?.active && (!user.membership?.expiresAt || user.membership.expiresAt > new Date());
    if (!active) {
      return NextResponse.json({ ok: false, allowed: false, reason: "Membership inactive or expired" }, { status: 403 });
    }
    await prisma.checkin.create({ data: { userId: user.id, via: parsed.data.via || "qr" } });
    return NextResponse.json({ ok: true, allowed: true, name: user.name || user.email });
  } catch (error) {
    console.error("Checkin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
