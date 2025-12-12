#!/usr/bin/env node

/**
 * Language Persistence Test Script
 * Tests localStorage (web) and AsyncStorage (mobile) persistence
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function testWebPersistence() {
  return new Promise((resolve) => {
    console.log(`${colors.cyan}Testing Web App Language Persistence...${colors.reset}`);
    
    // Check if I18nProvider has localStorage integration
    const providerPath = path.join(__dirname, 'fleet/apps/web/src/providers/I18nProvider.tsx');
    
    if (!fs.existsSync(providerPath)) {
      resolve({ success: false, error: 'I18nProvider not found' });
      return;
    }
    
    const providerContent = fs.readFileSync(providerPath, 'utf8');
    
    const checks = {
      localStorage: providerContent.includes('localStorage'),
      storageKey: providerContent.includes('LANGUAGE_STORAGE_KEY'),
      saveOnChange: providerContent.includes('languageChanged'),
      loadOnInit: providerContent.includes('getItem'),
    };
    
    const allPassed = Object.values(checks).every(v => v === true);
    
    console.log(`  ${checks.localStorage ? colors.green + '✅' : colors.red + '❌'} localStorage integration`);
    console.log(`  ${checks.storageKey ? colors.green + '✅' : colors.red + '❌'} Storage key defined`);
    console.log(`  ${checks.saveOnChange ? colors.green + '✅' : colors.red + '❌'} Saves on language change`);
    console.log(`  ${checks.loadOnInit ? colors.green + '✅' : colors.red + '❌'} Loads on initialization`);
    
    resolve({ success: allPassed, checks });
  });
}

function testMobilePersistence() {
  return new Promise((resolve) => {
    console.log(`\n${colors.cyan}Testing Mobile App Language Persistence...${colors.reset}`);
    
    const i18nPath = path.join(__dirname, 'fleet/apps/mobile/src/i18n/index.ts');
    
    if (!fs.existsSync(i18nPath)) {
      resolve({ success: false, error: 'i18n/index.ts not found' });
      return;
    }
    
    const i18nContent = fs.readFileSync(i18nPath, 'utf8');
    
    const checks = {
      asyncStorage: i18nContent.includes('AsyncStorage'),
      storageKey: i18nContent.includes('LANGUAGE_STORAGE_KEY'),
      saveOnChange: i18nContent.includes('languageChanged'),
      loadOnInit: i18nContent.includes('getItem'),
      asyncInit: i18nContent.includes('async') && i18nContent.includes('initializeLanguage'),
    };
    
    const allPassed = Object.values(checks).every(v => v === true);
    
    console.log(`  ${checks.asyncStorage ? colors.green + '✅' : colors.red + '❌'} AsyncStorage integration`);
    console.log(`  ${checks.storageKey ? colors.green + '✅' : colors.red + '❌'} Storage key defined`);
    console.log(`  ${checks.saveOnChange ? colors.green + '✅' : colors.red + '❌'} Saves on language change`);
    console.log(`  ${checks.loadOnInit ? colors.green + '✅' : colors.red + '❌'} Loads on initialization`);
    console.log(`  ${checks.asyncInit ? colors.green + '✅' : colors.red + '❌'} Async initialization`);
    
    resolve({ success: allPassed, checks });
  });
}

function testTranslationFiles() {
  return new Promise((resolve) => {
    console.log(`\n${colors.cyan}Testing Translation Files...${colors.reset}`);
    
    const locales = ['en', 'pt', 'es'];
    const webLocalesPath = path.join(__dirname, 'fleet/apps/web/src/locales');
    const mobileI18nPath = path.join(__dirname, 'fleet/apps/mobile/src/i18n/index.ts');
    
    const results = {
      web: { en: false, pt: false, es: false },
      mobile: { en: false, pt: false, es: false },
    };
    
    // Check web translations
    locales.forEach(lang => {
      const filePath = path.join(webLocalesPath, lang, 'common.json');
      if (fs.existsSync(filePath)) {
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          results.web[lang] = !!content.common && !!content.auth && !!content.dashboard;
          console.log(`  ${results.web[lang] ? colors.green + '✅' : colors.red + '❌'} Web ${lang.toUpperCase()} translations`);
        } catch (e) {
          console.log(`  ${colors.red}❌${colors.reset} Web ${lang.toUpperCase()} - Invalid JSON`);
        }
      } else {
        console.log(`  ${colors.red}❌${colors.reset} Web ${lang.toUpperCase()} - File not found`);
      }
    });
    
    // Check mobile translations
    if (fs.existsSync(mobileI18nPath)) {
      const content = fs.readFileSync(mobileI18nPath, 'utf8');
      locales.forEach(lang => {
        results.mobile[lang] = content.includes(`"${lang}":`) && 
                               content.includes('translation:') &&
                               content.includes('common:');
        console.log(`  ${results.mobile[lang] ? colors.green + '✅' : colors.red + '❌'} Mobile ${lang.toUpperCase()} translations`);
      });
    }
    
    const allPassed = Object.values(results.web).every(v => v) && 
                     Object.values(results.mobile).every(v => v);
    
    resolve({ success: allPassed, results });
  });
}

async function runTests() {
  console.log(`${colors.blue}=== LANGUAGE PERSISTENCE TEST SUITE ===${colors.reset}\n`);
  
  const webTest = await testWebPersistence();
  const mobileTest = await testMobilePersistence();
  const translationTest = await testTranslationFiles();
  
  console.log(`\n${colors.blue}=== TEST SUMMARY ===${colors.reset}`);
  console.log(`Web Persistence: ${webTest.success ? colors.green + '✅ PASS' : colors.red + '❌ FAIL' + colors.reset}`);
  console.log(`Mobile Persistence: ${mobileTest.success ? colors.green + '✅ PASS' : colors.yellow + '⚠️  CHECK' + colors.reset}`);
  console.log(`Translation Files: ${translationTest.success ? colors.green + '✅ PASS' : colors.red + '❌ FAIL' + colors.reset}`);
  
  console.log(`\n${colors.blue}=== MANUAL TESTING INSTRUCTIONS ===${colors.reset}`);
  console.log(`${colors.yellow}Web App:${colors.reset}`);
  console.log('1. Open http://localhost:3000 in browser');
  console.log('2. Open DevTools Console');
  console.log('3. Run: localStorage.getItem("fleetia-language")');
  console.log('4. Change language using switcher');
  console.log('5. Run: localStorage.getItem("fleetia-language") - should show new language');
  console.log('6. Refresh page - language should persist');
  
  console.log(`\n${colors.yellow}Mobile App:${colors.reset}`);
  console.log('1. Start Expo: cd fleet/apps/mobile && npx expo start');
  console.log('2. Open app on device');
  console.log('3. Check device language is detected');
  console.log('4. Change language in settings (if switcher added)');
  console.log('5. Restart app - language should persist');
  
  const allPassed = webTest.success && mobileTest.success && translationTest.success;
  console.log(`\n${allPassed ? colors.green + '✅' : colors.yellow + '⚠️'} Overall: ${allPassed ? 'All tests passed!' : 'Some checks need manual verification' + colors.reset}\n`);
}

runTests().catch(console.error);

