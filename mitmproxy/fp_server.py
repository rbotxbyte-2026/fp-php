#!/usr/bin/env python3
"""
Simple Flask server to receive fingerprint data from the SAVE button.

Usage:
    python3 fp_server.py

Runs on: http://0.0.0.0:5555
Endpoint: POST /save
Output: fp_captured.json
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow all origins

OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fp_captured.json")

@app.route('/save', methods=['POST', 'OPTIONS'])
def save_fp():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data"}), 400
        
        url = data.get("url", "unknown")
        apis = data.get("apis", {})
        
        print(f"[FP] Received {len(apis)} APIs from {url[:50]}")
        
        # Load existing
        existing = {"captures": [], "merged_apis": {}}
        if os.path.exists(OUTPUT_FILE):
            try:
                with open(OUTPUT_FILE, "r") as f:
                    existing = json.load(f)
            except:
                pass
        
        if "captures" not in existing:
            existing["captures"] = []
        if "merged_apis" not in existing:
            existing["merged_apis"] = {}
        
        # Add capture with source
        source = data.get("source", url.split("/")[2] if "://" in url else "unknown")
        existing["captures"].append({
            "url": url,
            "source": source,
            "ts": data.get("ts", datetime.now().isoformat()),
            "unique": data.get("unique", len(apis)),
            "total": data.get("total", 0)
        })
        
        # Merge APIs with source tracking
        for k, v in apis.items():
            if k not in existing["merged_apis"]:
                existing["merged_apis"][k] = v
            else:
                existing["merged_apis"][k]["c"] = existing["merged_apis"][k].get("c", 0) + v.get("c", 0)
                vals = set(existing["merged_apis"][k].get("v", []))
                vals.update(v.get("v", []))
                existing["merged_apis"][k]["v"] = list(vals)[:5]
                # Merge sources
                srcs = set(existing["merged_apis"][k].get("src", []))
                srcs.update(v.get("src", []))
                existing["merged_apis"][k]["src"] = list(srcs)
        
        existing["last_updated"] = datetime.now().isoformat()
        existing["total_apis"] = len(existing["merged_apis"])
        
        # Save
        with open(OUTPUT_FILE, "w") as f:
            json.dump(existing, f, indent=2)
        
        print(f"[FP] ✓ Saved to {OUTPUT_FILE}")
        print(f"[FP] Total APIs: {existing['total_apis']}")
        
        return jsonify({"status": "ok", "apis": len(apis)}), 200
    
    except Exception as e:
        print(f"[FP] Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/status', methods=['GET'])
def status():
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r") as f:
            data = json.load(f)
        return jsonify({
            "total_apis": data.get("total_apis", 0),
            "captures": len(data.get("captures", [])),
            "last_updated": data.get("last_updated")
        })
    return jsonify({"total_apis": 0, "captures": 0})

@app.route('/clear', methods=['POST'])
def clear():
    if os.path.exists(OUTPUT_FILE):
        os.remove(OUTPUT_FILE)
        print("[FP] Cleared fp_captured.json")
    return jsonify({"status": "cleared"})

if __name__ == '__main__':
    print(f"[FP] Server starting on http://0.0.0.0:5555")
    print(f"[FP] Output: {OUTPUT_FILE}")
    print(f"[FP] Endpoints:")
    print(f"     POST /save   - Save fingerprint data")
    print(f"     GET  /status - Check saved data")
    print(f"     POST /clear  - Clear saved data")
    app.run(host='0.0.0.0', port=5555, debug=True)
