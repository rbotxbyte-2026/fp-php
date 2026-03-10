{
  "products": {
    "identification": {
      "data": {
        "visitorId": "9L70eFpFkoNrCQ1CwiCu",
        "requestId": "1773141052219.ku7ACE",
        "browserDetails": {
          "browserName": "Chrome Mobile",
          "browserMajorVersion": "145",
          "browserFullVersion": "145.0.0",
          "os": "Android",
          "osVersion": "10",
          "device": "ONEPLUS A6010",
          "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36"
        },
        "incognito": false,
        "ip": "52.154.19.233",
        "ipLocation": {
          "accuracyRadius": 10,
          "latitude": 41.60054,
          "longitude": -93.60911,
          "postalCode": "50307",
          "timezone": "America/Chicago",
          "city": {
            "name": "Des Moines"
          },
          "country": {
            "code": "US",
            "name": "United States"
          },
          "continent": {
            "code": "NA",
            "name": "North America"
          },
          "subdivisions": [
            {
              "isoCode": "IA",
              "name": "Iowa"
            }
          ]
        },
        "timestamp": 1773141052232,
        "time": "2026-03-10T11:10:52Z",
        "url": "https://fingerprint.com/demo/",
        "tag": {
          "referrerLink": null
        },
        "confidence": {
          "score": 0.94,
          "revision": "v1.1"
        },
        "visitorFound": true,
        "firstSeenAt": {
          "global": "2026-03-07T12:08:12.698Z",
          "subscription": "2026-03-07T12:08:12.698Z"
        },
        "lastSeenAt": {
          "global": "2026-03-10T11:03:24.299Z",
          "subscription": "2026-03-10T11:03:24.299Z"
        },
        "replayed": false,
        "sdk": {
          "platform": "js",
          "version": "4.0.1",
          "integrations": [
            {
              "name": "custom-proxy-integration",
              "version": "1.0.2"
            },
            {
              "name": "custom-proxy-integration",
              "version": "1.0.4"
            },
            {
              "name": "fingerprint-pro-custom-subdomain",
              "version": "2.0.0"
            },
            {
              "name": "fingerprintjs-pro-react",
              "version": "3.0.0"
            }
          ]
        },
        "environmentId": "ae_83d51ca3dcde8777"
      }
    },
    "botd": {
      "data": {
        "bot": {
          "result": "bad",
          "type": "undetectedChromedriver"
        },
        "meta": {
          "referrerLink": null
        },
        "url": "https://fingerprint.com/demo/",
        "ip": "52.154.19.233",
        "time": "2026-03-10T11:10:52.279Z",
        "userAgent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36",
        "requestId": "1773141052219.ku7ACE"
      }
    },
    "rootApps": {
      "data": {
        "result": false
      }
    },
    "emulator": {
      "data": {
        "result": false
      }
    },
    "ipInfo": {
      "data": {
        "v4": {
          "address": "52.154.19.233",
          "geolocation": {
            "accuracyRadius": 10,
            "latitude": 41.60054,
            "longitude": -93.60911,
            "postalCode": "50307",
            "timezone": "America/Chicago",
            "city": {
              "name": "Des Moines"
            },
            "country": {
              "code": "US",
              "name": "United States"
            },
            "continent": {
              "code": "NA",
              "name": "North America"
            },
            "subdivisions": [
              {
                "isoCode": "IA",
                "name": "Iowa"
              }
            ]
          },
          "asn": {
            "asn": "8075",
            "name": "Microsoft Corporation",
            "network": "52.152.0.0/13",
            "type": "hosting"
          },
          "datacenter": {
            "result": true,
            "name": "Microsoft Azure"
          }
        }
      }
    },
    "ipBlocklist": {
      "data": {
        "result": false,
        "details": {
          "emailSpam": false,
          "attackSource": false
        }
      }
    },
    "tor": {
      "data": {
        "result": false
      }
    },
    "vpn": {
      "data": {
        "result": true,
        "confidence": "medium",
        "originTimezone": "Asia/Calcutta",
        "originCountry": "unknown",
        "methods": {
          "timezoneMismatch": true,
          "publicVPN": false,
          "auxiliaryMobile": false,
          "osMismatch": false,
          "relay": false
        }
      }
    },
    "proxy": {
      "data": {
        "result": false,
        "confidence": "high"
      }
    },
    "incognito": {
      "data": {
        "result": false
      }
    },
    "tampering": {
      "data": {
        "result": true,
        "anomalyScore": 0.9641,
        "antiDetectBrowser": false
      }
    },
    "clonedApp": {
      "data": {
        "result": false
      }
    },
    "factoryReset": {
      "data": {
        "time": "1970-01-01T00:00:00Z",
        "timestamp": 0
      }
    },
    "jailbroken": {
      "data": {
        "result": false
      }
    },
    "frida": {
      "data": {
        "result": false
      }
    },
    "privacySettings": {
      "data": {
        "result": false
      }
    },
    "virtualMachine": {
      "data": {
        "result": true
      }
    },
    "rawDeviceAttributes": {
      "data": {
        "canvas": {
          "value": {
            "Geometry": "2179b48bae2d564d33eadf7e35c993d8",
            "Text": "4f3c2de7d5faeb5c0d57d34c82572ef7",
            "Winding": true
          }
        },
        "screenFrame": {
          "value": [
            0,
            0,
            0,
            0
          ]
        },
        "openDatabase": {
          "value": false
        },
        "colorDepth": {
          "value": 24
        },
        "monochrome": {},
        "screenResolution": {
          "value": [
            832,
            384
          ]
        },
        "architecture": {
          "value": 255
        },
        "deviceMemory": {
          "value": 8
        },
        "pdfViewerEnabled": {},
        "osCpu": {},
        "touchSupport": {
          "value": {
            "maxTouchPoints": 5,
            "touchEvent": false,
            "touchStart": true
          }
        },
        "math": {
          "value": "5f030fa7d2e5f9f757bfaf81642eb1a6"
        },
        "webGlExtensions": {
          "value": -1
        },
        "dateTimeLocale": {
          "value": "en-GB"
        },
        "indexedDB": {
          "value": true
        },
        "mathML": {
          "value": {
            "bottom": 25,
            "font": "\"Times New Roman\"",
            "height": 17,
            "left": 8,
            "right": 294.125,
            "top": 8,
            "width": 286.125,
            "x": 8,
            "y": 8
          }
        },
        "cpuClass": {},
        "fonts": {
          "value": []
        },
        "forcedColors": {
          "value": false
        },
        "domBlockers": {},
        "languages": {
          "value": [
            [
              "en-IN"
            ]
          ]
        },
        "audio": {
          "value": 124.04347527516074
        },
        "webGlBasics": {},
        "fontPreferences": {
          "value": {
            "apple": 149.3125,
            "default": 149.3125,
            "min": 9.34375,
            "mono": 133.0625,
            "sans": 144.015625,
            "serif": 149.3125,
            "system": 162
          }
        },
        "vendorFlavors": {
          "value": [
            "chrome"
          ]
        },
        "cookiesEnabled": {
          "value": true
        },
        "platform": {
          "value": "Linux armv81"
        },
        "hardwareConcurrency": {
          "value": 8
        },
        "emoji": {
          "value": {
            "bottom": 26,
            "font": "\"Times New Roman\"",
            "height": 17,
            "left": 8,
            "right": 1605.078125,
            "top": 9,
            "width": 1597.078125,
            "x": 8,
            "y": 9
          }
        },
        "hdr": {
          "value": false
        },
        "timezone": {
          "value": "Asia/Calcutta"
        },
        "localStorage": {
          "value": true
        },
        "colorGamut": {
          "value": "srgb"
        },
        "audioBaseLatency": {
          "value": -2
        },
        "plugins": {
          "value": []
        },
        "sessionStorage": {
          "value": true
        },
        "vendor": {
          "value": "Google Inc."
        },
        "invertedColors": {},
        "contrast": {
          "value": 0
        },
        "reducedMotion": {
          "value": false
        },
        "privateClickMeasurement": {}
      }
    },
    "highActivity": {
      "data": {
        "result": true,
        "dailyRequests": 14
      }
    },
    "locationSpoofing": {
      "data": {
        "result": false
      }
    },
    "suspectScore": {
      "data": {
        "result": 24
      }
    },
    "velocity": {
      "data": {
        "distinctIp": {
          "intervals": {
            "5m": 1,
            "1h": 3,
            "24h": 4
          }
        },
        "distinctLinkedId": {},
        "distinctCountry": {
          "intervals": {
            "5m": 1,
            "1h": 1,
            "24h": 1
          }
        },
        "events": {
          "intervals": {
            "5m": 1,
            "1h": 9,
            "24h": 14
          }
        },
        "ipEvents": {
          "intervals": {
            "5m": 1,
            "1h": 1,
            "24h": 1
          }
        },
        "distinctIpByLinkedId": {},
        "distinctVisitorIdByLinkedId": {}
      }
    },
    "developerTools": {
      "data": {
        "result": false
      }
    },
    "mitmAttack": {
      "data": {
        "result": false
      }
    },
    "proximity": {}
  }
}