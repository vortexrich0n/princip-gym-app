import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      include: { membership: true }
    });

    if (!user) {
      return NextResponse.json({
        ok: false,
        error: "Neispravna email adresa ili lozinka"
      }, { status: 401 });
    }

    // Check password
    const validPassword = await bcrypt.compare(parsed.password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json({
        ok: false,
        error: "Neispravna email adresa ili lozinka"
      }, { status: 401 });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.NEXTAUTH_SECRET || "default-secret",
      { expiresIn: "30d" }
    );

    // Remove sensitive data
    const { passwordHash, verificationToken, ...safeUser } = user;

    return NextResponse.json({
      ok: true,
      token,
      user: safeUser,
      message: "Uspešna prijava"
    });

  } catch (error: any) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        ok: false,
        error: "Neispravni podaci"
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: false,
      error: "Greška pri prijavi"
    }, { status: 500 });
  }
}