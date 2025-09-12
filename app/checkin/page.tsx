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
    try {
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
        toast.success('Uspešna prijava!');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Učitavanje...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Preusmeravanje na prijavu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          <h1 className="text-3xl font-bold mb-6">Princip Gym Check-In</h1>
          
          {checking && (
            <div>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
              <p className="mt-4 text-lg">Proveravam članarinu...</p>
            </div>
          )}

          {result && !checking && (
            <div>
              {result.allowed ? (
                <div className="text-green-600">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold mb-2">Dobrodošli!</h2>
                  <p className="text-lg mb-1">{result.name || session.user.email}</p>
                  <p className="text-sm text-gray-600">Vaša prijava je zabeležena</p>
                  <p className="text-xs text-gray-500 mt-4">
                    {new Date().toLocaleString('sr-RS')}
                  </p>
                </div>
              ) : (
                <div className="text-red-600">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-2xl font-bold mb-2">Članarina nije aktivna</h2>
                  <p className="text-lg mb-4">{result.reason || 'Molimo obnovite članarinu'}</p>
                  <p className="text-sm">Obratite se osoblju za pomoć</p>
                </div>
              )}

              <button
                onClick={() => {
                  setResult(null);
                  performCheckIn();
                }}
                className="btn btn-primary mt-8"
              >
                Pokušaj ponovo
              </button>
            </div>
          )}

          <div className="mt-8 text-sm text-gray-600">
            <p>Ulogovani ste kao:</p>
            <p className="font-semibold">{session.user?.email}</p>
            <button
              onClick={() => {
                window.location.href = '/api/auth/signout';
              }}
              className="text-primary hover:underline mt-2"
            >
              Odjavi se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}