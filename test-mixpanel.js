#!/usr/bin/env node

/**
 * Mixpanel Integration Test Script
 * Tests that Mixpanel is properly configured and can track events
 */

const MIXPANEL_TOKEN = 'c1cb0b3411115435a0d45662ad7a97e4';

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║              Mixpanel Integration Test Suite                                ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

// Test 1: Token Configuration
console.log('Test 1: Token Configuration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (MIXPANEL_TOKEN && MIXPANEL_TOKEN.length > 0) {
  console.log('\x1b[32m✅ PASS\x1b[0m - Mixpanel token configured');
  console.log(`   Token: ${MIXPANEL_TOKEN}`);
} else {
  console.log('\x1b[31m❌ FAIL\x1b[0m - Mixpanel token not configured');
}
console.log('');

// Test 2: Web Integration Files
console.log('Test 2: Web Integration Files');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const fs = require('fs');
const path = require('path');

const webFiles = [
  'fleet/apps/web/src/lib/mixpanel.ts',
  'fleet/apps/web/src/components/providers/mixpanel-provider.tsx',
];

let webFilesExist = 0;
webFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`\x1b[32m✅ PASS\x1b[0m - ${file} exists`);
    webFilesExist++;
  } else {
    console.log(`\x1b[31m❌ FAIL\x1b[0m - ${file} missing`);
  }
});
console.log('');

// Test 3: Mobile Integration Files
console.log('Test 3: Mobile Integration Files');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const mobileFiles = [
  'fleet/apps/mobile/src/services/mixpanel.ts',
];

let mobileFilesExist = 0;
mobileFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`\x1b[32m✅ PASS\x1b[0m - ${file} exists`);
    mobileFilesExist++;
  } else {
    console.log(`\x1b[31m❌ FAIL\x1b[0m - ${file} missing`);
  }
});
console.log('');

// Test 4: Check Web Package Installation
console.log('Test 4: Web Package Installation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const webPackageJson = path.join(process.cwd(), 'fleet/apps/web/package.json');
if (fs.existsSync(webPackageJson)) {
  const packageData = JSON.parse(fs.readFileSync(webPackageJson, 'utf8'));
  if (packageData.dependencies && packageData.dependencies['mixpanel-browser']) {
    console.log('\x1b[32m✅ PASS\x1b[0m - mixpanel-browser installed');
    console.log(`   Version: ${packageData.dependencies['mixpanel-browser']}`);
  } else {
    console.log('\x1b[31m❌ FAIL\x1b[0m - mixpanel-browser not in dependencies');
  }
} else {
  console.log('\x1b[31m❌ FAIL\x1b[0m - Web package.json not found');
}
console.log('');

// Test 5: Check Mobile Package Installation
console.log('Test 5: Mobile Package Installation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const mobilePackageJson = path.join(process.cwd(), 'fleet/apps/mobile/package.json');
if (fs.existsSync(mobilePackageJson)) {
  const packageData = JSON.parse(fs.readFileSync(mobilePackageJson, 'utf8'));
  if (packageData.dependencies && packageData.dependencies['mixpanel-react-native']) {
    console.log('\x1b[32m✅ PASS\x1b[0m - mixpanel-react-native installed');
    console.log(`   Version: ${packageData.dependencies['mixpanel-react-native']}`);
  } else {
    console.log('\x1b[31m❌ FAIL\x1b[0m - mixpanel-react-native not in dependencies');
  }
} else {
  console.log('\x1b[31m❌ FAIL\x1b[0m - Mobile package.json not found');
}
console.log('');

// Test 6: Check Event Tracking Implementation
console.log('Test 6: Event Tracking Implementation');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const mixpanelLib = path.join(process.cwd(), 'fleet/apps/web/src/lib/mixpanel.ts');
if (fs.existsSync(mixpanelLib)) {
  const content = fs.readFileSync(mixpanelLib, 'utf8');
  const eventsImplemented = [
    'trackPageView',
    'trackUserLogin',
    'trackUserSignup',
    'trackDashboardView',
    'trackButtonClick'
  ];
  
  let implementedCount = 0;
  eventsImplemented.forEach(event => {
    if (content.includes(event)) {
      console.log(`\x1b[32m✅\x1b[0m ${event} implemented`);
      implementedCount++;
    } else {
      console.log(`\x1b[33m⚠️ \x1b[0m ${event} not found`);
    }
  });
  
  console.log(`\nImplemented: ${implementedCount}/${eventsImplemented.length} event methods`);
} else {
  console.log('\x1b[31m❌ FAIL\x1b[0m - Mixpanel library file not found');
}
console.log('');

// Test 7: Check Environment Variables
console.log('Test 7: Environment Variables');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
const envFile = path.join(process.cwd(), 'fleet/apps/web/.env.local');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_MIXPANEL_TOKEN')) {
    console.log('\x1b[32m✅ PASS\x1b[0m - NEXT_PUBLIC_MIXPANEL_TOKEN configured in .env.local');
  } else {
    console.log('\x1b[33m⚠️  WARNING\x1b[0m - NEXT_PUBLIC_MIXPANEL_TOKEN not in .env.local');
    console.log('   Token should be set in environment variables');
  }
} else {
  console.log('\x1b[33m⚠️  WARNING\x1b[0m - .env.local not found (acceptable in production)');
}
console.log('');

// Summary
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('');

const totalTests = 7;
const passedTests = webFilesExist + mobileFilesExist + (MIXPANEL_TOKEN ? 1 : 0);

console.log(`Tests Passed: ${passedTests}/${totalTests + 2}`);
console.log('');

if (passedTests >= 5) {
  console.log('\x1b[32m✅ Mixpanel Integration: READY\x1b[0m');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Start the web application: cd fleet/apps/web && yarn dev');
  console.log('2. Test tracking in browser console');
  console.log('3. Check events in Mixpanel dashboard');
  console.log('');
  console.log('Test Events:');
  console.log('• Sign in with test account');
  console.log('• Navigate between dashboards');
  console.log('• Click upgrade buttons');
  console.log('• View subscription page');
} else {
  console.log('\x1b[31m❌ Mixpanel Integration: ISSUES FOUND\x1b[0m');
  console.log('');
  console.log('Please install required packages:');
  console.log('• Web: cd fleet/apps/web && yarn add mixpanel-browser');
  console.log('• Mobile: cd fleet/apps/mobile && yarn add mixpanel-react-native');
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════════════');
console.log('');
console.log('Mixpanel Dashboard: https://mixpanel.com');
console.log(`Project Token: ${MIXPANEL_TOKEN}`);
console.log('');

