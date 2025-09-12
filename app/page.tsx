"use client";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  Users, 
  Clock, 
  Target, 
  Dumbbell, 
  Heart,
  Shield,
  Award,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  QrCode
} from "lucide-react";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <div className="relative min-h-screen" ref={containerRef}>
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center -mt-20 -mx-[calc((100vw-100%)/2)]">
        {/* Background Image with Parallax */}
        <motion.div 
          style={{ y }}
          className="absolute inset-0 z-0 w-screen"
        >
          <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=3000')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
        </motion.div>
        
        {/* Content */}
        <motion.div 
          style={{ opacity }}
          className="relative z-10 flex items-center justify-center min-h-screen px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl w-full"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Image
                src="/logo.png"
                alt="Princip Kickboxing"
                width={200}
                height={200}
                className="mx-auto filter drop-shadow-2xl"
                priority
              />
            </motion.div>

            <h1 className="text-6xl sm:text-7xl md:text-9xl font-black mb-4 text-white tracking-tighter">
              <span className="bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
                PRINCIP
              </span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-red-400 mb-3 font-bold tracking-[0.3em] uppercase">
              KICKBOXING KLUB
            </p>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
              Gde se kuju šampioni. Pridruži se elitnoj zajednici boraca.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-5 rounded-xl font-bold text-base sm:text-lg transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl hover:shadow-red-500/25 hover:scale-105"
              >
                <span className="relative z-10">Postani Šampion</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <Link
                href="/scan"
                className="group relative overflow-hidden border-2 border-white/60 text-white px-10 py-5 rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-500 flex items-center justify-center gap-3 backdrop-blur-md"
              >
                <QrCode className="w-5 h-5" />
                <span>QR Check-In</span>
              </Link>
              <Link
                href="/login"
                className="group relative overflow-hidden border-2 border-white/60 text-white px-10 py-5 rounded-xl font-bold text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-md"
              >
                <span>Članovi</span>
              </Link>
            </div>

          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gradient-hero">
              Zašto Baš Mi?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-xl font-medium">
              Decenija iskustva u stvaranju šampiona
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Profesionalni Treneri",
                description: "Licencirani treneri sa međunarodnim iskustvom",
                icon: Trophy,
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=500"
              },
              {
                title: "Moderna Oprema",
                description: "Najsavremenija oprema i prostorije",
                icon: Dumbbell,
                image: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=500"
              },
              {
                title: "Fleksibilni Termini",
                description: "Treninzi prilagođeni vašem rasporedu",
                icon: Clock,
                image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=500"
              },
              {
                title: "Personalizovan Pristup",
                description: "Plan treninga kreiran samo za vas",
                icon: Target,
                image: "https://images.unsplash.com/photo-1517438322307-e67111335449?q=80&w=500"
              },
              {
                title: "Zajednica",
                description: "Porodica koja motiviše i podržava",
                icon: Users,
                image: "https://images.unsplash.com/photo-1623874514711-0f321325f318?q=80&w=500"
              },
              {
                title: "Dokazani Rezultati",
                description: "Stotine transformisanih života",
                icon: Award,
                image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=500"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="champion-card group hover-lift cursor-pointer"
                >
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
                  </div>
                  <div className="relative z-10 p-8 h-full flex flex-col justify-end min-h-[320px]">
                    <div className="bg-accent/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors duration-300">{feature.title}</h3>
                    <p className="text-gray-200 font-medium">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Training Programs Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gradient-hero">
              Programi Treninga
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-xl font-medium">
              Od početnika do profesionalaca
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: "Početnici", 
                time: "3x nedeljno", 
                focus: "Osnove tehnike",
                intensity: 1,
                color: "from-green-400 to-green-600"
              },
              { 
                name: "Srednji nivo", 
                time: "4x nedeljno", 
                focus: "Tehnika i snaga",
                intensity: 2,
                color: "from-blue-400 to-blue-600"
              },
              { 
                name: "Napredni", 
                time: "5x nedeljno", 
                focus: "Takmičenja",
                intensity: 3,
                color: "from-purple-400 to-purple-600"
              },
              { 
                name: "Kids", 
                time: "2x nedeljno", 
                focus: "Zabava i disciplina",
                intensity: 1,
                color: "from-yellow-400 to-orange-500"
              }
            ].map((program, index) => (
              <motion.div
                key={program.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card hover-lift cursor-pointer overflow-hidden group"
              >
                <div className={`h-3 bg-gradient-to-r ${program.color} group-hover:h-4 transition-all duration-300`} />
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-accent transition-colors duration-300">{program.name}</h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{program.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">{program.focus}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "h-1 w-full rounded-full",
                          i < program.intensity 
                            ? `bg-gradient-to-r ${program.color}`
                            : "bg-gray-200 dark:bg-gray-700"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517438322307-e67111335449?q=80&w=2000')] bg-cover bg-center bg-fixed" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10+", label: "Godina Iskustva" },
              { number: "500+", label: "Aktivnih Članova" },
              { number: "50+", label: "Šampiona" },
              { number: "1000+", label: "Transformacija" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-6xl md:text-7xl font-black text-transparent bg-gradient-to-r from-red-400 to-white bg-clip-text mb-3">
                  {stat.number}
                </h3>
                <p className="text-white text-xl font-semibold uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gradient-hero">
              Spreman za Promenu?
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-10 font-medium">
              Prvi trening je besplatan. Bez obaveza.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn btn-primary px-10 py-5 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Zakaži Besplatan Trening
              </Link>
              <Link
                href="/login"
                className="btn btn-outline px-10 py-5 text-lg font-bold hover:scale-105 transition-all duration-300"
              >
                Već Sam Član
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 border-t bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Lokacija</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Bulevar Oslobođenja 123<br />
                  21000 Novi Sad
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Radno Vreme</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Pon-Pet: 07:00 - 22:00<br />
                  Subota: 09:00 - 20:00<br />
                  Nedelja: 10:00 - 18:00
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Kontakt</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tel: +381 21 123 456<br />
                  Email: info@princip-kickboxing.rs
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}