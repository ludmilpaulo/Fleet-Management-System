#!/usr/bin/env node

/**
 * Comprehensive Production Testing Script
 * Fleet Management System - All User Roles & Responsibilities
 * 
 * This script tests the entire system across all user roles:
 * - Admin
 * - Staff 
 * - Driver
 * - Inspector
 * - Platform Admin
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:8000/api';
const WEB_URL = 'http://localhost:3000';

// Test Results Storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  roles: {},
  errors: []
};

// Test Data
const testUsers = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    company: 'FleetCorp Solutions'
  },
  staff: {
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    company: 'FleetCorp Solutions'
  },
  driver: {
    username: 'driver',
    password: 'driver123',
    role: 'driver',
    company: 'FleetCorp Solutions'
  },
  inspector: {
    username: 'inspector',
    password: 'inspector123',
    role: 'inspector',
    company: 'FleetCorp Solutions'
  }
};

// Utility Functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(role, testName, status, details = '') {
  if (!testResults.roles[role]) {
    testResults.roles[role] = {
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 }
    };
  }
  
  testResults.roles[role].tests.push({
    name: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  });
  
  testResults.roles[role].summary.total++;
  testResults.summary.total++;
  
  if (status === 'passed') {
    testResults.roles[role].summary.passed++;
    testResults.summary.passed++;
  } else if (status === 'failed') {
    testResults.roles[role].summary.failed++;
    testResults.summary.failed++;
  } else {
    testResults.roles[role].summary.skipped++;
    testResults.summary.skipped++;
  }
}

async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
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

// Authentication Functions
async function loginUser(userData) {
  log(`Logging in user: ${userData.username} (${userData.role})`);
  
  const result = await makeRequest('POST', '/account/login/', {
    username: userData.username,
    password: userData.password
  });
  
  if (result.success && result.data.token) {
    log(`✅ Successfully logged in ${userData.username}`, 'success');
    return {
      success: true,
      token: result.data.token,
      user: result.data.user
    };
  } else {
    log(`❌ Failed to login ${userData.username}: ${JSON.stringify(result.error)}`, 'error');
    return { success: false, error: result.error };
  }
}

// Role-Specific Test Functions

async function testAdminRole(token) {
  log('🔧 Testing Admin Role Functionality', 'info');
  const role = 'admin';
  
  // Test 1: View all users
  const usersResult = await makeRequest('GET', '/account/users/', null, token);
  if (usersResult.success) {
    recordTest(role, 'View All Users', 'passed', `Found ${usersResult.data.count || 0} users`);
    log(`✅ Admin can view all users (${usersResult.data.count || 0} found)`, 'success');
  } else {
    recordTest(role, 'View All Users', 'failed', usersResult.error);
    log(`❌ Admin cannot view all users: ${JSON.stringify(usersResult.error)}`, 'error');
  }
  
  // Test 2: Create new user
  const newUserData = {
    username: 'testuser_' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'testpass123',
    password_confirm: 'testpass123',
    first_name: 'Test',
    last_name: 'User',
    role: 'staff',
    phone_number: '1234567890',
    employee_id: 'EMP' + Date.now(),
    department: 'Testing'
  };
  
  const createResult = await makeRequest('POST', '/account/register/', newUserData, token);
  if (createResult.success) {
    recordTest(role, 'Create New User', 'passed', `Created user: ${newUserData.username}`);
    log(`✅ Admin can create new user: ${newUserData.username}`, 'success');
  } else {
    recordTest(role, 'Create New User', 'failed', createResult.error);
    log(`❌ Admin cannot create new user: ${JSON.stringify(createResult.error)}`, 'error');
  }
  
  // Test 3: View company statistics
  const statsResult = await makeRequest('GET', '/account/stats/', null, token);
  if (statsResult.success) {
    recordTest(role, 'View Company Statistics', 'passed', `Company: ${statsResult.data.company_name}`);
    log(`✅ Admin can view company statistics`, 'success');
  } else {
    recordTest(role, 'View Company Statistics', 'failed', statsResult.error);
    log(`❌ Admin cannot view company statistics: ${JSON.stringify(statsResult.error)}`, 'error');
  }
  
  // Test 4: Access admin-only endpoints
  const adminEndpoints = [
    '/platform-admin/companies/',
    '/platform-admin/users/',
    '/platform-admin/subscription-plans/'
  ];
  
  for (const endpoint of adminEndpoints) {
    const result = await makeRequest('GET', endpoint, null, token);
    if (result.success) {
      recordTest(role, `Access Admin Endpoint: ${endpoint}`, 'passed', `Status: ${result.status}`);
      log(`✅ Admin can access ${endpoint}`, 'success');
    } else {
      recordTest(role, `Access Admin Endpoint: ${endpoint}`, 'failed', result.error);
      log(`❌ Admin cannot access ${endpoint}: ${JSON.stringify(result.error)}`, 'error');
    }
  }
}

async function testStaffRole(token) {
  log('👥 Testing Staff Role Functionality', 'info');
  const role = 'staff';
  
  // Test 1: View users (limited access)
  const usersResult = await makeRequest('GET', '/account/users/', null, token);
  if (usersResult.success) {
    recordTest(role, 'View Users', 'passed', `Found ${usersResult.data.count || 0} users`);
    log(`✅ Staff can view users (${usersResult.data.count || 0} found)`, 'success');
  } else {
    recordTest(role, 'View Users', 'failed', usersResult.error);
    log(`❌ Staff cannot view users: ${JSON.stringify(usersResult.error)}`, 'error');
  }
  
  // Test 2: Manage vehicles (if endpoint exists)
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, token);
  if (vehiclesResult.success) {
    recordTest(role, 'View Vehicles', 'passed', `Found ${vehiclesResult.data.count || 0} vehicles`);
    log(`✅ Staff can view vehicles (${vehiclesResult.data.count || 0} found)`, 'success');
  } else {
    recordTest(role, 'View Vehicles', 'failed', vehiclesResult.error);
    log(`❌ Staff cannot view vehicles: ${JSON.stringify(vehiclesResult.error)}`, 'error');
  }
  
  // Test 3: Cannot access admin-only endpoints
  const adminEndpoints = [
    '/platform-admin/companies/',
    '/platform-admin/subscription-plans/'
  ];
  
  for (const endpoint of adminEndpoints) {
    const result = await makeRequest('GET', endpoint, null, token);
    if (!result.success && (result.status === 403 || result.status === 404)) {
      recordTest(role, `Cannot Access Admin Endpoint: ${endpoint}`, 'passed', `Correctly blocked with status: ${result.status}`);
      log(`✅ Staff correctly blocked from ${endpoint}`, 'success');
    } else if (result.success) {
      recordTest(role, `Cannot Access Admin Endpoint: ${endpoint}`, 'failed', 'Should be blocked but access granted');
      log(`❌ Staff should not access ${endpoint} but can`, 'error');
    } else {
      recordTest(role, `Cannot Access Admin Endpoint: ${endpoint}`, 'skipped', `Unexpected error: ${result.error}`);
      log(`⚠️ Staff endpoint test for ${endpoint} skipped: ${JSON.stringify(result.error)}`, 'warning');
    }
  }
}

async function testDriverRole(token) {
  log('🚗 Testing Driver Role Functionality', 'info');
  const role = 'driver';
  
  // Test 1: View own profile
  const profileResult = await makeRequest('GET', '/account/profile/', null, token);
  if (profileResult.success) {
    recordTest(role, 'View Own Profile', 'passed', `Profile loaded for ${profileResult.data.username}`);
    log(`✅ Driver can view own profile`, 'success');
  } else {
    recordTest(role, 'View Own Profile', 'failed', profileResult.error);
    log(`❌ Driver cannot view own profile: ${JSON.stringify(profileResult.error)}`, 'error');
  }
  
  // Test 2: Cannot view other users
  const usersResult = await makeRequest('GET', '/account/users/', null, token);
  if (!usersResult.success && (usersResult.status === 403 || usersResult.status === 404)) {
    recordTest(role, 'Cannot View Other Users', 'passed', `Correctly blocked with status: ${usersResult.status}`);
    log(`✅ Driver correctly blocked from viewing other users`, 'success');
  } else if (usersResult.success) {
    recordTest(role, 'Cannot View Other Users', 'failed', 'Should be blocked but access granted');
    log(`❌ Driver should not view other users but can`, 'error');
  } else {
    recordTest(role, 'Cannot View Other Users', 'skipped', `Unexpected error: ${usersResult.error}`);
    log(`⚠️ Driver users test skipped: ${JSON.stringify(usersResult.error)}`, 'warning');
  }
  
  // Test 3: View assigned vehicles (if any)
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, token);
  if (vehiclesResult.success) {
    recordTest(role, 'View Assigned Vehicles', 'passed', `Found ${vehiclesResult.data.count || 0} vehicles`);
    log(`✅ Driver can view vehicles (${vehiclesResult.data.count || 0} found)`, 'success');
  } else {
    recordTest(role, 'View Assigned Vehicles', 'failed', vehiclesResult.error);
    log(`❌ Driver cannot view vehicles: ${JSON.stringify(vehiclesResult.error)}`, 'error');
  }
  
  // Test 4: Cannot access admin endpoints
  const adminEndpoints = [
    '/platform-admin/companies/',
    '/account/users/'
  ];
  
  for (const endpoint of adminEndpoints) {
    const result = await makeRequest('GET', endpoint, null, token);
    if (!result.success && (result.status === 403 || result.status === 404)) {
      recordTest(role, `Cannot Access Admin Endpoint: ${endpoint}`, 'passed', `Correctly blocked with status: ${result.status}`);
      log(`✅ Driver correctly blocked from ${endpoint}`, 'success');
    } else if (result.success) {
      recordTest(role, `Cannot Access Admin Endpoint: ${endpoint}`, 'failed', 'Should be blocked but access granted');
      log(`❌ Driver should not access ${endpoint} but can`, 'error');
    } else {
      recordTest(role, `Cannot Access Admin Endpoint: ${endpoint}`, 'skipped', `Unexpected error: ${result.error}`);
      log(`⚠️ Driver endpoint test for ${endpoint} skipped: ${JSON.stringify(result.error)}`, 'warning');
    }
  }
}

async function testInspectorRole(token) {
  log('🔍 Testing Inspector Role Functionality', 'info');
  const role = 'inspector';
  
  // Test 1: View vehicles for inspection
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, token);
  if (vehiclesResult.success) {
    recordTest(role, 'View Vehicles for Inspection', 'passed', `Found ${vehiclesResult.data.count || 0} vehicles`);
    log(`✅ Inspector can view vehicles (${vehiclesResult.data.count || 0} found)`, 'success');
  } else {
    recordTest(role, 'View Vehicles for Inspection', 'failed', vehiclesResult.error);
    log(`❌ Inspector cannot view vehicles: ${JSON.stringify(vehiclesResult.error)}`, 'error');
  }
  
  // Test 2: Create inspection reports (if endpoint exists)
  const inspectionsResult = await makeRequest('GET', '/inspections/', null, token);
  if (inspectionsResult.success) {
    recordTest(role, 'Access Inspections Module', 'passed', `Found ${inspectionsResult.data.count || 0} inspections`);
    log(`✅ Inspector can access inspections module`, 'success');
  } else {
    recordTest(role, 'Access Inspections Module', 'failed', inspectionsResult.error);
    log(`❌ Inspector cannot access inspections module: ${JSON.stringify(inspectionsResult.error)}`, 'error');
  }
  
  // Test 3: Cannot manage users
  const usersResult = await makeRequest('GET', '/account/users/', null, token);
  if (!usersResult.success && (usersResult.status === 403 || usersResult.status === 404)) {
    recordTest(role, 'Cannot Manage Users', 'passed', `Correctly blocked with status: ${usersResult.status}`);
    log(`✅ Inspector correctly blocked from managing users`, 'success');
  } else if (usersResult.success) {
    recordTest(role, 'Cannot Manage Users', 'failed', 'Should be blocked but access granted');
    log(`❌ Inspector should not manage users but can`, 'error');
  } else {
    recordTest(role, 'Cannot Manage Users', 'skipped', `Unexpected error: ${usersResult.error}`);
    log(`⚠️ Inspector users test skipped: ${JSON.stringify(usersResult.error)}`, 'warning');
  }
}

// Web Application Tests
async function testWebApplication() {
  log('🌐 Testing Web Application', 'info');
  
  try {
    // Test web application accessibility
    const response = await axios.get(WEB_URL, { timeout: 10000 });
    if (response.status === 200) {
      recordTest('web', 'Web Application Accessibility', 'passed', `Status: ${response.status}`);
      log(`✅ Web application is accessible`, 'success');
    } else {
      recordTest('web', 'Web Application Accessibility', 'failed', `Status: ${response.status}`);
      log(`❌ Web application not accessible: ${response.status}`, 'error');
    }
  } catch (error) {
    recordTest('web', 'Web Application Accessibility', 'failed', error.message);
    log(`❌ Web application not accessible: ${error.message}`, 'error');
  }
}

// API Health Check
async function testAPIHealth() {
  log('🏥 Testing API Health', 'info');
  
  // Test basic API endpoints
  const endpoints = [
    '/account/login/',
    '/account/register/',
    '/fleet/vehicles/',
    '/inspections/',
    '/issues/',
    '/tickets/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest('GET', endpoint);
      if (result.status === 200 || result.status === 401 || result.status === 405) {
        recordTest('api', `API Endpoint: ${endpoint}`, 'passed', `Status: ${result.status}`);
        log(`✅ API endpoint ${endpoint} is responding`, 'success');
      } else {
        recordTest('api', `API Endpoint: ${endpoint}`, 'failed', `Status: ${result.status}`);
        log(`❌ API endpoint ${endpoint} error: ${result.status}`, 'error');
      }
    } catch (error) {
      recordTest('api', `API Endpoint: ${endpoint}`, 'failed', error.message);
      log(`❌ API endpoint ${endpoint} failed: ${error.message}`, 'error');
    }
  }
}

// Main Test Execution
async function runComprehensiveTests() {
  log('🚀 Starting Comprehensive Production Testing', 'info');
  log('=' * 60, 'info');
  
  // Test API Health
  await testAPIHealth();
  
  // Test Web Application
  await testWebApplication();
  
  // Test each user role
  for (const [roleName, userData] of Object.entries(testUsers)) {
    log(`\n🔐 Testing ${roleName.toUpperCase()} Role`, 'info');
    log('-' * 40, 'info');
    
    const loginResult = await loginUser(userData);
    if (loginResult.success) {
      switch (roleName) {
        case 'admin':
          await testAdminRole(loginResult.token);
          break;
        case 'staff':
          await testStaffRole(loginResult.token);
          break;
        case 'driver':
          await testDriverRole(loginResult.token);
          break;
        case 'inspector':
          await testInspectorRole(loginResult.token);
          break;
      }
    } else {
      log(`❌ Cannot test ${roleName} role - login failed`, 'error');
      recordTest(roleName, 'Login', 'failed', loginResult.error);
    }
  }
  
  // Generate Report
  generateTestReport();
}

function generateTestReport() {
  log('\n📊 Generating Test Report', 'info');
  log('=' * 60, 'info');
  
  // Console Summary
  console.log('\n📈 TEST SUMMARY');
  console.log('=' * 40);
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`⚠️ Skipped: ${testResults.summary.skipped}`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
  
  // Role-specific summaries
  console.log('\n🔐 ROLE-SPECIFIC RESULTS');
  console.log('=' * 40);
  for (const [role, roleResults] of Object.entries(testResults.roles)) {
    console.log(`\n${role.toUpperCase()}:`);
    console.log(`  Total: ${roleResults.summary.total}`);
    console.log(`  ✅ Passed: ${roleResults.summary.passed}`);
    console.log(`  ❌ Failed: ${roleResults.summary.failed}`);
    console.log(`  ⚠️ Skipped: ${roleResults.summary.skipped}`);
    console.log(`  Success Rate: ${((roleResults.summary.passed / roleResults.summary.total) * 100).toFixed(2)}%`);
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'PRODUCTION_TEST_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'success');
  
  // Generate HTML report
  generateHTMLReport();
}

function generateHTMLReport() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fleet Management System - Production Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { padding: 20px; border-radius: 8px; text-align: center; color: white; }
        .total { background-color: #3498db; }
        .passed { background-color: #27ae60; }
        .failed { background-color: #e74c3c; }
        .skipped { background-color: #f39c12; }
        .role-section { margin-bottom: 30px; }
        .role-header { background-color: #2c3e50; color: white; padding: 15px; border-radius: 8px 8px 0 0; }
        .test-list { background-color: #ecf0f1; padding: 15px; border-radius: 0 0 8px 8px; }
        .test-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 5px 0; background: white; border-radius: 4px; }
        .status-passed { color: #27ae60; font-weight: bold; }
        .status-failed { color: #e74c3c; font-weight: bold; }
        .status-skipped { color: #f39c12; font-weight: bold; }
        .timestamp { color: #7f8c8d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Fleet Management System</h1>
            <h2>Production Test Report</h2>
            <p class="timestamp">Generated: ${testResults.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>Total Tests</h3>
                <h2>${testResults.summary.total}</h2>
            </div>
            <div class="summary-card passed">
                <h3>Passed</h3>
                <h2>${testResults.summary.passed}</h2>
            </div>
            <div class="summary-card failed">
                <h3>Failed</h3>
                <h2>${testResults.summary.failed}</h2>
            </div>
            <div class="summary-card skipped">
                <h3>Skipped</h3>
                <h2>${testResults.summary.skipped}</h2>
            </div>
        </div>
        
        ${Object.entries(testResults.roles).map(([role, roleResults]) => `
        <div class="role-section">
            <div class="role-header">
                <h3>${role.toUpperCase()} Role Tests</h3>
                <p>Success Rate: ${((roleResults.summary.passed / roleResults.summary.total) * 100).toFixed(2)}%</p>
            </div>
            <div class="test-list">
                ${roleResults.tests.map(test => `
                <div class="test-item">
                    <span>${test.name}</span>
                    <div>
                        <span class="status-${test.status}">${test.status.toUpperCase()}</span>
                        <span class="timestamp">${new Date(test.timestamp).toLocaleString()}</span>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        `).join('')}
    </div>
</body>
</html>`;
  
  const htmlPath = path.join(__dirname, 'PRODUCTION_TEST_REPORT.html');
  fs.writeFileSync(htmlPath, htmlContent);
  log(`📄 HTML report saved to: ${htmlPath}`, 'success');
}

// Run the tests
if (require.main === module) {
  runComprehensiveTests().catch(error => {
    log(`❌ Test execution failed: ${error.message}`, 'error');
    testResults.errors.push(error.message);
    generateTestReport();
    process.exit(1);
  });
}

module.exports = { runComprehensiveTests, testResults };
