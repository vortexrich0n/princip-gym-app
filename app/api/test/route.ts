import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" }
    });
    
    return NextResponse.json({
      status: "ok",
      database: "connected",
      users: userCount,
      admins: adminCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message
    }, { status: 500 });
  }
}