import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(80).optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    
    // Proveri da li korisnik već postoji
    const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (exists) {
      return NextResponse.json({ error: "Korisnik sa ovom email adresom već postoji" }, { status: 400 });
    }
    
    // Generiši verifikacioni token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Hash lozinku
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    
    // Kreiraj korisnika
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        name: parsed.name || null,
        verificationToken,
        emailVerified: false,
        membership: { create: {} },
        qrData: "" // will be set after first dashboard load
      }
    });
    
    // Pošalji verifikacioni email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      await sendVerificationEmail(parsed.email, verificationToken);
      return NextResponse.json({ 
        ok: true, 
        id: user.id,
        message: "Registracija uspešna! Proverite vašu email adresu za link za potvrdu."
      });
    } else {
      // Ako email nije konfigurisan, automatski verifikuj (za development)
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });
      return NextResponse.json({ 
        ok: true, 
        id: user.id,
        message: "Registracija uspešna!"
      });
    }
    
  } catch (e: any) {
    console.error('Registration error:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}