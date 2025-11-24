# APK Build Instructions

## Step 1: Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

## Step 2: Login to Expo Account
```bash
eas login
```
(Agar account nahi hai to `eas register` se account banao)

## Step 3: Configure EAS Build
```bash
eas build:configure
```

## Step 4: Build APK for Android

### Preview/Development APK (Testing ke liye):
```bash
eas build --platform android --profile preview
```

### Production APK (Final release ke liye):
```bash
eas build --platform android --profile production
```

## Step 5: Download APK
- Build complete hone ke baad, EAS dashboard se APK download kar sakte ho
- Ya terminal me link milega download karne ke liye

## Alternative: Local Build (Faster, but requires Android Studio)
```bash
eas build --platform android --profile preview --local
```

## Notes:
- Pehli baar build me 10-15 minutes lag sakte hain
- APK file `.apk` extension me milega
- APK ko directly Android phone me install kar sakte ho

