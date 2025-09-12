import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid-token', request.url));
  }
  
  try {
    // Nađi korisnika sa ovim tokenom
    const user = await prisma.user.findUnique({
      where: { verificationToken: token }
    });
    
    if (!user) {
      return NextResponse.redirect(new URL('/login?error=invalid-token', request.url));
    }
    
    // Verifikuj korisnika
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null // Obriši token nakon verifikacije
      }
    });
    
    // Preusmeri na login sa success porukom
    return NextResponse.redirect(new URL('/login?verified=true', request.url));
    
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
  }
}