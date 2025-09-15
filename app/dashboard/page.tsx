import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrDataURL } from "@/lib/qr";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Activity, 
  Trophy, 
  TrendingUp,
  Clock,
  Award,
  Target,
  BarChart3,
  User
} from "lucide-react";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.email || !(session.user as any).id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="champion-card p-12 max-w-md w-full text-center">
          <div className="bg-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gradient-hero">Pristup Odbijen</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Morate biti prijavljeni da biste videli svoj profil.
          </p>
          <Link href="/login" className="btn btn-primary px-8 py-4 text-lg">
            Prijavite se
          </Link>
        </div>
      </div>
    );
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ 
    where: { id: userId }, 
    include: { 
      membership: true,
      checkins: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    } 
  });
  
  const qrPayload = JSON.stringify({ userId });
  const qr = await qrDataURL(qrPayload);

  if (user && user.qrData !== qrPayload) {
    await prisma.user.update({ where: { id: userId }, data: { qrData: qrPayload } });
  }

  const active = user?.membership?.active && (!user.membership?.expiresAt || user.membership.expiresAt > new Date());
  const daysLeft = user?.membership?.expiresAt 
    ? Math.ceil((new Date(user.membership.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalCheckins = user?.checkins?.length || 0;
  const thisMonthCheckins = user?.checkins?.filter(c => {
    const checkinDate = new Date(c.createdAt);
    const now = new Date();
    return checkinDate.getMonth() === now.getMonth() && checkinDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const weeklyCheckins = user?.checkins?.filter(c => {
    const checkinDate = new Date(c.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return checkinDate > weekAgo;
  }).length || 0;

  return (
    <div className="w-full py-8 pb-24">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-3xl font-black mb-3">
          Dobrodošli, <span className="text-gradient-champion">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-muted-foreground text-base font-medium">
          Vaš lični prostor u PRINCIP Kickboxing klubu
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 grid-cols-2 mb-8">
        <div className={cn(
          "champion-card p-6 relative overflow-hidden hover-lift",
          active ? "border-green-500/30" : "border-red-500/30"
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status Članarine</span>
            {active ? (
              <div className="bg-green-500/20 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ) : (
              <div className="bg-red-500/20 rounded-full p-2">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>
          <p className={cn(
            "text-3xl font-black",
            active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {active ? "AKTIVNA" : "NEAKTIVNA"}
          </p>
          {active && daysLeft > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Još {daysLeft} {daysLeft === 1 ? "dan" : "dana"}
            </p>
          )}
        </div>

        <div className="champion-card p-6 relative overflow-hidden hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ova Nedelja</span>
            <div className="bg-accent/20 rounded-full p-2">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-3xl font-black text-gradient">{weeklyCheckins}</p>
          <p className="text-sm font-medium text-muted-foreground mt-1">treninga</p>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-accent/20 to-transparent rounded-tl-full" />
        </div>

        <div className="champion-card p-6 relative overflow-hidden hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ovaj Mesec</span>
            <div className="bg-blue-500/20 rounded-full p-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-gradient">{thisMonthCheckins}</p>
          <p className="text-sm font-medium text-muted-foreground mt-1">treninga</p>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-tl-full" />
        </div>

        <div className="champion-card p-6 relative overflow-hidden hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ukupno</span>
            <div className="bg-yellow-500/20 rounded-full p-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-gradient">{totalCheckins}</p>
          <p className="text-sm font-medium text-muted-foreground mt-1">treninga</p>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-yellow-500/20 to-transparent rounded-tl-full" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Member Card & QR */}
        <div className="lg:col-span-1">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl hover-lift">
            {/* Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-accent/20" />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-white/60 text-sm font-medium">MEMBER CARD</p>
                  <h3 className="text-white text-xl font-bold">PRINCIP</h3>
                </div>
                <Award className="w-8 h-8 text-white/80" />
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-6">
                <img 
                  src={qr} 
                  alt="QR kod" 
                  className="w-full max-w-[180px] mx-auto"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider">Ime člana</p>
                  <p className="text-white font-semibold">{user?.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider">ID Broj</p>
                  <p className="text-white font-mono">{userId.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider">Status</p>
                  <p className={cn(
                    "font-semibold",
                    active ? "text-green-400" : "text-red-400"
                  )}>
                    {active ? "AKTIVAN" : "NEAKTIVAN"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Training History & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Membership Info */}
          <div className="champion-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 rounded-full p-2">
                <User className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">Informacije o Članarini</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-gradient-to-br from-muted/20 to-muted/30 border border-border/50 hover:border-accent/30 transition-all duration-300">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Tip članarine</p>
                <p className="font-bold text-xl">{user?.membership?.type || "Standard"}</p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-muted/20 to-muted/30 border border-border/50 hover:border-accent/30 transition-all duration-300">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Plan</p>
                <p className="font-bold text-xl">{user?.membership?.plan || "Mesečni"}</p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-muted/20 to-muted/30 border border-border/50 hover:border-accent/30 transition-all duration-300">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Važi do</p>
                <p className="font-bold text-xl">
                  {user?.membership?.expiresAt 
                    ? new Date(user.membership.expiresAt).toLocaleDateString('sr-RS', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : "—"}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-muted/20 to-muted/30 border border-border/50 hover:border-accent/30 transition-all duration-300">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Član od</p>
                <p className="font-semibold text-lg">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('sr-RS', {
                        month: 'long',
                        year: 'numeric'
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {!active && (
              <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-400 mb-1">
                      Članarina nije aktivna
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Obnovite članarinu u klubu kako biste nastavili sa treninzima.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="champion-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 rounded-full p-2">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl font-bold">Istorija Dolazaka</h2>
            </div>
            {user?.checkins && user.checkins.length > 0 ? (
              <div className="space-y-3">
                {user.checkins.slice(0, 5).map((checkin, index) => (
                  <div key={checkin.id} className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 border border-border/50 hover:border-accent/30 transition-all duration-300 hover-scale">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Trening #{totalCheckins - index}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(checkin.createdAt).toLocaleDateString('sr-RS', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} u {new Date(checkin.createdAt).toLocaleTimeString('sr-RS', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nema zabeleženih treninga</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vaši treninzi će biti prikazani ovde
                </p>
              </div>
            )}
          </div>

          {/* Motivational Section */}
          <div className="champion-card p-10 text-center bg-gradient-to-br from-accent/10 via-primary/5 to-accent/10 border-accent/20 hover-glow">
            <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gradient-champion">Nastavi Sa Napretkom</h3>
            <p className="text-lg text-muted-foreground font-medium">
              Svaki trening te čini jačim. Disciplina danas, pobeda sutra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}