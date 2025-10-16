#!/bin/bash

echo "🥛 Installing Milk Wala App Dependencies..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing npm packages..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation completed successfully!"
    echo ""
    echo "🚀 To start the app, run:"
    echo "   npm start"
    echo ""
    echo "Then press:"
    echo "   - 'w' for web (desktop/mobile browser)"
    echo "   - 'a' for Android"
    echo "   - 'i' for iOS"
    echo ""
else
    echo ""
    echo "❌ Installation failed. Please check the errors above."
    exit 1
fi
