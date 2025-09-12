# 📱 PRISTUP SA TELEFONA I DRUGIH UREĐAJA

## 🌐 Lokalna mreža pristup

Aplikacija je dostupna na sledećim adresama:

### Na tvom računaru:
- http://localhost:3000

### Sa telefona ili drugog uređaja na istoj WiFi mreži:
- **http://172.30.40.51:3000**

## 📲 Kako pristupiti sa telefona:

1. **Proveri da li su telefon i računar na istoj WiFi mreži**
2. **Otvori browser na telefonu** (Chrome, Safari, etc.)
3. **Ukucaj adresu:** `http://172.30.40.51:3000`
4. **Aplikacija će se učitati!**

## 🎯 Funkcionalnosti dostupne na telefonu:

- ✅ Registracija i prijava
- ✅ QR kod skeniranje (kamera)
- ✅ Dashboard pregled
- ✅ Dark/Light tema
- ✅ Responsive dizajn
- ✅ PWA instalacija (Add to Home Screen)

## 🔧 Ako ne radi:

1. **Proveri Windows Firewall:**
   - Dozvoli Node.js kroz firewall
   - Port 3000 mora biti otvoren

2. **Proveri IP adresu:**
   ```bash
   ipconfig
   ```
   Traži IPv4 adresu za tvoj WiFi adapter

3. **Restartuj server sa mrežnim pristupom:**
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

## 📌 Napomene:

- QR skeniranje zahteva HTTPS za produkciju
- Na lokalnoj mreži HTTP je OK za testiranje
- Aplikacija je potpuno responzivna
- Radi na iOS i Android uređajima

## 🚀 Za produkciju:

Za javni pristup van lokalne mreže, koristi:
- Vercel deployment
- Ngrok tunel
- Port forwarding na ruteru

---

**Tvoja lokalna IP adresa:** `172.30.40.51`
**Port:** `3000`
**Puna adresa za telefon:** `http://172.30.40.51:3000`