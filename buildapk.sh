 well fuck this than#!/bin/bash
# === Quick APK Builder for Termux ===

# Stop Gradle if it's stuck
cd android || exit
./gradlew --stop

# Clean and build APK
./gradlew clean
./gradlew assembleDebug

# Go back to root
cd ..

# Make builds folder if missing
mkdir -p ~/www

# Copy APK to served folder with timestamp
cp android/app/build/outputs/apk/debug/app-debug.apk ~/www/app-debug-$(date +%Y%m%d-%H%M%S).apk

# Print the download URL
IP=$(ip addr show wlan0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)
echo "✅ APK built!"
echo "Download it at: http://$IP:8000/app-debug-$(date +%Y%m%d-%H%M%S).apk"
