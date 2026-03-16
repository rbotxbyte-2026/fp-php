#!/usr/bin/env python3
"""
Convert fp_captured.json to CSV format.

Usage:
    python3 json_to_csv.py                     # Uses fp_captured.json
    python3 json_to_csv.py input.json          # Custom input
    python3 json_to_csv.py input.json out.csv  # Custom output
"""

import json
import csv
import sys
import os

def json_to_csv(input_file="fp_captured.json", output_file=None):
    # Default output name
    if output_file is None:
        output_file = input_file.replace('.json', '.csv')
    
    # Load JSON
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Get merged APIs
    apis = data.get("merged_apis", {})
    
    if not apis:
        print("No APIs found in JSON")
        return
    
    # Write CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow([
            'category',
            'property', 
            'type',
            'count',
            'values',
            'sources'
        ])
        
        # Data rows
        for key, info in sorted(apis.items()):
            # Split key into category.property
            parts = key.split('.', 1)
            category = parts[0]
            prop = parts[1] if len(parts) > 1 else ''
            
            # Get values
            api_type = info.get('t', 'unknown')
            count = info.get('c', 0)
            values = info.get('v', [])
            sources = info.get('src', [])
            
            # Format values and sources as semicolon-separated
            values_str = '; '.join(str(v)[:100] for v in values)
            sources_str = '; '.join(sources) if sources else ''
            
            writer.writerow([
                category,
                prop,
                api_type,
                count,
                values_str,
                sources_str
            ])
    
    print(f"✓ Converted {len(apis)} APIs to {output_file}")
    
    # Also create a captures summary CSV
    captures = data.get("captures", [])
    if captures:
        captures_file = output_file.replace('.csv', '_captures.csv')
        with open(captures_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['timestamp', 'source', 'url', 'unique_apis', 'total_calls'])
            for cap in captures:
                writer.writerow([
                    cap.get('ts', ''),
                    cap.get('source', ''),
                    cap.get('url', '')[:100],
                    cap.get('unique', 0),
                    cap.get('total', 0)
                ])
        print(f"✓ Saved {len(captures)} captures to {captures_file}")

if __name__ == '__main__':
    # Get file paths from arguments
    input_file = sys.argv[1] if len(sys.argv) > 1 else "fp_captured.json"
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        sys.exit(1)
    
    json_to_csv(input_file, output_file)
