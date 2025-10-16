#!/usr/bin/env node

/**
 * Simple Production Testing Script
 * Tests the Fleet Management System with real production data
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8001/api';

// Test Results
const testResults = {
  timestamp: new Date().toISOString(),
  summary: { total: 0, passed: 0, failed: 0 },
  tests: [],
  errors: []
};

// Production Test Users
const testUsers = [
  { username: 'metro_admin', password: 'MetroAdmin2024!', role: 'admin', company: 'Metro Transit Authority' },
  { username: 'metro_fleet_manager', password: 'Staff2024!', role: 'staff', company: 'Metro Transit Authority' },
  { username: 'metro_driver_001', password: 'Driver2024!', role: 'driver', company: 'Metro Transit Authority' },
  { username: 'metro_inspector_001', password: 'Inspector2024!', role: 'inspector', company: 'Metro Transit Authority' },
  { username: 'swift_admin', password: 'SwiftAdmin2024!', role: 'admin', company: 'Swift Delivery Services' },
  { username: 'swift_operations', password: 'Staff2024!', role: 'staff', company: 'Swift Delivery Services' },
  { username: 'swift_driver_001', password: 'Driver2024!', role: 'driver', company: 'Swift Delivery Services' },
  { username: 'green_admin', password: 'GreenAdmin2024!', role: 'admin', company: 'Green Earth Transportation' }
];

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(testName, status, details = '') {
  testResults.tests.push({
    name: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  });
  
  testResults.summary.total++;
  if (status === 'passed') {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
  }
}

async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    };
    
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

async function testLogin(userData) {
  log(`🔐 Testing login for ${userData.username} (${userData.role}) from ${userData.company}`);
  
  const result = await makeRequest('POST', '/account/login/', {
    username: userData.username,
    password: userData.password
  });
  
  if (result.success && result.data.token) {
    log(`✅ Login successful for ${userData.username}`, 'success');
    recordTest(`Login ${userData.username}`, 'passed', `Role: ${userData.role}, Company: ${userData.company}`);
    return { success: true, token: result.data.token, user: result.data.user };
  } else {
    log(`❌ Login failed for ${userData.username}: ${JSON.stringify(result.error)}`, 'error');
    recordTest(`Login ${userData.username}`, 'failed', result.error);
    return { success: false, error: result.error };
  }
}

async function testUserPermissions(userData, token) {
  log(`🔧 Testing permissions for ${userData.username} (${userData.role})`);
  
  // Test profile access (all users should have this)
  const profileResult = await makeRequest('GET', '/account/profile/', null, token);
  if (profileResult.success) {
    log(`✅ ${userData.username} can access profile`, 'success');
    recordTest(`${userData.username} Profile Access`, 'passed', `Status: ${profileResult.status}`);
  } else {
    log(`❌ ${userData.username} cannot access profile`, 'error');
    recordTest(`${userData.username} Profile Access`, 'failed', profileResult.error);
  }
  
  // Test users list access (admin and staff only)
  const usersResult = await makeRequest('GET', '/account/users/', null, token);
  const shouldAccessUsers = ['admin', 'staff'].includes(userData.role);
  
  if (shouldAccessUsers && usersResult.success) {
    log(`✅ ${userData.username} correctly allowed to access users list`, 'success');
    recordTest(`${userData.username} Users Access`, 'passed', `Found ${usersResult.data.count || 0} users`);
  } else if (!shouldAccessUsers && !usersResult.success && (usersResult.status === 403 || usersResult.status === 404)) {
    log(`✅ ${userData.username} correctly blocked from users list`, 'success');
    recordTest(`${userData.username} Users Access`, 'passed', `Correctly blocked with status: ${usersResult.status}`);
  } else if (shouldAccessUsers && !usersResult.success) {
    log(`❌ ${userData.username} should access users but failed`, 'error');
    recordTest(`${userData.username} Users Access`, 'failed', usersResult.error);
  } else if (!shouldAccessUsers && usersResult.success) {
    log(`❌ ${userData.username} should be blocked from users but can access`, 'error');
    recordTest(`${userData.username} Users Access`, 'failed', 'Should be blocked but access granted');
  }
  
  // Test vehicles access (all roles should have this)
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, token);
  if (vehiclesResult.success) {
    log(`✅ ${userData.username} can access vehicles`, 'success');
    recordTest(`${userData.username} Vehicles Access`, 'passed', `Found ${vehiclesResult.data.count || 0} vehicles`);
  } else {
    log(`❌ ${userData.username} cannot access vehicles`, 'error');
    recordTest(`${userData.username} Vehicles Access`, 'failed', vehiclesResult.error);
  }
  
  // Test stats access (admin only)
  const statsResult = await makeRequest('GET', '/account/stats/', null, token);
  const shouldAccessStats = userData.role === 'admin';
  
  if (shouldAccessStats && statsResult.success) {
    log(`✅ ${userData.username} correctly allowed to access stats`, 'success');
    recordTest(`${userData.username} Stats Access`, 'passed', `Company: ${statsResult.data.company_name || 'Unknown'}`);
  } else if (!shouldAccessStats && !statsResult.success && (statsResult.status === 403 || statsResult.status === 404)) {
    log(`✅ ${userData.username} correctly blocked from stats`, 'success');
    recordTest(`${userData.username} Stats Access`, 'passed', `Correctly blocked with status: ${statsResult.status}`);
  } else if (shouldAccessStats && !statsResult.success) {
    log(`❌ ${userData.username} should access stats but failed`, 'error');
    recordTest(`${userData.username} Stats Access`, 'failed', statsResult.error);
  } else if (!shouldAccessStats && statsResult.success) {
    log(`❌ ${userData.username} should be blocked from stats but can access`, 'error');
    recordTest(`${userData.username} Stats Access`, 'failed', 'Should be blocked but access granted');
  }
}

async function testAPIEndpoints() {
  log('🏥 Testing API endpoint availability');
  
  const endpoints = [
    { url: '/account/login/', method: 'POST', name: 'Login Endpoint' },
    { url: '/account/register/', method: 'POST', name: 'Register Endpoint' },
    { url: '/account/profile/', method: 'GET', name: 'Profile Endpoint' },
    { url: '/account/users/', method: 'GET', name: 'Users Endpoint' },
    { url: '/fleet/vehicles/', method: 'GET', name: 'Vehicles Endpoint' },
    { url: '/inspections/', method: 'GET', name: 'Inspections Endpoint' },
    { url: '/issues/', method: 'GET', name: 'Issues Endpoint' },
    { url: '/tickets/', method: 'GET', name: 'Tickets Endpoint' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint.method, endpoint.url);
    
    // For GET requests, we expect 401 (unauthorized) or 200 (success)
    // For POST requests, we expect 400 (bad request) or 200 (success)
    const expectedStatuses = endpoint.method === 'GET' ? [200, 401] : [200, 400];
    
    if (expectedStatuses.includes(result.status)) {
      log(`✅ ${endpoint.name} is responding correctly (Status: ${result.status})`, 'success');
      recordTest(endpoint.name, 'passed', `Status: ${result.status}`);
    } else {
      log(`❌ ${endpoint.name} unexpected status: ${result.status}`, 'error');
      recordTest(endpoint.name, 'failed', `Unexpected status: ${result.status}`);
    }
  }
}

async function runProductionTests() {
  log('🚀 Starting PRODUCTION Testing with Real Data', 'info');
  log('=' * 60, 'info');
  
  // Test API endpoints first
  await testAPIEndpoints();
  
  // Test each user login and permissions
  for (const userData of testUsers) {
    const loginResult = await testLogin(userData);
    
    if (loginResult.success) {
      await testUserPermissions(userData, loginResult.token);
    }
  }
  
  // Generate report
  generateReport();
}

function generateReport() {
  log('\n📊 PRODUCTION TEST RESULTS', 'info');
  log('=' * 60, 'info');
  
  console.log('\n📈 SUMMARY');
  console.log('=' * 30);
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
  
  console.log('\n🔍 DETAILED RESULTS');
  console.log('=' * 30);
  
  const passedTests = testResults.tests.filter(t => t.status === 'passed');
  const failedTests = testResults.tests.filter(t => t.status === 'failed');
  
  if (passedTests.length > 0) {
    console.log('\n✅ PASSED TESTS:');
    passedTests.forEach(test => {
      console.log(`  • ${test.name} - ${test.details}`);
    });
  }
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`  • ${test.name} - ${test.details}`);
    });
  }
  
  // Save detailed report
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, 'SIMPLE_PRODUCTION_TEST_RESULTS.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'success');
  
  // Overall assessment
  const successRate = (testResults.summary.passed / testResults.summary.total) * 100;
  if (successRate >= 90) {
    log('\n🎉 PRODUCTION SYSTEM STATUS: EXCELLENT (90%+ success rate)', 'success');
  } else if (successRate >= 80) {
    log('\n✅ PRODUCTION SYSTEM STATUS: GOOD (80%+ success rate)', 'success');
  } else if (successRate >= 70) {
    log('\n⚠️ PRODUCTION SYSTEM STATUS: ACCEPTABLE (70%+ success rate)', 'warning');
  } else {
    log('\n❌ PRODUCTION SYSTEM STATUS: NEEDS ATTENTION (<70% success rate)', 'error');
  }
}

// Run the tests
if (require.main === module) {
  runProductionTests().catch(error => {
    log(`❌ Production test execution failed: ${error.message}`, 'error');
    testResults.errors.push(error.message);
    generateReport();
    process.exit(1);
  });
}

module.exports = { runProductionTests, testResults };
