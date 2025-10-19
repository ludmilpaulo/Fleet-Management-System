#!/usr/bin/env node

/**
 * Comprehensive Fleet Management System Endpoint Testing
 * Tests all endpoints between backend, frontend, and mobile applications
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  BACKEND_URL: 'https://www.fleetia.online',
  FRONTEND_URL: 'https://fleet-management-system-sooty.vercel.app',
  API_BASE: 'https://www.fleetia.online/api',
  
  // Test credentials
  CREDENTIALS: {
    admin: { username: 'admin', password: 'admin123' },
    staff: { username: 'staff1', password: 'staff123' },
    driver: { username: 'driver1', password: 'driver123' },
    inspector: { username: 'inspector1', password: 'inspector123' }
  },
  
  // Test timeout
  TIMEOUT: 10000
};

// Test results storage
const testResults = {
  backend: {},
  frontend: {},
  mobile: {},
  integration: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }
};

// Utility functions
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      timeout: CONFIG.TIMEOUT,
      ...options
    };
    
    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

function logTest(testName, result, details = '') {
  const status = result ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}${details ? ` - ${details}` : ''}`);
  
  testResults.summary.total++;
  if (result) {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
    testResults.summary.errors.push(`${testName}: ${details}`);
  }
}

// Authentication helper
let authToken = null;

async function authenticate(credentials = CONFIG.CREDENTIALS.admin) {
  try {
    const response = await makeRequest(`${CONFIG.API_BASE}/account/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      authToken = data.token;
      return { success: true, token: authToken, user: data.user };
    }
    return { success: false, error: `Login failed: ${response.statusCode}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Backend API Tests
async function testBackendEndpoints() {
  console.log('\n🔧 TESTING BACKEND API ENDPOINTS');
  console.log('=' .repeat(50));
  
  // Test 1: API Root
  try {
    const response = await makeRequest(`${CONFIG.API_BASE}/`);
    logTest('API Root', response.statusCode === 404, `Status: ${response.statusCode} (Expected 404 - no root endpoint)`);
  } catch (error) {
    logTest('API Root', false, error.message);
  }
  
  // Test 2: Login Endpoint
  try {
    const response = await makeRequest(`${CONFIG.API_BASE}/account/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CONFIG.CREDENTIALS.admin)
    });
    logTest('Login Endpoint', response.statusCode === 200, `Status: ${response.statusCode}`);
  } catch (error) {
    logTest('Login Endpoint', false, error.message);
  }
  
  // Test 3: Authentication
  const authResult = await authenticate();
  logTest('Authentication', authResult.success, authResult.error || 'Token obtained');
  
  if (!authResult.success) {
    console.log('❌ Cannot proceed with authenticated tests - authentication failed');
    return;
  }
  
  // Test 4: Protected Endpoints (with auth)
  const protectedEndpoints = [
    { name: 'User Profile', url: '/account/profile/' },
    { name: 'Fleet Vehicles', url: '/fleet/vehicles/' },
    { name: 'Fleet Stats', url: '/fleet/stats/dashboard/' },
    { name: 'Inspections', url: '/inspections/inspections/' },
    { name: 'Issues', url: '/issues/issues/' },
    { name: 'Tickets', url: '/tickets/tickets/' },
    { name: 'Telemetry Parking', url: '/telemetry/parking-logs/' }
  ];
  
  for (const endpoint of protectedEndpoints) {
    try {
      const response = await makeRequest(`${CONFIG.API_BASE}${endpoint.url}`, {
        headers: {
          'Authorization': `Token ${authToken}`
        }
      });
      logTest(endpoint.name, response.statusCode === 200, `Status: ${response.statusCode}`);
    } catch (error) {
      logTest(endpoint.name, false, error.message);
    }
  }
  
  // Test 5: Unauthorized Access
  try {
    const response = await makeRequest(`${CONFIG.API_BASE}/fleet/vehicles/`);
    logTest('Unauthorized Access', response.statusCode === 401, `Status: ${response.statusCode} (Expected 401)`);
  } catch (error) {
    logTest('Unauthorized Access', false, error.message);
  }
  
  // Test 6: CORS Headers
  try {
    const response = await makeRequest(`${CONFIG.API_BASE}/account/login/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': CONFIG.FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    const hasCors = response.headers['access-control-allow-origin'];
    logTest('CORS Headers', !!hasCors, hasCors ? `Origin: ${hasCors}` : 'No CORS headers');
  } catch (error) {
    logTest('CORS Headers', false, error.message);
  }
}

// Frontend Tests
async function testFrontendEndpoints() {
  console.log('\n🌐 TESTING FRONTEND APPLICATION');
  console.log('=' .repeat(50));
  
  // Test 1: Frontend Homepage
  try {
    const response = await makeRequest(CONFIG.FRONTEND_URL);
    logTest('Frontend Homepage', response.statusCode === 200, `Status: ${response.statusCode}`);
  } catch (error) {
    logTest('Frontend Homepage', false, error.message);
  }
  
  // Test 2: Frontend Security Headers
  try {
    const response = await makeRequest(CONFIG.FRONTEND_URL);
    const securityHeaders = {
      'strict-transport-security': response.headers['strict-transport-security'],
      'x-frame-options': response.headers['x-frame-options'],
      'x-content-type-options': response.headers['x-content-type-options']
    };
    
    const hasSecurityHeaders = Object.values(securityHeaders).some(header => header);
    logTest('Security Headers', hasSecurityHeaders, 'HTTPS enforced');
  } catch (error) {
    logTest('Security Headers', false, error.message);
  }
  
  // Test 3: Frontend API Integration (simulate login)
  try {
    const loginResponse = await makeRequest(`${CONFIG.API_BASE}/account/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': CONFIG.FRONTEND_URL
      },
      body: JSON.stringify(CONFIG.CREDENTIALS.admin)
    });
    
    logTest('Frontend-Backend Integration', loginResponse.statusCode === 200, `Login Status: ${loginResponse.statusCode}`);
  } catch (error) {
    logTest('Frontend-Backend Integration', false, error.message);
  }
}

// Mobile App Tests
async function testMobileEndpoints() {
  console.log('\n📱 TESTING MOBILE APP INTEGRATION');
  console.log('=' .repeat(50));
  
  // Test 1: Mobile API Base URL
  try {
    const response = await makeRequest(`${CONFIG.API_BASE}/account/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FleetManagement-Mobile/1.0'
      },
      body: JSON.stringify(CONFIG.CREDENTIALS.admin)
    });
    
    logTest('Mobile API Base URL', response.statusCode === 200, `Status: ${response.statusCode}`);
  } catch (error) {
    logTest('Mobile API Base URL', false, error.message);
  }
  
  // Test 2: Mobile Authentication Flow
  const mobileAuth = await authenticate(CONFIG.CREDENTIALS.staff);
  logTest('Mobile Authentication', mobileAuth.success, mobileAuth.error || 'Staff login successful');
  
  if (mobileAuth.success) {
    // Test 3: Mobile-specific endpoints
    const mobileEndpoints = [
      { name: 'Staff Profile', url: '/account/profile/' },
      { name: 'Fleet Vehicles', url: '/fleet/vehicles/' },
      { name: 'Inspections', url: '/inspections/inspections/' },
      { name: 'Issues', url: '/issues/issues/' }
    ];
    
    for (const endpoint of mobileEndpoints) {
      try {
        const response = await makeRequest(`${CONFIG.API_BASE}${endpoint.url}`, {
          headers: {
            'Authorization': `Token ${authToken}`,
            'User-Agent': 'FleetManagement-Mobile/1.0'
          }
        });
        logTest(endpoint.name, response.statusCode === 200, `Status: ${response.statusCode}`);
      } catch (error) {
        logTest(endpoint.name, false, error.message);
      }
    }
  }
}

// Integration Tests
async function testIntegrationFlows() {
  console.log('\n🔗 TESTING INTEGRATION FLOWS');
  console.log('=' .repeat(50));
  
  // Test 1: Cross-platform Authentication
  const platforms = ['admin', 'staff'];
  let crossPlatformSuccess = 0;
  
  for (const role of platforms) {
    const auth = await authenticate(CONFIG.CREDENTIALS[role]);
    if (auth.success) crossPlatformSuccess++;
  }
  
  logTest('Cross-platform Authentication', crossPlatformSuccess === platforms.length, 
    `${crossPlatformSuccess}/${platforms.length} roles authenticated`);
  
  // Test 2: Token Persistence
  if (authToken) {
    try {
      // Test token validity with multiple requests
      const requests = Array(3).fill().map(() => 
        makeRequest(`${CONFIG.API_BASE}/account/profile/`, {
          headers: { 'Authorization': `Token ${authToken}` }
        })
      );
      
      const responses = await Promise.all(requests);
      const allSuccess = responses.every(r => r.statusCode === 200);
      logTest('Token Persistence', allSuccess, `${responses.length} consecutive requests`);
    } catch (error) {
      logTest('Token Persistence', false, error.message);
    }
  }
  
  // Test 3: API Response Consistency
  try {
    const webResponse = await makeRequest(`${CONFIG.API_BASE}/account/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FleetManagement-Web/1.0'
      },
      body: JSON.stringify(CONFIG.CREDENTIALS.admin)
    });
    
    const mobileResponse = await makeRequest(`${CONFIG.API_BASE}/account/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FleetManagement-Mobile/1.0'
      },
      body: JSON.stringify(CONFIG.CREDENTIALS.admin)
    });
    
    const consistent = webResponse.statusCode === mobileResponse.statusCode;
    logTest('API Response Consistency', consistent, 
      `Web: ${webResponse.statusCode}, Mobile: ${mobileResponse.statusCode}`);
  } catch (error) {
    logTest('API Response Consistency', false, error.message);
  }
}

// Performance Tests
async function testPerformance() {
  console.log('\n⚡ TESTING PERFORMANCE');
  console.log('=' .repeat(50));
  
  const performanceTests = [
    { name: 'Login Response Time', url: `${CONFIG.API_BASE}/account/login/`, method: 'POST' },
    { name: 'API Root Response Time', url: `${CONFIG.API_BASE}/`, method: 'GET' },
    { name: 'Frontend Load Time', url: CONFIG.FRONTEND_URL, method: 'GET' }
  ];
  
  for (const test of performanceTests) {
    const startTime = Date.now();
    try {
      const response = await makeRequest(test.url, {
        method: test.method,
        headers: test.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: test.method === 'POST' ? JSON.stringify(CONFIG.CREDENTIALS.admin) : undefined
      });
      
      const responseTime = Date.now() - startTime;
      const isAcceptable = responseTime < 3000; // 3 seconds threshold
      logTest(test.name, isAcceptable, `${responseTime}ms`);
    } catch (error) {
      logTest(test.name, false, error.message);
    }
  }
}

// Generate Report
function generateReport() {
  console.log('\n📊 COMPREHENSIVE TEST REPORT');
  console.log('=' .repeat(50));
  
  const { total, passed, failed, errors } = testResults.summary;
  const successRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${successRate}%`);
  
  if (errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n🎯 SYSTEM STATUS:');
  if (successRate >= 90) {
    console.log('🟢 EXCELLENT - System is fully operational');
  } else if (successRate >= 75) {
    console.log('🟡 GOOD - Minor issues detected');
  } else if (successRate >= 50) {
    console.log('🟠 FAIR - Several issues need attention');
  } else {
    console.log('🔴 POOR - Major issues detected');
  }
  
  console.log('\n📋 RECOMMENDATIONS:');
  if (failed > 0) {
    console.log('1. Review failed tests and fix issues');
    console.log('2. Check network connectivity and server status');
    console.log('3. Verify API endpoints and authentication');
  } else {
    console.log('1. All systems are working correctly');
    console.log('2. Consider implementing monitoring');
    console.log('3. Schedule regular health checks');
  }
}

// Main execution
async function runAllTests() {
  console.log('🚀 FLEET MANAGEMENT SYSTEM - COMPREHENSIVE ENDPOINT TESTING');
  console.log('=' .repeat(70));
  console.log(`Backend: ${CONFIG.BACKEND_URL}`);
  console.log(`Frontend: ${CONFIG.FRONTEND_URL}`);
  console.log(`API Base: ${CONFIG.API_BASE}`);
  console.log('=' .repeat(70));
  
  try {
    await testBackendEndpoints();
    await testFrontendEndpoints();
    await testMobileEndpoints();
    await testIntegrationFlows();
    await testPerformance();
    generateReport();
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, CONFIG };
