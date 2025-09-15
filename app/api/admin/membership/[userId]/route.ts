import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || "default-secret"
    ) as { userId: string; email: string };

    // Get user and check if admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { plan, days, active } = body;

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (days || 30));

    // Update membership
    const membership = await prisma.membership.upsert({
      where: { userId: params.userId },
      update: {
        active: active || true,
        plan: plan || "Monthly",
        expiresAt,
        type: days > 90 ? "VIP" : days > 30 ? "Premium" : "Basic",
        paidAt: new Date(),
        paidAmount: days === 365 ? 1200 : days === 90 ? 350 : 120
      },
      create: {
        userId: params.userId,
        active: active || true,
        plan: plan || "Monthly",
        expiresAt,
        type: days > 90 ? "VIP" : days > 30 ? "Premium" : "Basic",
        paidAt: new Date(),
        paidAmount: days === 365 ? 1200 : days === 90 ? 350 : 120
      }
    });

    return NextResponse.json({
      ok: true,
      membership,
      message: "Članarina uspešno ažurirana"
    });

  } catch (error: any) {
    console.error("Update membership error:", error);
    return NextResponse.json({ error: "Failed to update membership" }, { status: 500 });
  }
}