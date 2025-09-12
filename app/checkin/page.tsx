'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CheckInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Ako nije ulogovan, preusmeri na login
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/checkin');
    }
  }, [status, router]);

  useEffect(() => {
    // Automatski check-in čim se stranica učita za ulogovanog korisnika
    if (session?.user && !checking && !result) {
      performCheckIn();
    }
  }, [session]);

  const performCheckIn = async () => {
    if (!session?.user) return;
    
    setChecking(true);
    setShowSuccess(false);
    
    try {
      // Simulacija malo dužeg čekanja za bolju animaciju
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (session.user as any).id,
          via: 'self-checkin'
        })
      });

      const data = await res.json();
      setResult(data);

      if (data.allowed) {
        setShowSuccess(true);
        toast.success('Uspešna prijava!');
        // Vibriraj telefon ako je moguće
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      } else {
        toast.error(data.reason || 'Članarina nije aktivna');
      }
    } catch (error) {
      toast.error('Greška pri prijavi');
      setResult({ error: true });
    } finally {
      setChecking(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-lg">Preusmeravanje na prijavu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center shadow-2xl bg-white/95 backdrop-blur">
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Princip Gym
            </h1>
            <p className="text-gray-600 mt-2">Check-In System</p>
          </div>
          
          {checking && (
            <div className="py-8">
              <div className="relative">
                {/* Spoljni krug koji rotira */}
                <div className="absolute inset-0 animate-spin">
                  <div className="h-32 w-32 mx-auto rounded-full border-4 border-transparent border-t-blue-500 border-r-indigo-500"></div>
                </div>
                
                {/* Unutrašnji krug koji rotira u suprotnom smeru */}
                <div className="absolute inset-0 animate-spin-reverse">
                  <div className="h-24 w-24 mx-auto mt-4 rounded-full border-4 border-transparent border-b-purple-500 border-l-pink-500"></div>
                </div>
                
                {/* Centralni pulsirajuči krug */}
                <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                  <div className="absolute h-16 w-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse opacity-20"></div>
                  <div className="absolute h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse opacity-40"></div>
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <p className="mt-8 text-lg font-medium text-gray-700 animate-pulse">
                Proveravam članarinu...
              </p>
            </div>
          )}

          {result && !checking && (
            <div className="py-4">
              {result.allowed ? (
                <div className="text-green-600">
                  {/* Animacija kvačice */}
                  <div className={`transition-all duration-500 ${showSuccess ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="animate-draw-circle"
                      />
                      <path
                        d="M 30 50 L 45 65 L 70 35"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw-check"
                      />
                    </svg>
                  </div>
                  
                  <div className={`transition-all duration-700 delay-300 ${showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <h2 className="text-3xl font-bold mb-2 text-gray-800">Dobrodošli!</h2>
                    <p className="text-xl mb-1 font-semibold">{result.name || session.user?.email}</p>
                    <p className="text-gray-600">Vaša prijava je zabeležena</p>
                    
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700 font-medium">
                        ✓ Članarina aktivna
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date().toLocaleString('sr-RS')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  {/* Animacija X */}
                  <div className="animate-shake">
                    <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="animate-draw-circle"
                      />
                      <path
                        d="M 35 35 L 65 65 M 65 35 L 35 65"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="animate-draw-x"
                      />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">Pristup odbijen</h2>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-lg mb-2 font-semibold text-red-700">
                      {result.reason || 'Članarina nije aktivna'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Molimo obratite se osoblju za pomoć
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null);
                  setShowSuccess(false);
                  performCheckIn();
                }}
                className="btn btn-primary mt-8 transform hover:scale-105 transition-transform"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Pokušaj ponovo
                </span>
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">Ulogovani ste kao:</p>
            <p className="font-semibold text-gray-700">{session.user?.email}</p>
            <button
              onClick={() => {
                window.location.href = '/api/auth/signout';
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline mt-2 transition-colors"
            >
              Odjavi se i koristi drugi nalog
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes draw-circle {
          0% {
            stroke-dasharray: 0 283;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 283 283;
            stroke-dashoffset: 0;
          }
        }

        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 100;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 100 100;
            stroke-dashoffset: 0;
          }
        }

        @keyframes draw-x {
          0% {
            stroke-dasharray: 0 100;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: 100 100;
            stroke-dashoffset: 0;
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-draw-circle {
          animation: draw-circle 0.8s ease-out forwards;
        }

        .animate-draw-check {
          animation: draw-check 0.5s ease-out 0.8s forwards;
          stroke-dasharray: 0 100;
        }

        .animate-draw-x {
          animation: draw-x 0.5s ease-out 0.8s forwards;
          stroke-dasharray: 0 100;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}