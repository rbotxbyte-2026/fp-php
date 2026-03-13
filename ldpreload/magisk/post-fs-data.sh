#!/system/bin/sh
# Magisk post-fs-data script for FPSpoof
# Runs early in boot before apps start

MODDIR=${0%/*}

# Set permissive SELinux (required for LD_PRELOAD to work across processes)
setenforce 0

# Log
echo "FPSpoof: post-fs-data.sh executed" >> /cache/fpspoof.log
