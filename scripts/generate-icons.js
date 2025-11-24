const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Android icon sizes (in dp, converted to pixels)
const sizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const androidResPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

async function generateIcons() {
  try {
    // Source files
    const foregroundPath = path.join(__dirname, '..', 'assets', 'images', 'android-icon-foreground.png');
    const backgroundPath = path.join(__dirname, '..', 'assets', 'images', 'android-icon-background.png');
    const monochromePath = path.join(__dirname, '..', 'assets', 'images', 'android-icon-monochrome.png');
    const mainIconPath = path.join(__dirname, '..', 'assets', 'images', 'chess-logo.png');

    // Check if source files exist
    if (!fs.existsSync(foregroundPath)) {
      console.log('⚠️  android-icon-foreground.png not found, using chess-logo.png');
    }
    if (!fs.existsSync(backgroundPath)) {
      console.log('⚠️  android-icon-background.png not found');
    }

    // Use main icon if foreground doesn't exist
    const sourceForeground = fs.existsSync(foregroundPath) ? foregroundPath : mainIconPath;
    const sourceBackground = fs.existsSync(backgroundPath) ? backgroundPath : null;
    const sourceMonochrome = fs.existsSync(monochromePath) ? monochromePath : sourceForeground;

    console.log('🎨 Generating Android icons...\n');

    // Generate icons for each density
    for (const [folder, size] of Object.entries(sizes)) {
      const folderPath = path.join(androidResPath, folder);
      
      // Ensure folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // Generate foreground icon
      await sharp(sourceForeground)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 100 })
        .toFile(path.join(folderPath, 'ic_launcher_foreground.webp'));

      // Generate background icon (if exists)
      if (sourceBackground) {
        await sharp(sourceBackground)
          .resize(size, size, { fit: 'cover' })
          .webp({ quality: 100 })
          .toFile(path.join(folderPath, 'ic_launcher_background.webp'));
      } else {
        // Create solid color background
        await sharp({
          create: {
            width: size,
            height: size,
            channels: 4,
            background: { r: 26, g: 26, b: 46, alpha: 1 } // #1a1a2e
          }
        })
        .webp({ quality: 100 })
        .toFile(path.join(folderPath, 'ic_launcher_background.webp'));
      }

      // Generate monochrome icon
      await sharp(sourceMonochrome)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .greyscale()
        .webp({ quality: 100 })
        .toFile(path.join(folderPath, 'ic_launcher_monochrome.webp'));

      // Generate combined launcher icon (for non-adaptive)
      await sharp(sourceForeground)
        .resize(size, size, { fit: 'contain', background: { r: 26, g: 26, b: 46, alpha: 1 } })
        .webp({ quality: 100 })
        .toFile(path.join(folderPath, 'ic_launcher.webp'));

      // Generate round launcher icon
      await sharp(sourceForeground)
        .resize(size, size, { fit: 'contain', background: { r: 26, g: 26, b: 46, alpha: 1 } })
        .webp({ quality: 100 })
        .toFile(path.join(folderPath, 'ic_launcher_round.webp'));

      console.log(`✅ Generated icons for ${folder} (${size}x${size})`);
    }

    console.log('\n✨ All icons generated successfully!');
    console.log('📱 Now rebuild your APK: npm run build:android:debug\n');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

