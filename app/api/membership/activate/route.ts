
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  userId: z.string(),
  active: z.boolean(),
  expiresAt: z.string().nullable().optional(),
  plan: z.string().optional()
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { userId, active, expiresAt, plan } = parsed.data;
  await prisma.membership.upsert({
    where: { userId },
    create: { userId, active, expiresAt: expiresAt ? new Date(expiresAt) : null, plan: plan || null },
    update: { active, expiresAt: expiresAt ? new Date(expiresAt) : null, plan: plan || null }
  });
  return NextResponse.json({ ok: true });
}
