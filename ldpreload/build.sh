#!/bin/bash
# Build LD_PRELOAD library for Android
# Requires: Android NDK

set -e

# Find NDK (common locations)
if [ -z "$ANDROID_NDK" ]; then
    for path in \
        "$HOME/Android/Sdk/ndk"/* \
        "$HOME/Library/Android/sdk/ndk"/* \
        "/opt/android-ndk"* \
        "$ANDROID_HOME/ndk"/*; do
        if [ -d "$path" ]; then
            ANDROID_NDK="$path"
            break
        fi
    done
fi

if [ -z "$ANDROID_NDK" ] || [ ! -d "$ANDROID_NDK" ]; then
    echo "Error: Android NDK not found"
    echo "Set ANDROID_NDK environment variable or install NDK via Android Studio"
    echo ""
    echo "Quick install:"
    echo "  brew install android-ndk  # macOS"
    echo "  # Or download from: https://developer.android.com/ndk/downloads"
    exit 1
fi

echo "Using NDK: $ANDROID_NDK"

# Create output directories
mkdir -p libs/arm64-v8a
mkdir -p libs/armeabi-v7a
mkdir -p libs/x86_64
mkdir -p obj

# Toolchain paths
TOOLCHAIN="$ANDROID_NDK/toolchains/llvm/prebuilt"
if [ "$(uname)" = "Darwin" ]; then
    TOOLCHAIN="$TOOLCHAIN/darwin-x86_64"
elif [ "$(uname)" = "Linux" ]; then
    TOOLCHAIN="$TOOLCHAIN/linux-x86_64"
fi

# API level (Android 7.0+)
API=24

# Common flags
CFLAGS="-fPIC -O2 -Wall -DANDROID"
LDFLAGS="-shared -llog -ldl"

echo ""
echo "Building for arm64-v8a (64-bit ARM)..."
$TOOLCHAIN/bin/aarch64-linux-android${API}-clang \
    $CFLAGS \
    -o libs/arm64-v8a/libfpspoof.so \
    fpspoof.c \
    $LDFLAGS

echo "Building for armeabi-v7a (32-bit ARM)..."
$TOOLCHAIN/bin/armv7a-linux-androideabi${API}-clang \
    $CFLAGS \
    -o libs/armeabi-v7a/libfpspoof.so \
    fpspoof.c \
    $LDFLAGS

echo "Building for x86_64 (emulator)..."
$TOOLCHAIN/bin/x86_64-linux-android${API}-clang \
    $CFLAGS \
    -o libs/x86_64/libfpspoof.so \
    fpspoof.c \
    $LDFLAGS

echo ""
echo "Build complete!"
echo ""
ls -la libs/*/libfpspoof.so
echo ""
echo "Next steps:"
echo "  adb push libs/arm64-v8a/libfpspoof.so /data/local/tmp/"
echo "  ./hook.sh com.android.chrome 64"
