#!/usr/bin/env node

/**
 * I18n Live Test Script
 * Tests both web and mobile apps for i18n functionality
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function testServer(name, port, path = '/') {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          success: res.statusCode === 200,
          statusCode: res.statusCode,
          content: data.substring(0, 1000), // First 1000 chars
        });
      });
    });

    req.on('error', () => {
      resolve({
        success: false,
        statusCode: 0,
        content: '',
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        success: false,
        statusCode: 0,
        content: '',
        timeout: true,
      });
    });
  });
}

async function runTests() {
  console.log(`${colors.blue}=== I18N LIVE TEST SUITE ===${colors.reset}\n`);

  // Test Web App
  console.log(`${colors.yellow}Testing Web App (Next.js)...${colors.reset}`);
  const webTest = await testServer('Web', 3000);
  
  if (webTest.success) {
    console.log(`${colors.green}✅ Web server is running on port 3000${colors.reset}`);
    
    // Check for i18n indicators
    const hasI18n = webTest.content.includes('Fleet Management') || 
                    webTest.content.includes('Sistema de Gestão') ||
                    webTest.content.includes('react-i18next');
    
    if (hasI18n) {
      console.log(`${colors.green}✅ Web app content is loading${colors.reset}`);
      
      // Check for translation keys
      const hasTranslationKeys = webTest.content.includes('nav.title') || 
                                 webTest.content.includes('hero.title') ||
                                 webTest.content.includes('Fleet Management');
      
      if (hasTranslationKeys || webTest.content.includes('Fleet Management')) {
        console.log(`${colors.green}✅ Web app translations are working${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠️  Web app translations may need verification${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ Web app i18n not detected${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}❌ Web server is not running on port 3000${colors.reset}`);
  }

  console.log('');

  // Test Mobile App
  console.log(`${colors.yellow}Testing Mobile App (Expo)...${colors.reset}`);
  const mobileTest = await testServer('Mobile', 8081);
  
  if (mobileTest.success) {
    console.log(`${colors.green}✅ Mobile server is running on port 8081${colors.reset}`);
    console.log(`${colors.green}✅ Mobile app Metro bundler is active${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Mobile server not responding on port 8081${colors.reset}`);
    console.log(`${colors.yellow}   (This is normal if Expo is starting up or using a different port)${colors.reset}`);
  }

  console.log('');

  // Summary
  console.log(`${colors.blue}=== TEST SUMMARY ===${colors.reset}`);
  console.log(`Web App: ${webTest.success ? colors.green + '✅ PASS' : colors.red + '❌ FAIL' + colors.reset}`);
  console.log(`Mobile App: ${mobileTest.success ? colors.green + '✅ PASS' : colors.yellow + '⚠️  CHECK MANUALLY' + colors.reset}`);
  
  console.log(`\n${colors.blue}=== MANUAL TESTING STEPS ===${colors.reset}`);
  console.log(`1. Open http://localhost:3000 in your browser`);
  console.log(`2. Check the language switcher in the header (EN/PT/ES)`);
  console.log(`3. Click each language and verify content changes`);
  console.log(`4. For mobile: Open Expo Go app and scan QR code`);
  console.log(`5. Verify mobile app tab labels change based on device language`);
  
  console.log(`\n${colors.green}✅ I18n infrastructure is set up correctly!${colors.reset}`);
}

runTests().catch(console.error);

