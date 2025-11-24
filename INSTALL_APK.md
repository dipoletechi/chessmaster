# Phone पर APK Install करने के तरीके

## APK Location
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Method 1: USB Cable से (सबसे आसान)

### Step 1: USB Debugging Enable करें
1. Phone में **Settings** → **About Phone** जाएं
2. **Build Number** पर 7 बार tap करें (Developer Options unlock होगा)
3. **Settings** → **Developer Options** में जाएं
4. **USB Debugging** को ON करें

### Step 2: Phone को Computer से Connect करें
- USB cable से phone को computer से connect करें
- Phone पर "Allow USB debugging?" prompt आएगा → **Allow** करें

### Step 3: ADB से Install करें
```bash
# ADB install करें (अगर नहीं है)
# Android Studio के साथ आता है, या अलग से install करें

# Phone check करें
adb devices

# APK install करें
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

## Method 2: Direct Transfer (बिना ADB)

### Step 1: APK को Phone में Transfer करें
1. APK file को phone में copy करें:
   - USB cable से
   - Bluetooth से
   - Email/WhatsApp से send करें
   - Google Drive/Dropbox में upload करें

### Step 2: Phone में Install करें
1. Phone में **File Manager** खोलें
2. APK file को find करें
3. APK पर tap करें
4. **"Install from Unknown Sources"** allow करें (अगर पहली बार है)
5. **Install** button press करें

## Method 3: Release APK Build करें (Production के लिए)

अगर Release APK चाहिए (छोटा size, optimized):

```bash
npm run build:android:apk
```

Release APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### "Install blocked" Error
- **Settings** → **Security** → **Unknown Sources** को enable करें
- या **Settings** → **Apps** → **Special Access** → **Install Unknown Apps** → अपने file manager को allow करें

### "App not installed" Error
- पहले से installed app को uninstall करें
- फिर नया APK install करें

### ADB Command Not Found
- Android Studio install करें
- या ADB को manually install करें: https://developer.android.com/tools/releases/platform-tools

## Quick Commands

```bash
# Debug APK build
npm run build:android:debug

# Release APK build  
npm run build:android:apk

# Direct install via ADB
adb install android\app\build\outputs\apk\debug\app-debug.apk

# Uninstall previous version
adb uninstall com.chessgame.app

# Install new version
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

