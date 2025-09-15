import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production";

function verifyToken(req: Request): any {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// DELETE user (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const decoded = verifyToken(req);

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Don't allow deleting yourself
    if (params.userId === decoded.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Delete user's membership first (if exists)
    await prisma.membership.deleteMany({
      where: { userId: params.userId }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: params.userId }
    });

    return NextResponse.json({ ok: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// UPDATE user membership (admin only)
const updateMembershipSchema = z.object({
  active: z.boolean(),
  type: z.string().optional(),
  durationDays: z.number().optional()
});

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const decoded = verifyToken(req);

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateMembershipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { active, type, durationDays } = parsed.data;

    // Calculate expiration date if activating membership
    let expiresAt = null;
    if (active && durationDays) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + durationDays);
      expiresAt = expirationDate;
    }

    // Update or create membership
    const membership = await prisma.membership.upsert({
      where: { userId: params.userId },
      create: {
        userId: params.userId,
        active,
        type: type || "Basic",
        plan: type || "Basic",
        expiresAt,
        paidAt: active ? new Date() : null,
        paidAmount: 0
      },
      update: {
        active,
        type: type || undefined,
        plan: type || undefined,
        expiresAt: active ? (expiresAt || undefined) : undefined
      }
    });

    // Get updated user with membership
    const updatedUser = await prisma.user.findUnique({
      where: { id: params.userId },
      include: { membership: true }
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user membership:", error);
    return NextResponse.json({ error: "Failed to update membership" }, { status: 500 });
  }
}