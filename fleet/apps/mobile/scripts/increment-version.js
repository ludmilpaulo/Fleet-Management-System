#!/usr/bin/env node

/**
 * Version Increment Script
 * Automatically increments app version and build numbers before building for production
 */

const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');

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

console.log('✅ Version incremented successfully!');
console.log(`   App Version: ${newVersion}`);
console.log(`   iOS Build Number: ${newIosBuild}`);
console.log(`   Android Version Code: ${newAndroidCode}`);
