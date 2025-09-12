
# PRINCIP – Kickboxing web app (FitPass-lite)
Modern Next.js app with email+password auth, Prisma + SQLite, QR membership, cash activation, check-in scanner, responsive UI.

## Quick start
1. Ensure Node 18+ is installed.
2. `cp .env.example .env` and set a random NEXTAUTH_SECRET.
3. `npm install`
4. Initialize DB: `npm run prisma:push`
5. Seed an admin user (see below) or register and flip role in DB.
6. `npm run dev` then open http://localhost:3000

### Make an admin
- Open `npx prisma studio`, find your user and set `role` to `ADMIN`.
- Or run a one-liner:
  ```bash
  npx prisma db execute --file ./scripts/make-admin.sql
  ```

### Cash activation flow
- User registers on /register
- You receive cash, go to /admin and mark membership Active and set expiry date
- At entrance use /scan to read their QR and auto check-in

### Production tips
- Switch SQLite to Postgres by changing DATABASE_URL and running `npm run prisma:push`
- Put the app on Vercel or any Node host
- Use a USB or phone camera for /scan station at the entrance

### Logo
- Logo is placed in /public/logo.png; replace with your file if needed.
