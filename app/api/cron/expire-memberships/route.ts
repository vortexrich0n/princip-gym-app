import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron (optional security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and deactivate expired memberships
    const result = await prisma.membership.updateMany({
      where: {
        active: true,
        expiresAt: {
          lte: new Date()
        }
      },
      data: {
        active: false
      }
    });

    // Log the results
    console.log(`Deactivated ${result.count} expired memberships at ${new Date().toISOString()}`);

    // Optional: Send notification emails to users whose membership expired
    const expiredUsers = await prisma.user.findMany({
      where: {
        membership: {
          active: false,
          expiresAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // expired in last 24h
            lte: new Date()
          }
        }
      },
      include: {
        membership: true
      }
    });

    // Here you could add email notification logic
    // for (const user of expiredUsers) {
    //   await sendExpirationEmail(user.email);
    // }

    return NextResponse.json({ 
      success: true, 
      deactivated: result.count,
      recentlyExpired: expiredUsers.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Allow POST as well for manual triggering
export async function POST(request: Request) {
  return GET(request);
}