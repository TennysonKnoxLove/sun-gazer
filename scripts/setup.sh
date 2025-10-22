#!/bin/bash

# SunGazer Setup Script
# This script sets up the development environment

echo "🌞 Setting up SunGazer..."

# Check Node.js version
echo "Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Create necessary directories
mkdir -p dist
mkdir -p build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your backend URL in .env"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run 'npm run electron:dev' to start Electron app"
echo ""
echo "For more information, see README.md or QUICKSTART.md"

