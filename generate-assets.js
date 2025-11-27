#!/usr/bin/env node

/**
 * Fleet Management System - Asset Generation Script
 * Generates PNG assets from SVG sources using sharp library
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;

// Check if sharp is available (try multiple locations)
let sharp;
const sharpPaths = [
  'sharp',
  path.join(SCRIPT_DIR, 'fleet/apps/web/node_modules/sharp'),
  path.join(SCRIPT_DIR, 'node_modules/sharp')
];

for (const sharpPath of sharpPaths) {
  try {
    sharp = require(sharpPath);
    break;
  } catch (e) {
    // Try next path
  }
}

if (!sharp) {
  console.error('❌ Error: sharp package not found.');
  console.error('   Please install it: npm install sharp --save-dev');
  console.error('   Or run: cd fleet/apps/web && npm install sharp');
  console.error('   Sharp is used by Next.js, so it should be in fleet/apps/web/node_modules/');
  process.exit(1);
}

const WEB_DIR = path.join(SCRIPT_DIR, 'fleet/apps/web/public');
const MOBILE_DIR = path.join(SCRIPT_DIR, 'fleet/apps/mobile/assets');

async function convertSvgToPng(inputPath, outputPath, width, height, backgroundColor = null) {
  try {
    if (!fs.existsSync(inputPath)) {
      console.warn(`   ⚠ ${path.basename(inputPath)} not found`);
      return false;
    }

    const options = {
      width,
      height,
      ...(backgroundColor && { background: backgroundColor })
    };

    await sharp(inputPath)
      .resize(width, height, {
        fit: 'contain',
        background: backgroundColor || { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);

    return true;
  } catch (error) {
    console.error(`   ❌ Error converting ${inputPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Generating Fleet Management System Assets...\n');

  // Mobile App Assets
  console.log('📱 Generating Mobile App Assets...');
  
  // App Icon (1024x1024)
  if (await convertSvgToPng(
    path.join(MOBILE_DIR, 'logo-icon.svg'),
    path.join(MOBILE_DIR, 'icon.png'),
    1024, 1024, '#ffffff'
  )) {
    console.log('   ✓ Created icon.png (1024x1024)');
    
    // Copy as adaptive-icon
    fs.copyFileSync(
      path.join(MOBILE_DIR, 'icon.png'),
      path.join(MOBILE_DIR, 'adaptive-icon.png')
    );
    console.log('   ✓ Created adaptive-icon.png');
  }

  // Splash Screen (1242x2208)
  if (await convertSvgToPng(
    path.join(MOBILE_DIR, 'splash-screen.svg'),
    path.join(MOBILE_DIR, 'splash-icon.png'),
    1242, 2208, '#030712'
  )) {
    console.log('   ✓ Created splash-icon.png (1242x2208)');
  }

  // Mobile Favicon (180x180)
  if (await convertSvgToPng(
    path.join(MOBILE_DIR, 'logo-icon.svg'),
    path.join(MOBILE_DIR, 'favicon.png'),
    180, 180, '#ffffff'
  )) {
    console.log('   ✓ Created favicon.png (180x180)');
  }

  console.log('');

  // Web Assets
  console.log('🌐 Generating Web Assets...');

  // Favicon 16x16
  if (await convertSvgToPng(
    path.join(WEB_DIR, 'favicon.svg'),
    path.join(WEB_DIR, 'favicon-16x16.png'),
    16, 16, null
  )) {
    console.log('   ✓ Created favicon-16x16.png');
  }

  // Favicon 32x32
  if (await convertSvgToPng(
    path.join(WEB_DIR, 'favicon.svg'),
    path.join(WEB_DIR, 'favicon-32x32.png'),
    32, 32, null
  )) {
    console.log('   ✓ Created favicon-32x32.png');
  }

  // Apple Touch Icon (180x180)
  if (await convertSvgToPng(
    path.join(WEB_DIR, 'favicon.svg'),
    path.join(WEB_DIR, 'apple-touch-icon.png'),
    180, 180, '#ffffff'
  )) {
    console.log('   ✓ Created apple-touch-icon.png');
  }

  // Web Logo variants
  const logoSizes = [
    { size: 200, name: 'logo-200.png' },
    { size: 400, name: 'logo-400.png' },
    { size: 800, name: 'logo-800.png' }
  ];

  for (const { size, name } of logoSizes) {
    if (await convertSvgToPng(
      path.join(WEB_DIR, 'logo.svg'),
      path.join(WEB_DIR, name),
      size, size, null
    )) {
      console.log(`   ✓ Created ${name} (${size}x${size})`);
    }
  }

  // Main logo (400x400)
  if (fs.existsSync(path.join(WEB_DIR, 'logo-400.png'))) {
    fs.copyFileSync(
      path.join(WEB_DIR, 'logo-400.png'),
      path.join(WEB_DIR, 'logo.png')
    );
    console.log('   ✓ Created logo.png');
  }

  console.log('');
  console.log('✅ Asset generation complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Review generated PNG files');
  console.log('   2. For favicon.ico, visit: https://realfavicongenerator.net/');
  console.log('   3. Test icons on actual devices');
  console.log('   4. Update app.json and HTML metadata if needed');
}

main().catch(console.error);

