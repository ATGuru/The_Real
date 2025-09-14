#!/bin/bash
# OmniX Build & Setup Script
# Rolls installation, cache clearing, build, screen check, and backup into one.

PROJECT_DIR="$(pwd)"
BACKUP_DIR=~/GoogleDrive/OmniXBackups
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

echo "📦 Installing React Navigation packages..."
npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context

if [ $? -ne 0 ]; then
  echo "❌ npm install failed. Check your internet or npm setup."
  exit 1
fi

echo "🧹 Clearing Metro bundler cache..."
npx react-native start --reset-cache &

# Wait a few seconds for Metro to spin up
sleep 5

echo "⚒️ Building and running Android app..."
npm run android

echo ""
echo "🔍 Checking what screens exist..."
if [ -d src/screens ]; then
  echo "Screens folder found:"
  ls src/screens
else
  echo "No src/screens folder yet."
fi

echo ""
echo "📑 Registered screens in App.tsx:"
grep -E "Stack.Screen" App.tsx || echo "No screens registered in App.tsx"

echo ""
echo "💾 Creating a timestamped backup..."
mkdir -p "$BACKUP_DIR"
zip -r "$BACKUP_DIR/OmniXBackup_$TIMESTAMP.zip" "$PROJECT_DIR" > /dev/null

echo "✅ Backup saved to $BACKUP_DIR/OmniXBackup_$TIMESTAMP.zip"
echo "🎉 OmniX build process complete."
