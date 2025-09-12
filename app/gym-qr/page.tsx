import { auth } from "@/lib/auth";
import QRCode from "qrcode";

export default async function GymQRPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  
  // Samo admin može da vidi ovu stranicu
  if (role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto card p-6">
        <p>Pristup dozvoljen samo administratoru.</p>
      </div>
    );
  }

  // URL koji će članovi skenirati - kao FitPass sistem
  const checkInUrl = "https://princip-gym-app.vercel.app/checkin";
  
  // Generiši QR kod
  const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">QR Kod za Teretanu</h1>
      
      <div className="card p-8">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Štampajte ovaj QR kod i postavite ga na ulazu</h2>
          
          <div className="bg-white p-8 rounded-lg inline-block">
            <img src={qrCodeDataUrl} alt="Gym Check-in QR Code" className="mx-auto" />
          </div>
          
          <div className="space-y-2 text-gray-600">
            <p className="font-semibold text-lg">Princip Gym - Check In</p>
            <p>Skenirajte za prijavu</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-lg mb-3">📱 Kako funkcioniše:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Članovi skeniraju ovaj QR kod svojim telefonom</li>
          <li>Otvara se stranica za prijavu</li>
          <li>Ako nisu ulogovani, sistem ih preusmerava na login</li>
          <li>Nakon logina, automatski se proverava članarina</li>
          <li>Sistem prikazuje da li mogu da uđu ili ne</li>
          <li>Svaki ulazak se beleži u bazi podataka</li>
        </ol>
      </div>

      <div className="card p-6 bg-green-50 border-green-200">
        <h3 className="font-semibold text-lg mb-3">✅ Prednosti:</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Jedan QR kod za sve članove</li>
          <li>Nema potrebe za štampanjem individualnih kartica</li>
          <li>Automatska provera članarine</li>
          <li>Evidencija svih dolazaka</li>
          <li>Članovi koriste svoj telefon</li>
        </ul>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-3">🖨️ Instrukcije za štampanje:</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Desni klik na QR kod → "Sačuvaj sliku kao..."</li>
          <li>Štampajte na A4 papiru</li>
          <li>Plastificirajte za dugotrajnost</li>
          <li>Postavite na vidljivom mestu na ulazu</li>
          <li>Opcionalno: Dodajte instrukcije ispod QR koda</li>
        </ol>
      </div>

      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Za štampanje:</p>
        <p className="font-semibold">Pritisnite Ctrl+P (Windows) ili Cmd+P (Mac)</p>
      </div>
    </div>
  );
}

// CSS za štampanje
export const metadata = {
  title: 'Gym QR Code - Princip Gym',
};