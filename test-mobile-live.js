// Mobile App Live Test Script
const axios = require('axios');

// Test configuration
const config = {
  mobile: 'http://localhost:8081',
  mobileWeb: 'http://localhost:19006'
};

// Test results
const testResults = {
  timestamp: new Date().toISOString(),
  mobile: {},
  overall: 'PENDING'
};

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
      validateStatus: () => true
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

// Test Mobile App Functionality
const testMobileApp = async () => {
  log('=== TESTING MOBILE APPLICATION ===');
  
  const tests = [
    { name: 'Metro Bundler Status', url: config.mobile },
    { name: 'Bundle Status', url: `${config.mobile}/status` },
    { name: 'Metro Logs', url: `${config.mobile}/logs` },
    { name: 'Symbolicate', url: `${config.mobile}/symbolicate` }
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    testResults.mobile[test.name] = result;
    log(`${test.name}: ${result.success ? 'PASS' : 'FAIL'} (${result.status})`);
    
    if (result.success && result.data) {
      log(`  Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
    }
  }
};

// Test Mobile App Bundle
const testMobileBundle = async () => {
  log('=== TESTING MOBILE BUNDLE ===');
  
  try {
    // Test if we can get the bundle
    const bundleUrl = `${config.mobile}/index.bundle?platform=android&dev=true&minify=false`;
    const result = await testEndpoint('Mobile Bundle', bundleUrl);
    
    testResults.mobile['Mobile Bundle'] = result;
    log(`Mobile Bundle: ${result.success ? 'PASS' : 'FAIL'} (${result.status})`);
    
    if (result.success) {
      log(`  Bundle size: ${result.data ? result.data.length : 'unknown'} characters`);
    }
    
  } catch (error) {
    log(`Bundle test error: ${error.message}`);
  }
};

// Test Mobile App Components
const testMobileComponents = async () => {
  log('=== TESTING MOBILE COMPONENTS ===');
  
  // Test if the app can load (this would be a basic connectivity test)
  const tests = [
    { name: 'App Entry Point', url: `${config.mobile}/index.bundle?platform=android&dev=true&minify=false&modulesOnly=true` },
    { name: 'Asset Loading', url: `${config.mobile}/assets` }
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    testResults.mobile[test.name] = result;
    log(`${test.name}: ${result.success ? 'PASS' : 'FAIL'} (${result.status})`);
  }
};

// Test Mobile App Features
const testMobileFeatures = async () => {
  log('=== TESTING MOBILE FEATURES ===');
  
  // Test specific features by checking if the bundle contains our code
  try {
    const bundleUrl = `${config.mobile}/index.bundle?platform=android&dev=true&minify=false`;
    const response = await axios.get(bundleUrl, { timeout: 10000 });
    
    if (response.status === 200) {
      const bundleContent = response.data;
      
      // Check for specific features in the bundle
      const featureTests = [
        { name: 'Authentication Service', pattern: 'authService', content: bundleContent },
        { name: 'Fuel Detection Service', pattern: 'fuelDetectionService', content: bundleContent },
        { name: 'Camera Component', pattern: 'CameraScreen', content: bundleContent },
        { name: 'Dashboard Component', pattern: 'DashboardScreen', content: bundleContent },
        { name: 'API Service', pattern: 'apiService', content: bundleContent },
        { name: 'Mixpanel Analytics', pattern: 'mixpanel', content: bundleContent }
      ];
      
      for (const test of featureTests) {
        const found = test.content.includes(test.pattern);
        testResults.mobile[test.name] = {
          success: found,
          status: found ? 200 : 404,
          data: found ? 'Feature found in bundle' : 'Feature not found in bundle',
          error: null
        };
        log(`${test.name}: ${found ? 'PASS' : 'FAIL'}`);
      }
    }
    
  } catch (error) {
    log(`Feature test error: ${error.message}`);
  }
};

// Generate Test Report
const generateTestReport = () => {
  log('=== GENERATING MOBILE TEST REPORT ===');
  
  const report = {
    timestamp: testResults.timestamp,
    summary: {
      mobile: {
        total: Object.keys(testResults.mobile).length,
        passed: Object.values(testResults.mobile).filter(r => r.success).length,
        failed: Object.values(testResults.mobile).filter(r => !r.success).length
      }
    },
    details: testResults
  };

  // Save report to file
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, 'mobile-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  log(`Mobile Test Report saved to: ${reportPath}`);
  
  // Print summary
  console.log('\n=== MOBILE TEST SUMMARY ===');
  console.log(`Mobile: ${report.summary.mobile.passed}/${report.summary.mobile.total} tests passed`);
  
  if (report.summary.mobile.passed === report.summary.mobile.total) {
    console.log('🎉 ALL MOBILE TESTS PASSED!');
    testResults.overall = 'PASSED';
  } else {
    console.log('❌ Some mobile tests failed. Check the detailed report.');
    testResults.overall = 'FAILED';
  }
  
  // Print detailed results
  console.log('\n=== DETAILED RESULTS ===');
  Object.entries(testResults.mobile).forEach(([test, result]) => {
    console.log(`${test}: ${result.success ? '✅ PASS' : '❌ FAIL'} (${result.status})`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });
};

// Main test execution
const runMobileTests = async () => {
  log('Starting Mobile App Live Tests...');
  
  try {
    await testMobileApp();
    await testMobileBundle();
    await testMobileComponents();
    await testMobileFeatures();
    
    generateTestReport();
    
  } catch (error) {
    log(`Test execution error: ${error.message}`);
    testResults.overall = 'ERROR';
  }
};

// Run tests
runMobileTests();
