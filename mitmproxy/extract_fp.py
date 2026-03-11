#!/usr/bin/env python3
"""Extract fingerprint data from traffic.mitm"""

from mitmproxy import io
from mitmproxy.http import HTTPFlow
import json

with open('traffic.mitm', 'rb') as f:
    reader = io.FlowReader(f)
    count = 0
    fp_data = None
    
    for flow in reader.stream():
        if not isinstance(flow, HTTPFlow):
            continue
        count += 1
        print(f'{count}. {flow.request.method} {flow.request.pretty_url[:80]}')
        
        if flow.request.method == 'POST' and flow.request.content:
            try:
                data = json.loads(flow.request.content)
                if 'navigator' in data and 'screen' in data:
                    fp_data = data
                    print(f'   ^^^ FINGERPRINT DATA FOUND ({len(data)} keys)')
            except:
                pass
    
    print(f'\nTotal HTTP flows: {count}')
    
    if fp_data:
        with open('fp_extracted.json', 'w') as out:
            json.dump(fp_data, out, indent=2)
        print(f'=== SAVED to fp_extracted.json ===')
        print(f'Categories: {len(fp_data)}')
        print(f'Keys: {list(fp_data.keys())[:10]}...')
    else:
        print('No fingerprint data found in traffic.mitm')
