import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        error: "No token provided"
      }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || "default-secret"
    ) as { userId: string; email: string };

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { membership: true }
    });

    if (!user) {
      return NextResponse.json({
        error: "User not found"
      }, { status: 404 });
    }

    // Remove sensitive data
    const { passwordHash, verificationToken, ...safeUser } = user;

    return NextResponse.json(safeUser);

  } catch (error: any) {
    console.error("Session error:", error);

    return NextResponse.json({
      error: "Invalid token"
    }, { status: 401 });
  }
}