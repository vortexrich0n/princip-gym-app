"use client";
import Link from "next/link";
import { QrCode, UserPlus, LogIn, Home, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MobileAppBar() {
  const pathname = usePathname();
  
  // For now, show all links - we'll handle auth state differently
  const links = [
    { href: "/", icon: Home, label: "Početna" },
    { href: "/scan", icon: QrCode, label: "Skener", primary: true },
    { href: "/dashboard", icon: User, label: "Profil" },
    { href: "/login", icon: LogIn, label: "Prijava" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="glass border-t border-border/50 shadow-2xl">
        <div className="grid grid-cols-4 gap-2 px-6 py-3 pb-safe">
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
        </div>
      </div>
    </div>
  );
}