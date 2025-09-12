# Princip Gym App - Vodič za Deployment

## Funkcionalnosti aplikacije

✅ **Implementirane funkcionalnosti:**
- Registracija i prijava korisnika
- QR kod za svakog člana
- Skeniranje QR koda za ulazak
- Admin panel sa upravljanjem članarinama
- Automatsko istekanje članarina
- Praćenje plaćanja (keš)
- Statistika dolazaka
- Brisanje korisnika

## Korak 1: Kreiranje PostgreSQL baze na Neon.tech

1. Idi na [neon.tech](https://neon.tech) i napravi besplatan nalog
2. Klikni "Create Database"
3. Izaberi region: Europe (Frankfurt) 
4. Kopiraj connection string (počinje sa `postgresql://`)

## Korak 2: Priprema projekta za GitHub

```bash
# Inicijalizuj git ako nije već
git init

# Dodaj sve fajlove
git add .

# Commit
git commit -m "Initial commit - Princip Gym App"

# Kreiraj repository na GitHub-u i poveži
git remote add origin https://github.com/tvoj-username/princip-gym-app.git
git branch -M main
git push -u origin main
```

## Korak 3: Deploy na Vercel

1. Idi na [vercel.com](https://vercel.com) i napravi nalog
2. Klikni "Import Project"
3. Izaberi GitHub repository
4. Konfiguriši environment varijable:

### Environment Variables za Vercel:

```
DATABASE_URL = [tvoj Neon.tech connection string]
NEXTAUTH_SECRET = [generiši sa: openssl rand -base64 32]
NEXTAUTH_URL = https://tvoj-projekat.vercel.app
CRON_SECRET = [bilo koji random string]
```

## Korak 4: Migracija baze podataka

Nakon što postaviš environment varijable na Vercel:

```bash
# Lokalno postavi DATABASE_URL u .env
DATABASE_URL="tvoj-neon-connection-string"

# Pokreni migraciju
npx prisma generate
npx prisma db push

# Kreiraj admin korisnika
npx prisma studio
# Ručno postavi role na "ADMIN" za tvoj user
```

## Korak 5: Kreiranje Admin korisnika

1. Registruj se normalno kroz aplikaciju
2. Otvori Neon.tech dashboard ili Prisma Studio
3. Nađi svog korisnika u `User` tabeli
4. Promeni `role` sa "USER" na "ADMIN"

## Korak 6: Testiranje

1. **Registracija**: `/register`
2. **Prijava**: `/login`
3. **Admin panel**: `/admin` (samo za admin korisnike)
4. **QR skeniranje**: `/scan`
5. **Moj QR kod**: `/dashboard`

## Upravljanje članarinama (Admin panel)

### Aktiviranje članarine:
1. Uđi u admin panel
2. Nađi korisnika
3. Izaberi period (1, 3, 6, 12 meseci)
4. Unesi iznos koji je plaćen
5. Klikni "Aktiviraj"

### Produžavanje članarine:
1. Kod aktivnih članova klikni "Produži"
2. Izaberi dodatni period
3. Unesi iznos

### Automatsko istekanje:
- Svaki dan u 01:00 se automatski deaktiviraju istekle članarine
- Možeš i manuelno kliknuti "Deaktiviraj istekle članarine"

## Struktura baze podataka

- **Users**: Korisnici sistema
- **Memberships**: Članarine (datum isteka, status, plaćanja)
- **Checkins**: Evidencija dolazaka

## Bezbednost

- Svi passwordi su hash-ovani (bcrypt)
- QR kodovi sadrže samo user ID
- Admin funkcije zaštićene autentifikacijom
- HTTPS obavezan u produkciji

## Monitoring

Vercel automatski prikazuje:
- Broj poseta
- API performance
- Error logs
- Deployment status

## Troškovi

- **Neon.tech**: Besplatno do 3GB
- **Vercel**: Besplatno za hobby projekte
- **Ukupno**: 0 RSD/mesec za male teretane

## Podrška

Za probleme ili pitanja:
- Email: [tvoj-email]
- GitHub Issues: [link-do-repo]/issues