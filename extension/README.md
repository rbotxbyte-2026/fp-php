# FP Spoofer Chrome Extension

A Chrome extension to import and spoof browser fingerprint values using the exact format from `output.json`.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `extension` folder

## Usage

1. Click the extension icon in Chrome toolbar
2. Click "Import JSON Profile" and select your `output.json` file
3. Enable the "Spoofing" toggle
4. Reload any page to apply spoofed values

## What Gets Spoofed

The extension spoofs the following fingerprint signals:

### Navigator
- `userAgent`, `platform`, `language`, `languages`
- `hardwareConcurrency`, `deviceMemory`
- `maxTouchPoints`, `vendor`, `webdriver`
- `plugins`, `mimeTypes`
- `userAgentData` (Client Hints)

### Screen
- `width`, `height`, `availWidth`, `availHeight`
- `colorDepth`, `pixelDepth`
- `devicePixelRatio`, `innerWidth`, `innerHeight`

### Canvas
- Adds noise to canvas fingerprinting attempts

### WebGL
- `vendor`, `renderer` (unmasked values)
- Various WebGL parameters

### Audio
- AudioContext fingerprint modification

### Battery
- `charging`, `level`, `chargingTime`, `dischargingTime`

### Timezone
- `Intl.DateTimeFormat` timezone
- `Date.getTimezoneOffset()`

### Media Queries
- `prefers-color-scheme`
- `prefers-reduced-motion`
- `pointer`, `hover` capabilities

### WebRTC
- Prevents local IP leaks

### Fonts
- `document.fonts.check()` spoofing

### Performance
- Timer resolution modification

## JSON Format

The extension expects the same JSON format as `output.json`:

```json
{
  "server": {
    "user_agent": "...",
    "ip": "...",
    ...
  },
  "client": {
    "navigator": {
      "userAgent": "...",
      "platform": "...",
      ...
    },
    "screen": {
      "width": 1920,
      "height": 1080,
      ...
    },
    "webgl": {
      "vendor": "...",
      "renderer": "...",
      ...
    },
    ...
  }
}
```

## Notes

- The extension must reload the page to apply changes
- Some fingerprinting methods may still detect the real browser
- For maximum effectiveness, use in combination with other privacy tools
- WebRTC IP leaks are blocked by default when spoofing is enabled

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic (import/export)
- `content.js` - Fingerprint spoofing injection
- `background.js` - Service worker for config injection
