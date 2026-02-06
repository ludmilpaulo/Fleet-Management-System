#!/usr/bin/env node

/**
 * Pre-build Hook
 * Automatically increments version numbers before EAS build
 * This hook is called automatically by EAS Build before building
 */

const fs = require('fs');
const path = require('path');

// Only increment if building for production
const isProduction = process.env.EAS_BUILD_PROFILE === 'production';

if (!isProduction) {
  console.log('ℹ️  Skipping version increment (not a production build)');
  process.exit(0);
}

// EAS runs from the mobile app directory, so app.json should be in the current directory
// But also handle case where script might be run from project root
let appJsonPath = path.join(__dirname, '..', 'app.json');
if (!fs.existsSync(appJsonPath)) {
  // Try from current working directory
  appJsonPath = path.join(process.cwd(), 'app.json');
  if (!fs.existsSync(appJsonPath)) {
    // Try from project root
    appJsonPath = path.join(process.cwd(), 'fleet', 'apps', 'mobile', 'app.json');
  }
}

if (!fs.existsSync(appJsonPath)) {
  console.error('❌ Error: Could not find app.json');
  process.exit(1);
}

// Read app.json
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Parse current version (e.g., "1.0.0" -> [1, 0, 0])
const versionParts = appJson.expo.version.split('.').map(Number);

// Increment patch version (1.0.0 -> 1.0.1)
versionParts[2] = (versionParts[2] || 0) + 1;

// If patch exceeds 9, increment minor
if (versionParts[2] > 9) {
  versionParts[2] = 0;
  versionParts[1] = (versionParts[1] || 0) + 1;
}

// If minor exceeds 9, increment major
if (versionParts[1] > 9) {
  versionParts[1] = 0;
  versionParts[0] = (versionParts[0] || 0) + 1;
}

const newVersion = versionParts.join('.');

// Increment iOS build number
const currentIosBuild = parseInt(appJson.expo.ios.buildNumber || '1', 10);
const newIosBuild = currentIosBuild + 1;

// Increment Android version code
const currentAndroidCode = parseInt(appJson.expo.android?.versionCode || '1', 10);
const newAndroidCode = currentAndroidCode + 1;

// Update app.json
appJson.expo.version = newVersion;
appJson.expo.ios.buildNumber = newIosBuild.toString();
if (!appJson.expo.android) {
  appJson.expo.android = {};
}
appJson.expo.android.versionCode = newAndroidCode;

// Write back to file
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

console.log('✅ Version auto-incremented for production build:');
console.log(`   App Version: ${newVersion}`);
console.log(`   iOS Build Number: ${newIosBuild}`);
console.log(`   Android Version Code: ${newAndroidCode}`);
