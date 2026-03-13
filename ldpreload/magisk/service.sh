#!/system/bin/sh
# Magisk service script for FPSpoof
# Runs after boot completes

MODDIR=${0%/*}

# Wait for boot to complete
while [ "$(getprop sys.boot_completed)" != "1" ]; do
    sleep 1
done

# Additional 5 second delay
sleep 5

echo "FPSpoof: Setting up LD_PRELOAD hooks" >> /cache/fpspoof.log

# Set LD_PRELOAD for target apps via wrap property
# These persist until reboot

# Chrome
setprop wrap.com.android.chrome "LD_PRELOAD=$MODDIR/lib64/libfpspoof.so"
setprop wrap.com.chrome.beta "LD_PRELOAD=$MODDIR/lib64/libfpspoof.so"
setprop wrap.com.chrome.dev "LD_PRELOAD=$MODDIR/lib64/libfpspoof.so"

# Other browsers
setprop wrap.com.brave.browser "LD_PRELOAD=$MODDIR/lib64/libfpspoof.so"
setprop wrap.org.bromite.bromite "LD_PRELOAD=$MODDIR/lib64/libfpspoof.so"
setprop wrap.com.kiwibrowser.browser "LD_PRELOAD=$MODDIR/lib64/libfpspoof.so"

# WebView-based apps (these work better)
# Add your target apps here:
# setprop wrap.com.example.app "LD_PRELOAD=$MODDIR/lib64/libfpspoof.so"

echo "FPSpoof: Hooks configured" >> /cache/fpspoof.log
echo "FPSpoof: Restart Chrome to apply" >> /cache/fpspoof.log

# Note: For the hook to take effect, apps must be restarted after this runs
