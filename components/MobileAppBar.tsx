"use client";
import Link from "next/link";
import { QrCode, UserPlus, LogIn, LogOut, Home, User, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

export default function MobileAppBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  
  // Dynamic links based on authentication status
  const links = [
    { href: "/", icon: Home, label: "Početna" },
    { href: "/scan", icon: QrCode, label: "Skener", primary: true },
    ...(session ? [
      { href: "/dashboard", icon: User, label: "Profil" },
      ...(isAdmin ? [{ href: "/admin", icon: Shield, label: "Admin" }] : [])
    ] : [
      { href: "/login", icon: LogIn, label: "Prijava" }
    ])
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="glass border-t border-border/50 shadow-2xl">
        <div className={cn(
          "grid gap-2 px-6 py-3 pb-safe",
          session ? (
            isAdmin ? "grid-cols-5" : "grid-cols-4"
          ) : "grid-cols-3"
        )}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 active:scale-90"
              >
                <div className={cn(
                  "relative p-2.5 rounded-xl transition-all duration-300",
                  isActive ? "bg-accent/15 border border-accent/30" : "border border-transparent",
                  link.primary && !isActive && "bg-accent/5",
                  "group-hover:bg-accent/10"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "text-accent" : "text-foreground/60",
                    "group-hover:text-accent/80"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] mt-1 font-semibold transition-all duration-300 tracking-wide",
                  isActive ? "text-accent" : "text-muted-foreground",
                  "group-hover:text-foreground"
                )}>
                  {link.label}
                </span>
              </Link>
            );
          })}
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="group flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 active:scale-90"
            >
              <div className="relative p-2.5 rounded-xl transition-all duration-300 border border-transparent group-hover:bg-accent/10">
                <LogOut className="w-5 h-5 transition-all duration-300 text-foreground/60 group-hover:text-accent/80" />
              </div>
              <span className="text-[10px] mt-1 font-semibold transition-all duration-300 tracking-wide text-muted-foreground group-hover:text-foreground">
                Odjavi se
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}