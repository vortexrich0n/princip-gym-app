"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Shield } from "lucide-react";

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      // Check if we're in the hero section (dark background)
      setIsDark(scrollY < window.innerHeight - 100);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const links = [
    { href: "/", label: "Početna", icon: null, showAlways: true },
    ...(!session ? [
      { href: "/register", label: "Postani Član", icon: null, showAlways: false },
      { href: "/login", label: "Prijava", icon: <User className="w-4 h-4" />, showAlways: false }
    ] : []),
    ...(session ? [
      { href: "/dashboard", label: "Moj Nalog", icon: <User className="w-4 h-4" />, showAlways: false },
      { href: "/scan", label: "Skener", icon: null, showAlways: false },
      ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: <Shield className="w-4 h-4" />, showAlways: false }] : [])
    ] : [])
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setIsOpen(false);
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled ? "glass border-b border-border/50 shadow-lg" : "bg-transparent"
      )}>
        <div className="container">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group z-50">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl group-hover:bg-accent/30 transition-all duration-500" />
                <Image 
                  src="/logo.png" 
                  alt="Princip Kickboxing" 
                  width={48} 
                  height={48} 
                  className="relative transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight text-gradient-champion">
                  PRINCIP
                </h1>
                <p className="text-xs font-semibold text-muted-foreground tracking-wider">
                  KICKBOXING KLUB
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-1 py-2 text-sm font-semibold transition-all duration-300 hover:text-accent flex items-center gap-2",
                    pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.icon}
                  <span className="relative z-10">{link.label}</span>
                  {pathname === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-accent/10 rounded-lg border border-accent/20"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
              {session && (
                <button
                  onClick={handleLogout}
                  className="relative px-1 py-2 text-sm font-semibold transition-all duration-300 hover:text-accent text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Odjavi se</span>
                </button>
              )}
              <div className="ml-4 pl-4 border-l">
                <ThemeToggle />
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-4 lg:hidden z-50">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-12 h-12 flex items-center justify-center rounded-xl hover:bg-accent/10 transition-all duration-300 group"
                aria-label="Toggle menu"
              >
                <div className="relative w-7 h-6">
                  <span 
                    className={cn(
                      "absolute block h-0.5 w-7 bg-foreground rounded-full transition-all duration-500 ease-out",
                      isOpen ? "rotate-45 translate-y-2.5" : "translate-y-0"
                    )}
                  />
                  <span 
                    className={cn(
                      "absolute block h-0.5 w-7 bg-foreground rounded-full top-2.5 transition-all duration-300",
                      isOpen ? "opacity-0 translate-x-3" : "opacity-100"
                    )}
                  />
                  <span 
                    className={cn(
                      "absolute block h-0.5 w-7 bg-foreground rounded-full top-5 transition-all duration-500 ease-out",
                      isOpen ? "-rotate-45 -translate-y-2.5" : "translate-y-0"
                    )}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Fullscreen */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/98 backdrop-blur-3xl"
            />
            <nav className="relative h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-8">
                {links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "text-3xl font-bold transition-all duration-300 hover:scale-110 flex items-center gap-3",
                        pathname === link.href
                          ? "text-gradient-champion"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.icon && <span className="text-2xl">{link.icon}</span>}
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {session && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: (links.length) * 0.1 }}
                  >
                    <button
                      onClick={handleLogout}
                      className="text-3xl font-bold transition-all duration-300 hover:scale-110 flex items-center gap-3 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="w-8 h-8" />
                      Odjavi se
                    </button>
                  </motion.div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}