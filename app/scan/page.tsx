"use client";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, QrCode, CheckCircle, XCircle, Loader2, AlertCircle, Smartphone, CameraOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({
    type: "idle",
    message: "Priprema skenera..."
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scanningRef = useRef(false);

  useEffect(() => {
    async function startCamera() {
      try {
        setStatus({ type: "loading", message: "Pokrećem kameru..." });
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setStatus({ type: "idle", message: "Skenirajte QR kod članske karte" });
        }
      } catch (error) {
        console.error("Camera error:", error);
        setPermissionDenied(true);
        setStatus({ type: "error", message: "Kamera nije dostupna" });
        toast.error("Molimo dozvolite pristup kameri");
      }
    }
    
    startCamera();
    
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!cameraActive) return;
    
    let raf: number;
    const scan = () => {
      if (scanningRef.current) {
        raf = requestAnimationFrame(scan);
        return;
      }
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas || !video.videoWidth) {
        raf = requestAnimationFrame(scan);
        return;
      }
      
      const w = (canvas.width = video.videoWidth);
      const h = (canvas.height = video.videoHeight);
      
      if (w && h) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const code = jsQR(imageData.data, w, h, {
            inversionAttempts: "dontInvert"
          });
          
          if (code?.data && !scanningRef.current) {
            scanningRef.current = true;
            setResult(code.data);
            handleCheckin(code.data);
            
            // Reset nakon 3 sekunde
            setTimeout(() => {
              scanningRef.current = false;
              setResult("");
              setStatus({ type: "idle", message: "Skenirajte QR kod članske karte" });
            }, 3000);
          }
        }
      }
      raf = requestAnimationFrame(scan);
    };
    
    raf = requestAnimationFrame(scan);
    return () => cancelAnimationFrame(raf);
  }, [cameraActive]);

  async function handleCheckin(data: string) {
    setStatus({ type: "loading", message: "Proveravam..." });
    
    try {
      // Proveri da li je QR kod URL (za klub QR)
      if (data.startsWith('http://') || data.startsWith('https://')) {
        // Ako je URL za checkin, preusmeri na tu stranicu
        if (data.includes('/checkin')) {
          setStatus({ 
            type: "success", 
            message: "Preusmeravanje na check-in stranicu..." 
          });
          toast.success("QR kod kluba detektovan!");
          
          // Preusmeri nakon 1 sekunde
          setTimeout(() => {
            window.location.href = data;
          }, 1000);
          return;
        } else {
          setStatus({ type: "error", message: "Nepoznat URL u QR kodu" });
          toast.error("QR kod ne vodi na check-in stranicu");
          return;
        }
      }
      
      // Inače pokušaj da parsiraš kao JSON (individualni QR kod člana)
      const payload = JSON.parse(data);
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: payload.userId, via: "qr" })
      });
      
      const response = await res.json();
      
      if (res.ok && response.allowed) {
        setStatus({ 
          type: "success", 
          message: `Dobrodošli, ${response.name}!` 
        });
        toast.success(`Ulaz dozvoljen: ${response.name}`);
      } else {
        setStatus({ 
          type: "error", 
          message: response.reason || "Članarina nije aktivna" 
        });
        toast.error(response.reason || "Pristup odbijen");
      }
    } catch (error) {
      setStatus({ type: "error", message: "Nevaljan QR kod" });
      toast.error("Greška pri čitanju QR koda");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 mb-6 animate-pulse-soft">
            <QrCode className="h-10 w-10 text-accent" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            QR Kod <span className="text-gradient-champion">Skener</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Skenirajte QR kod sa članske karte za brzu evidenciju dolaska
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Camera View */}
          <div className="champion-card overflow-hidden hover-lift">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-black to-gray-900">
              {permissionDenied ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <CameraOff className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Kamera nije dostupna</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Molimo dozvolite pristup kameri u postavkama vašeg pregledača
                  </p>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                      <div className="absolute inset-0 border-2 border-primary rounded-2xl">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                      </div>
                      {cameraActive && !scanningRef.current && (
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse" />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <div className="champion-card p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="bg-accent/10 rounded-full p-2">
                  <Camera className="h-5 w-5 text-accent" />
                </div>
                Status skenera
              </h2>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={status.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "p-4 rounded-lg flex items-center gap-3",
                    status.type === "idle" && "bg-muted",
                    status.type === "loading" && "bg-blue-50 dark:bg-blue-950/20",
                    status.type === "success" && "bg-green-50 dark:bg-green-950/20",
                    status.type === "error" && "bg-red-50 dark:bg-red-950/20"
                  )}
                >
                  {status.type === "idle" && <QrCode className="h-5 w-5 text-muted-foreground" />}
                  {status.type === "loading" && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                  {status.type === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {status.type === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                  <span className={cn(
                    "font-medium",
                    status.type === "idle" && "text-muted-foreground",
                    status.type === "loading" && "text-blue-600",
                    status.type === "success" && "text-green-600",
                    status.type === "error" && "text-red-600"
                  )}>
                    {status.message}
                  </span>
                </motion.div>
              </AnimatePresence>

              {result && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">QR kod podatak:</p>
                  <code className="text-xs break-all">{result.substring(0, 100)}...</code>
                </div>
              )}
            </div>

            <div className="champion-card p-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <div className="bg-accent/10 rounded-full p-2">
                  <AlertCircle className="h-5 w-5 text-accent" />
                </div>
                Uputstvo za skeniranje
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Usmerite kameru prema QR kodu na članskoj karti</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Držite telefon mirno dok se kod ne skenira</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Skener automatski prepoznaje i obrađuje kod</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Nakon uspešnog skeniranja, dolazak se evidentira</span>
                </li>
              </ul>
            </div>

            <div className="champion-card bg-gradient-to-br from-accent/10 via-primary/5 to-accent/10 border-accent/20 p-8 hover-glow">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-full p-3">
                  <Smartphone className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Mobilna optimizacija</h4>
                  <p className="text-muted-foreground font-medium">
                    Skener radi na svim mobilnim uređajima sa kamerom
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}