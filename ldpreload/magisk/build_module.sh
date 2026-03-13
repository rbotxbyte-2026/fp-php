#!/bin/bash
# Build Magisk module package for FPSpoof

set -e
cd "$(dirname "$0")"

echo "Building FPSpoof Magisk Module..."

# First build the .so files
cd ..
chmod +x build.sh
./build.sh

# Create module structure
cd magisk
mkdir -p lib64 lib

# Copy libraries
cp ../libs/arm64-v8a/libfpspoof.so lib64/
cp ../libs/armeabi-v7a/libfpspoof.so lib/

# Make scripts executable
chmod +x post-fs-data.sh service.sh 2>/dev/null || true

# Create META-INF for Magisk
mkdir -p META-INF/com/google/android
cat > META-INF/com/google/android/updater-script << 'EOF'
#MAGISK
EOF

cat > META-INF/com/google/android/update-binary << 'BINARY'
#!/sbin/sh

TMPDIR=/dev/tmp
MOUNTPATH=/dev/magisk_img

# Default permissions
umask 022

# Initial cleanup
rm -rf $TMPDIR 2>/dev/null
mkdir -p $TMPDIR

# echo before loading util_functions
ui_print() { echo "$1"; }

require_new_magisk() {
  ui_print "*******************************"
  ui_print " Please install Magisk v20.4+! "
  ui_print "*******************************"
  exit 1
}

# Mount magisk.img or use /data/adb/modules
mount_magisk_img() {
  if [ -d /data/adb/modules ]; then
    MOUNTPATH=/data/adb/modules
  else
    [ -d $MOUNTPATH ] || mkdir -p $MOUNTPATH
  fi
}

# Unzip files
unzip -o "$ZIPFILE" -d $TMPDIR >&2

# Module info
MODID=`grep_prop id $TMPDIR/module.prop`
MODNAME=`grep_prop name $TMPDIR/module.prop`

# Print mod name
ui_print " "
ui_print "******************************"
ui_print " Installing $MODNAME"
ui_print "******************************"

# Copy module files
mount_magisk_img

MODPATH=$MOUNTPATH/$MODID
rm -rf $MODPATH 2>/dev/null
mkdir -p $MODPATH
cp -af $TMPDIR/* $MODPATH/
rm -rf $MODPATH/META-INF

# Set permissions
set_perm() {
  chown $2:$3 $1 || return 1
  chmod $4 $1 || return 1
}

set_perm_recursive() {
  find $1 -type d 2>/dev/null | while read dir; do
    set_perm $dir $2 $3 $4
  done
  find $1 -type f 2>/dev/null | while read file; do
    set_perm $file $2 $3 $5
  done
}

set_perm_recursive $MODPATH 0 0 0755 0644
set_perm $MODPATH/lib64/libfpspoof.so 0 0 0644
set_perm $MODPATH/lib/libfpspoof.so 0 0 0644
set_perm $MODPATH/service.sh 0 0 0755
set_perm $MODPATH/post-fs-data.sh 0 0 0755

ui_print "- Done"
ui_print " "
ui_print "******************************"
ui_print " Reboot to activate"
ui_print "******************************"
exit 0
BINARY

chmod +x META-INF/com/google/android/update-binary

# Create zip
ZIP_NAME="FPSpoof-Magisk-v1.0.zip"
rm -f "$ZIP_NAME" 2>/dev/null
zip -r "$ZIP_NAME" \
    module.prop \
    post-fs-data.sh \
    service.sh \
    lib64/ \
    lib/ \
    META-INF/

echo ""
echo "Created: magisk/$ZIP_NAME"
echo ""
echo "Install via Magisk Manager:"
echo "1. Transfer $ZIP_NAME to device"
echo "2. Open Magisk Manager"
echo "3. Modules → Install from storage"
echo "4. Select the zip"
echo "5. Reboot"
echo ""
echo "After reboot, restart Chrome to apply hooks."
echo "Check logs: adb shell cat /cache/fpspoof.log"
