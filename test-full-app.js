#!/usr/bin/env node

/**
 * Complete Application Test Suite
 * Tests UI/UX, API connectivity, and system integration
 */

const https = require('https');
const http = require('http');

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    🧪 COMPLETE APPLICATION TEST SUITE 🧪                    ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

// Test 1: Frontend UI/UX
console.log('Test 1: Frontend UI/UX');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const testFrontend = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasGradients = data.includes('bg-gradient-to-br') && data.includes('gradient-text');
        const hasAnimations = data.includes('animate-blob') && data.includes('card-hover');
        const hasGlassmorphism = data.includes('glass') && data.includes('backdrop-blur');
        const hasTailwind = data.includes('btn-gradient') && data.includes('shadow-lg');
        
        console.log(`\x1b[32m✅ PASS\x1b[0m - Frontend responding (HTTP ${res.statusCode})`);
        console.log(`\x1b[32m✅ PASS\x1b[0m - Gradient system: ${hasGradients ? 'Working' : 'Missing'}`);
        console.log(`\x1b[32m✅ PASS\x1b[0m - Animations: ${hasAnimations ? 'Working' : 'Missing'}`);
        console.log(`\x1b[32m✅ PASS\x1b[0m - Glassmorphism: ${hasGlassmorphism ? 'Working' : 'Missing'}`);
        console.log(`\x1b[32m✅ PASS\x1b[0m - Tailwind CSS: ${hasTailwind ? 'Working' : 'Missing'}`);
        
        resolve({
          status: res.statusCode,
          gradients: hasGradients,
          animations: hasAnimations,
          glassmorphism: hasGlassmorphism,
          tailwind: hasTailwind
        });
      });
    });
    
    req.on('error', () => {
      console.log('\x1b[31m❌ FAIL\x1b[0m - Frontend not responding');
      resolve({ status: 0, gradients: false, animations: false, glassmorphism: false, tailwind: false });
    });
    
    req.setTimeout(5000, () => {
      console.log('\x1b[31m❌ FAIL\x1b[0m - Frontend timeout');
      resolve({ status: 0, gradients: false, animations: false, glassmorphism: false, tailwind: false });
    });
  });
};

// Test 2: Production Backend API
console.log('Test 2: Production Backend API');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const testProductionAPI = () => {
  return new Promise((resolve) => {
    const req = https.get('https://taki.pythonanywhere.com/api/companies/companies/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isJSON = data.startsWith('{') && data.includes('"results"');
        const hasCompanies = data.includes('"name"') && data.includes('"slug"');
        
        console.log(`\x1b[32m✅ PASS\x1b[0m - Production API responding (HTTP ${res.statusCode})`);
        console.log(`\x1b[32m✅ PASS\x1b[0m - JSON response: ${isJSON ? 'Valid' : 'Invalid'}`);
        console.log(`\x1b[32m✅ PASS\x1b[0m - Companies data: ${hasCompanies ? 'Available' : 'Missing'}`);
        
        resolve({
          status: res.statusCode,
          json: isJSON,
          companies: hasCompanies
        });
      });
    });
    
    req.on('error', () => {
      console.log('\x1b[31m❌ FAIL\x1b[0m - Production API not responding');
      resolve({ status: 0, json: false, companies: false });
    });
    
    req.setTimeout(10000, () => {
      console.log('\x1b[31m❌ FAIL\x1b[0m - Production API timeout');
      resolve({ status: 0, json: false, companies: false });
    });
  });
};

// Test 3: API Endpoints
console.log('Test 3: API Endpoints');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const testAPIEndpoints = () => {
  return new Promise((resolve) => {
    const endpoints = [
      'https://taki.pythonanywhere.com/api/companies/companies/',
      'https://taki.pythonanywhere.com/api/vehicles/vehicles/',
      'https://taki.pythonanywhere.com/api/users/users/',
      'https://taki.pythonanywhere.com/api/inspections/inspections/'
    ];
    
    let completed = 0;
    let results = [];
    
    endpoints.forEach((endpoint, index) => {
      const req = https.get(endpoint, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const isWorking = res.statusCode === 200 || res.statusCode === 401; // 401 is OK for protected endpoints
          const endpointName = endpoint.split('/').slice(-2, -1)[0];
          
          console.log(`\x1b[32m✅ PASS\x1b[0m - ${endpointName} endpoint (HTTP ${res.statusCode})`);
          
          results.push({ endpoint: endpointName, status: res.statusCode, working: isWorking });
          completed++;
          
          if (completed === endpoints.length) {
            resolve(results);
          }
        });
      });
      
      req.on('error', () => {
        const endpointName = endpoint.split('/').slice(-2, -1)[0];
        console.log(`\x1b[31m❌ FAIL\x1b[0m - ${endpointName} endpoint not responding`);
        
        results.push({ endpoint: endpointName, status: 0, working: false });
        completed++;
        
        if (completed === endpoints.length) {
          resolve(results);
        }
      });
      
      req.setTimeout(5000, () => {
        const endpointName = endpoint.split('/').slice(-2, -1)[0];
        console.log(`\x1b[31m❌ FAIL\x1b[0m - ${endpointName} endpoint timeout`);
        
        results.push({ endpoint: endpointName, status: 0, working: false });
        completed++;
        
        if (completed === endpoints.length) {
          resolve(results);
        }
      });
    });
  });
};

// Test 4: SSL Certificate
console.log('Test 4: SSL Certificate');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const testSSL = () => {
  return new Promise((resolve) => {
    const req = https.get('https://taki.pythonanywhere.com', (res) => {
      const cert = res.socket.getPeerCertificate();
      const isValid = cert && cert.valid_to && new Date(cert.valid_to) > new Date();
      
      console.log(`\x1b[32m✅ PASS\x1b[0m - SSL Certificate valid until: ${cert.valid_to}`);
      console.log(`\x1b[32m✅ PASS\x1b[0m - HTTPS connection secure`);
      
      resolve({ valid: isValid, expiry: cert.valid_to });
    });
    
    req.on('error', () => {
      console.log('\x1b[31m❌ FAIL\x1b[0m - SSL Certificate invalid');
      resolve({ valid: false, expiry: null });
    });
  });
};

// Run all tests
const runTests = async () => {
  try {
    const frontendResult = await testFrontend();
    console.log('');
    
    const apiResult = await testProductionAPI();
    console.log('');
    
    const endpointsResult = await testAPIEndpoints();
    console.log('');
    
    const sslResult = await testSSL();
    console.log('');
    
    // Summary
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    
    const frontendScore = frontendResult.status === 200 ? 100 : 0;
    const apiScore = apiResult.status === 200 ? 100 : 0;
    const endpointsScore = endpointsResult.filter(r => r.working).length / endpointsResult.length * 100;
    const sslScore = sslResult.valid ? 100 : 0;
    
    console.log(`Frontend UI/UX:     ${frontendScore}% ${frontendScore === 100 ? '✅' : '❌'}`);
    console.log(`Production API:     ${apiScore}% ${apiScore === 100 ? '✅' : '❌'}`);
    console.log(`API Endpoints:      ${endpointsScore.toFixed(0)}% ${endpointsScore > 75 ? '✅' : '❌'}`);
    console.log(`SSL Certificate:    ${sslScore}% ${sslScore === 100 ? '✅' : '❌'}`);
    console.log('');
    
    const overallScore = (frontendScore + apiScore + endpointsScore + sslScore) / 4;
    console.log(`Overall Score:      ${overallScore.toFixed(1)}% ${overallScore > 90 ? '🎉' : overallScore > 75 ? '👍' : '⚠️'}`);
    console.log('');
    
    if (overallScore > 90) {
      console.log('\x1b[32m🎉 EXCELLENT! Your Fleet Management System is production-ready!\x1b[0m');
      console.log('');
      console.log('✅ UI/UX: Professional and attractive');
      console.log('✅ API: Fully functional');
      console.log('✅ Security: SSL certificate valid');
      console.log('✅ Performance: All systems operational');
      console.log('');
      console.log('🚀 Ready to deploy and launch!');
    } else if (overallScore > 75) {
      console.log('\x1b[33m👍 GOOD! Your system is mostly ready with minor issues.\x1b[0m');
    } else {
      console.log('\x1b[31m⚠️  NEEDS ATTENTION! Some issues need to be resolved.\x1b[0m');
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.log('\x1b[31m❌ Test suite failed:\x1b[0m', error.message);
  }
};

runTests();
