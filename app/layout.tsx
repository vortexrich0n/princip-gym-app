import "./globals.css";
import Nav from "@/components/Nav";
import MobileAppBar from "@/components/MobileAppBar";
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Princip Gym | Modern Fitness Management",
  description: "Profesionalni sistem za upravljanje članarinama. QR kod check-in, moderna platforma za iOS i Android.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Princip Gym",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await auth();
  return (
    <html lang="sr" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen antialiased")}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Nav />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t bg-card/50 backdrop-blur-sm mb-20 lg:mb-0">
              <div className="container py-8">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gradient">PRINCIP</span>
                    <span className="text-sm text-muted-foreground">Kickboxing & Fitness</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Sva prava zadržana
                  </p>
                </div>
              </div>
            </footer>
            <MobileAppBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}