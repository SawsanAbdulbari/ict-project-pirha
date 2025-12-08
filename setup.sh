#!/bin/bash

# PIRHA Rehabilitation Guide - Setup Script
# This script sets up the development environment and installs all dependencies

echo "🏥 PIRHA Rehabilitation Guide - Setup Script"
echo "============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if pnpm is installed, if not use npm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    echo "✅ pnpm detected"
else
    PACKAGE_MANAGER="npm"
    echo "⚠️  pnpm not found, using npm (consider installing pnpm for better performance)"
    echo "   Install pnpm: npm install -g pnpm"
fi

echo ""
echo "🔧 Installing dependencies..."
echo "================================"

# Install dependencies
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm install
else
    npm install
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
else
    echo ""
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi

echo ""
echo "🚀 Starting development server..."
echo "================================="

# Start development server
if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    echo "Starting with: pnpm dev"
    echo "Press Ctrl+C to stop the server"
    echo ""
    pnpm dev
else
    echo "Starting with: npm run dev"
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
fi