const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  backend: 'http://localhost:8000',
  web: 'http://localhost:3000',
  mobile: 'http://localhost:8081',
  mobileWeb: 'http://localhost:19006'
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  backend: {},
  web: {},
  mobile: {},
  overall: 'PENDING'
};

// Utility functions
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const testEndpoint = async (name, url, method = 'GET', data = null) => {
  try {
    log(`Testing ${name}: ${url}`);
    const response = await axios({
      method,
      url,
      data,
      timeout: 5000,
      validateStatus: () => true // Accept all status codes
    });
    
    return {
      success: response.status < 500,
      status: response.status,
      data: response.data,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      data: null,
      error: error.message
    };
  }
};

// Backend API Tests
const testBackendAPI = async () => {
  log('=== TESTING BACKEND API ===');
  
  const tests = [
    { name: 'API Root', url: `${config.backend}/api/` },
    { name: 'Account Endpoints', url: `${config.backend}/api/account/` },
    { name: 'Fleet Endpoints', url: `${config.backend}/api/fleet/` },
    { name: 'Inspections Endpoints', url: `${config.backend}/api/inspections/` },
    { name: 'Issues Endpoints', url: `${config.backend}/api/issues/` },
    { name: 'Tickets Endpoints', url: `${config.backend}/api/tickets/` },
    { name: 'Telemetry Endpoints', url: `${config.backend}/api/telemetry/` },
    { name: 'Dashboard Stats', url: `${config.backend}/api/fleet/stats/dashboard/` }
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    testResults.backend[test.name] = result;
    log(`${test.name}: ${result.success ? 'PASS' : 'FAIL'} (${result.status})`);
  }
};

// Web App Tests
const testWebApp = async () => {
  log('=== TESTING WEB APPLICATION ===');
  
  const tests = [
    { name: 'Web App Root', url: config.web },
    { name: 'Web App Health', url: `${config.web}/api/health` },
    { name: 'Web App Dashboard', url: `${config.web}/dashboard` },
    { name: 'Web App Login', url: `${config.web}/login` },
    { name: 'Web App Fleet', url: `${config.web}/fleet` },
    { name: 'Web App Inspections', url: `${config.web}/inspections` }
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    testResults.web[test.name] = result;
    log(`${test.name}: ${result.success ? 'PASS' : 'FAIL'} (${result.status})`);
  }
};

// Mobile App Tests
const testMobileApp = async () => {
  log('=== TESTING MOBILE APPLICATION ===');
  
  const tests = [
    { name: 'Mobile Metro Bundler', url: config.mobile },
    { name: 'Mobile Web Version', url: config.mobileWeb },
    { name: 'Mobile Bundle Status', url: `${config.mobile}/status` }
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    testResults.mobile[test.name] = result;
    log(`${test.name}: ${result.success ? 'PASS' : 'FAIL'} (${result.status})`);
  }
};

// Authentication Flow Test
const testAuthenticationFlow = async () => {
  log('=== TESTING AUTHENTICATION FLOW ===');
  
  try {
    // Test user registration
    const registerData = {
      username: 'testuser_' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
      password_confirm: 'testpassword123',
      first_name: 'Test',
      last_name: 'User',
      role: 'driver'
    };

    const registerResult = await testEndpoint(
      'User Registration',
      `${config.backend}/api/account/register/`,
      'POST',
      registerData
    );

    testResults.backend['User Registration'] = registerResult;
    log(`User Registration: ${registerResult.success ? 'PASS' : 'FAIL'}`);

    if (registerResult.success) {
      // Test login with registered user
      const loginData = {
        username: registerData.username,
        password: registerData.password
      };

      const loginResult = await testEndpoint(
        'User Login',
        `${config.backend}/api/account/login/`,
        'POST',
        loginData
      );

      testResults.backend['User Login'] = loginResult;
      log(`User Login: ${loginResult.success ? 'PASS' : 'FAIL'}`);
    }

  } catch (error) {
    log(`Authentication Flow Test Error: ${error.message}`);
  }
};

// Fuel Detection API Test
const testFuelDetectionAPI = async () => {
  log('=== TESTING FUEL DETECTION API ===');
  
  try {
    // Test fuel reading upload endpoint
    const fuelData = {
      vehicle: 1,
      type: 'fuel_level',
      data: JSON.stringify({
        fuel_level: 75,
        confidence: 0.85,
        detection_method: 'ocr',
        timestamp: new Date().toISOString(),
        raw_text: ['FUEL LEVEL: 75%'],
        detected_values: [75]
      })
    };

    const fuelResult = await testEndpoint(
      'Fuel Reading Upload',
      `${config.backend}/api/telemetry/fuel-readings/`,
      'POST',
      fuelData
    );

    testResults.backend['Fuel Reading Upload'] = fuelResult;
    log(`Fuel Reading Upload: ${fuelResult.success ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    log(`Fuel Detection API Test Error: ${error.message}`);
  }
};

// File Upload Test
const testFileUpload = async () => {
  log('=== TESTING FILE UPLOAD ===');
  
  try {
    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    // Create a simple test image (1x1 pixel JPEG)
    const testImageBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF,
      0xD9
    ]);

    fs.writeFileSync(testImagePath, testImageBuffer);

    // Test photo upload
    const FormData = require('form-data');
    const form = new FormData();
    form.append('inspection', '1');
    form.append('part', 'DASHBOARD');
    form.append('image', fs.createReadStream(testImagePath));

    const uploadResult = await testEndpoint(
      'Photo Upload',
      `${config.backend}/api/inspections/photos/`,
      'POST',
      form
    );

    testResults.backend['Photo Upload'] = uploadResult;
    log(`Photo Upload: ${uploadResult.success ? 'PASS' : 'FAIL'}`);

    // Clean up test file
    fs.unlinkSync(testImagePath);

  } catch (error) {
    log(`File Upload Test Error: ${error.message}`);
  }
};

// Generate Test Report
const generateTestReport = () => {
  log('=== GENERATING TEST REPORT ===');
  
  const report = {
    timestamp: testResults.timestamp,
    summary: {
      backend: {
        total: Object.keys(testResults.backend).length,
        passed: Object.values(testResults.backend).filter(r => r.success).length,
        failed: Object.values(testResults.backend).filter(r => !r.success).length
      },
      web: {
        total: Object.keys(testResults.web).length,
        passed: Object.values(testResults.web).filter(r => r.success).length,
        failed: Object.values(testResults.web).filter(r => !r.success).length
      },
      mobile: {
        total: Object.keys(testResults.mobile).length,
        passed: Object.values(testResults.mobile).filter(r => r.success).length,
        failed: Object.values(testResults.mobile).filter(r => !r.success).length
      }
    },
    details: testResults
  };

  // Save report to file
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`Test Report saved to: ${reportPath}`);
  
  // Print summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Backend: ${report.summary.backend.passed}/${report.summary.backend.total} tests passed`);
  console.log(`Web: ${report.summary.web.passed}/${report.summary.web.total} tests passed`);
  console.log(`Mobile: ${report.summary.mobile.passed}/${report.summary.mobile.total} tests passed`);
  
  const totalPassed = report.summary.backend.passed + report.summary.web.passed + report.summary.mobile.passed;
  const totalTests = report.summary.backend.total + report.summary.web.total + report.summary.mobile.total;
  
  console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED!');
    testResults.overall = 'PASSED';
  } else {
    console.log('❌ Some tests failed. Check the detailed report.');
    testResults.overall = 'FAILED';
  }
};

// Main test execution
const runAllTests = async () => {
  log('Starting comprehensive Fleet Management System tests...');
  
  try {
    await testBackendAPI();
    await testWebApp();
    await testMobileApp();
    await testAuthenticationFlow();
    await testFuelDetectionAPI();
    await testFileUpload();
    
    generateTestReport();
    
  } catch (error) {
    log(`Test execution error: ${error.message}`);
    testResults.overall = 'ERROR';
  }
};

// Run tests
runAllTests();
