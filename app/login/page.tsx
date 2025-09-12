"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Unesite valjan email";
    }
    if (!form.password) {
      newErrors.password = "Unesite šifru";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await signIn("credentials", { 
        redirect: false, 
        email: form.email, 
        password: form.password 
      });
      
      if (res?.error) {
        toast.error("Pogrešan email ili šifra");
      } else {
        toast.success("Uspešna prijava! Preusmeravanje...");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Greška pri povezivanju sa serverom");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8 min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 mb-6 animate-pulse-soft">
            <LogIn className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Dobrodošli <span className="text-gradient-champion">Nazad</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Prijavite se na vaš <span className="text-gradient-champion font-bold">PRINCIP</span> nalog
          </p>
        </div>

        <div className="champion-card p-10 animate-scale-in">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label mb-2 block">
                  Email adresa
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    className={cn(
                      "input pl-10",
                      errors.email && "border-destructive focus:ring-destructive"
                    )}
                    placeholder="petar@example.com"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="label">
                    Šifra
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Zaboravili ste šifru?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={cn(
                      "input pl-10 pr-10",
                      errors.password && "border-destructive focus:ring-destructive"
                    )}
                    placeholder="Unesite vašu šifru"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Prijavljivanje...
                  </>
                ) : (
                  <>
                    Prijavi se
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ili
                  </span>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Nemate nalog? </span>
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Registrujte se besplatno
                </Link>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-muted/30 border">
          <p className="text-sm text-center text-muted-foreground">
            Vaši podaci su sigurni sa nama. Koristimo najnovije bezbednosne protokole.
          </p>
        </div>
      </motion.div>
    </div>
  );
}