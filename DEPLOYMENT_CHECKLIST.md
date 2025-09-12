# Deployment Checklist za Princip Gym App

## 1. Migracija baze podataka
- [ ] Prebaci sa SQLite na PostgreSQL
- [ ] Update DATABASE_URL u .env
- [ ] Testiraj migracije lokalno

## 2. Environment varijable
- [ ] NEXTAUTH_URL (production URL)
- [ ] NEXTAUTH_SECRET (generiši novi)
- [ ] DATABASE_URL (PostgreSQL connection string)

## 3. Bezbednost
- [ ] Dodaj rate limiting na API routes
- [ ] Implementiraj CORS policy
- [ ] Dodaj input validaciju na sve forme
- [ ] Email verifikacija za nove korisnike

## 4. Funkcionalnosti
- [ ] Email servis (SendGrid/Resend)
- [ ] Payment gateway (Stripe/local provider)
- [ ] Backup strategija
- [ ] Error monitoring (Sentry)

## 5. Performance
- [ ] Image optimization
- [ ] Lazy loading komponenti
- [ ] Database indexi

## Komande za deployment:

### Vercel deployment:
```bash
npm install -g vercel
vercel
```

### Build za produkciju:
```bash
npm run build
npm start
```

### Database migracija:
```bash
npx prisma migrate deploy
```