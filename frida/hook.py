#!/usr/bin/env python3
"""
Frida Fingerprint Spoofer - Python Launcher

Simple wrapper to hook Chrome with fingerprint spoofing.

Usage:
    python3 hook.py                     # Hook Chrome
    python3 hook.py -p com.chrome.beta  # Hook Chrome Beta
    python3 hook.py -a                  # Attach to running Chrome
"""

import sys
import os
import argparse
import subprocess
import time

def check_frida():
    """Check if frida-tools is installed"""
    try:
        import frida
        return frida.__version__
    except ImportError:
        return None

def check_device():
    """Check for connected device"""
    try:
        result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
        lines = result.stdout.strip().split('\n')
        for line in lines[1:]:
            if 'device' in line and 'offline' not in line:
                return line.split()[0]
    except:
        pass
    return None

def start_frida_server():
    """Start frida-server on device"""
    print("[*] Starting frida-server...")
    subprocess.run(['adb', 'shell', 'su', '-c', 'pkill -f frida-server'], 
                   capture_output=True)
    time.sleep(1)
    subprocess.Popen(['adb', 'shell', 'su', '-c', '/data/local/tmp/frida-server &'],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

def hook_app(package, script, attach=False):
    """Hook application with Frida"""
    import frida
    
    script_path = os.path.join(os.path.dirname(__file__), script)
    
    if not os.path.exists(script_path):
        print(f"[-] Script not found: {script_path}")
        sys.exit(1)
    
    with open(script_path, 'r') as f:
        script_code = f.read()
    
    print(f"[*] {'Attaching to' if attach else 'Spawning'} {package}...")
    
    device = frida.get_usb_device()
    
    if attach:
        session = device.attach(package)
    else:
        pid = device.spawn([package])
        session = device.attach(pid)
        device.resume(pid)
    
    script_obj = session.create_script(script_code)
    
    def on_message(message, data):
        if message['type'] == 'send':
            print(f"[→] {message['payload']}")
        elif message['type'] == 'error':
            print(f"[!] {message['stack']}")
    
    script_obj.on('message', on_message)
    script_obj.load()
    
    print("")
    print("═" * 60)
    print("  HOOK ACTIVE - Press Ctrl+C to detach")
    print("═" * 60)
    print("")
    
    try:
        sys.stdin.read()
    except KeyboardInterrupt:
        print("\n[*] Detaching...")
        session.detach()

def main():
    parser = argparse.ArgumentParser(description='Frida Fingerprint Spoofer')
    parser.add_argument('-p', '--package', default='com.android.chrome',
                        help='Package name (default: com.android.chrome)')
    parser.add_argument('-s', '--script', default='combined.js',
                        help='Script to inject (default: combined.js)')
    parser.add_argument('-a', '--attach', action='store_true',
                        help='Attach to running app instead of spawning')
    parser.add_argument('--start-server', action='store_true',
                        help='Start frida-server on device')
    
    args = parser.parse_args()
    
    print("")
    print("═" * 60)
    print("  FRIDA FINGERPRINT SPOOFER")
    print("═" * 60)
    print("")
    
    # Check frida
    version = check_frida()
    if not version:
        print("[-] frida not installed. Run: pip3 install frida-tools")
        sys.exit(1)
    print(f"[+] Frida version: {version}")
    
    # Check device
    device = check_device()
    if not device:
        print("[-] No device connected")
        print("    Connect device and enable USB debugging")
        sys.exit(1)
    print(f"[+] Device: {device}")
    
    # Start frida-server if requested
    if args.start_server:
        start_frida_server()
    
    print(f"[+] Package: {args.package}")
    print(f"[+] Script: {args.script}")
    print("")
    
    # Hook
    hook_app(args.package, args.script, args.attach)

if __name__ == '__main__':
    main()
