#!/bin/bash

echo "==================================="
echo "Princip Gym App - Production Setup"
echo "==================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from example..."
    cp .env.production.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file with your database URL from Neon.tech"
    echo "Press Enter after you've updated the .env file..."
    read
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📊 Pushing database schema to PostgreSQL..."
npx prisma db push

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a GitHub repository"
echo "2. Push code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/princip-gym-app.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Import project from GitHub"
echo "   - Add environment variables"
echo "   - Deploy!"
echo ""
echo "4. Create admin user:"
echo "   - Register normally in the app"
echo "   - Run: npx prisma studio"
echo "   - Change user role to 'ADMIN'"