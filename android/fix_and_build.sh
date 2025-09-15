BEGIN SCRIPT
  #!/usr/bin/env bash
  set -euo pipefail

  cd ~/Desktop/The-Real/android

  # Ensure Java 17 (best effort; ok if this does
  nothing)

  if command -v readlink >/dev/null 2>&1 && command
  -v which >/dev/null 2>&1; then
  JAVA_BIN="$(readlink -f "$(which java)" || true)"
  if [ -n "${JAVA_BIN:-}" ]; then
  export JAVA_HOME="$(dirname "$(dirname
  "$JAVA_BIN")")"
  export PATH="$JAVA_HOME/bin:$PATH"
  fi
  fi

  # Align Gradle wrapper to 8.4

  ./gradlew wrapper --gradle-version 8.4
  --distribution-type all || true
  sed -i 's|^distributionUrl=.*|
  distributionUrl=https://services.gradle.org/
  distributions/gradle-8.4-all.zip|' gradle/wrapper/
  gradle-wrapper.properties

  # Overwrite app/build.gradle with a clean version

  cat > app/build.gradle << 'EOG'
  apply plugin: "com.android.application"
  apply plugin: "org.jetbrains.kotlin.android"
  apply plugin: "com.facebook.react"

  apply from: "../../node_modules/@react-
  native-community/cli-platform-android/
  native_modules.gradle"
  applyNativeModulesAppBuildGradle(project)

  android {
  ndkVersion rootProject.ext.ndkVersion
  buildToolsVersion
  rootProject.ext.buildToolsVersion
  compileSdk rootProject.ext.compileSdkVersion

  namespace "com.omnix"

  defaultConfig {
  applicationId "com.omnix"
  minSdk rootProject.ext.minSdkVersion
  targetSdk rootProject.ext.targetSdkVersion
  versionCode 1
  versionName "1.0"
  }

  compileOptions {
  sourceCompatibility JavaVersion.VERSION_17
  targetCompatibility JavaVersion.VERSION_17
  }
  kotlinOptions {
  jvmTarget = '17'
  }

  packagingOptions {
  resources {
  excludes += ["/META-INF/{AL2.0,LGPL2.1}"]
  }
  }
  }

  dependencies {
  implementation(platform("com.facebook.react:react-
  android-bom:0.74.7"))
  implementation("com.facebook.react:react-android")
  implementation("com.facebook.react:react-codegen")

  if (hermesEnabled.toBoolean()) {
  implementation("com.facebook.react:hermes-
  android")
  } else {
  implementation jscFlavor
  }
  }
  EOG

  # Stop daemons, clean, and build (low memory
  flags)

  ./gradlew --stop || true
  ./gradlew clean --no-daemon
  ./gradlew assembleDebug --no-daemon -x lint -x
  test --max-workers=1

  APK="app/build/outputs/apk/debug/app-debug.apk"
  if [ -f "$APK" ]; then
  echo "Built APK: $PWD/$APK"
  else
  echo "Build finished but APK not found. Check
  Gradle output above."
  fi
  END SCRIPT
