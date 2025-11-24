# Standalone APK Build (बिना Metro के)

## Problem:
Debug build में Expo का default UI दिख रहा है क्योंकि वो development build है जिसे Metro bundler चाहिए।

## Solution: Release Build बनाएं

### Step 1: Release APK Build करें
```bash
npm run build:android:apk
```

यह command:
1. Icons generate करेगा
2. Release APK बनाएगा (standalone, Metro की जरूरत नहीं)
3. APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Step 2: APK Install करें
APK file को phone में transfer करके install करें।

## Debug vs Release:

### Debug APK:
- Development build
- Metro bundler चाहिए
- Hot reload available
- Size: बड़ा (~200MB)

### Release APK:
- Production build
- Standalone (Metro की जरूरत नहीं)
- Optimized
- Size: छोटा

## Quick Commands:

```bash
# Standalone Release APK (recommended)
npm run build:android:apk

# Development APK (Metro चाहिए)
npm run build:android:debug
```

## Development में Run करने के लिए:

अगर development में test करना है:

1. **Metro bundler start करें:**
```bash
npm start
```

2. **Phone में app open करें** (development build install होनी चाहिए)

3. App automatically Metro से connect हो जाएगी

## Note:
Release APK standalone है - बिना Metro के काम करेगी और आपका actual app UI दिखेगा।

