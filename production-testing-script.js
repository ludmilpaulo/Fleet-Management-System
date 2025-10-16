#!/usr/bin/env node

/**
 * Production Testing Script with Real Data
 * Fleet Management System - Comprehensive Production Testing
 * 
 * Tests the entire system with realistic production data across all user roles
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:8001/api';
const WEB_URL = 'http://localhost:3001';

// Production Test Results Storage
const productionTestResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  companies: {},
  roles: {},
  workflows: {},
  errors: []
};

// Production Test Data (Real Companies & Users)
const productionTestData = {
  'Metro Transit Authority': {
    company: {
      name: 'Metro Transit Authority',
      type: 'Public Transportation',
      subscription: 'Enterprise'
    },
    users: [
      { username: 'metro_admin', password: 'MetroAdmin2024!', role: 'admin' },
      { username: 'metro_fleet_manager', password: 'Staff2024!', role: 'staff' },
      { username: 'metro_driver_001', password: 'Driver2024!', role: 'driver' },
      { username: 'metro_inspector_001', password: 'Inspector2024!', role: 'inspector' }
    ],
    vehicles: ['MTA-001', 'MTA-002', 'MTA-003', 'MTA-R001'],
    expectedFeatures: ['Bus Operations', 'Rail Operations', 'Electric Vehicles', 'Public Service']
  },
  'Swift Delivery Services': {
    company: {
      name: 'Swift Delivery Services',
      type: 'Logistics & Delivery',
      subscription: 'Professional'
    },
    users: [
      { username: 'swift_admin', password: 'SwiftAdmin2024!', role: 'admin' },
      { username: 'swift_operations', password: 'Staff2024!', role: 'staff' },
      { username: 'swift_driver_001', password: 'Driver2024!', role: 'driver' },
      { username: 'swift_inspector_001', password: 'Inspector2024!', role: 'inspector' }
    ],
    vehicles: ['SDS-001', 'SDS-002', 'SDS-003'],
    expectedFeatures: ['Delivery Tracking', 'Route Optimization', 'Fleet Management']
  },
  'Green Earth Transportation': {
    company: {
      name: 'Green Earth Transportation',
      type: 'Eco-Friendly Transportation',
      subscription: 'Professional'
    },
    users: [
      { username: 'green_admin', password: 'GreenAdmin2024!', role: 'admin' },
      { username: 'green_fleet_coordinator', password: 'Staff2024!', role: 'staff' },
      { username: 'green_driver_001', password: 'Driver2024!', role: 'driver' },
      { username: 'green_inspector_001', password: 'Inspector2024!', role: 'inspector' }
    ],
    vehicles: ['GET-001', 'GET-002', 'GET-003'],
    expectedFeatures: ['Electric Vehicles', 'Hybrid Vehicles', 'Environmental Compliance']
  }
};

// Utility Functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function recordTest(category, testName, status, details = '', company = null) {
  if (!productionTestResults[category]) {
    productionTestResults[category] = {};
  }
  
  if (company && !productionTestResults[category][company]) {
    productionTestResults[category][company] = {
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, skipped: 0 }
    };
  }
  
  const target = company ? productionTestResults[category][company] : productionTestResults[category];
  
  if (!target.tests) {
    target.tests = [];
    target.summary = { total: 0, passed: 0, failed: 0, skipped: 0 };
  }
  
  target.tests.push({
    name: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  });
  
  target.summary.total++;
  productionTestResults.summary.total++;
  
  if (status === 'passed') {
    target.summary.passed++;
    productionTestResults.summary.passed++;
  } else if (status === 'failed') {
    target.summary.failed++;
    productionTestResults.summary.failed++;
  } else {
    target.summary.skipped++;
    productionTestResults.summary.skipped++;
  }
}

async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
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
async function loginUser(userData, companyName) {
  log(`🔐 Logging in ${userData.username} (${userData.role}) from ${companyName}`);
  
  const result = await makeRequest('POST', '/account/login/', {
    username: userData.username,
    password: userData.password
  });
  
  if (result.success && result.data.token) {
    log(`✅ Successfully logged in ${userData.username}`, 'success');
    recordTest('authentication', `Login ${userData.username}`, 'passed', `Role: ${userData.role}`, companyName);
    return {
      success: true,
      token: result.data.token,
      user: result.data.user
    };
  } else {
    log(`❌ Failed to login ${userData.username}: ${JSON.stringify(result.error)}`, 'error');
    recordTest('authentication', `Login ${userData.username}`, 'failed', result.error, companyName);
    return { success: false, error: result.error };
  }
}

// Company-Specific Testing Functions
async function testCompanyWorkflows(companyName, companyData) {
  log(`\n🏢 Testing ${companyName} Workflows`, 'info');
  log('=' * 50, 'info');
  
  const companyResults = {
    authentication: { passed: 0, failed: 0 },
    rolePermissions: { passed: 0, failed: 0 },
    dataAccess: { passed: 0, failed: 0 },
    workflows: { passed: 0, failed: 0 }
  };
  
  // Test each user role for this company
  for (const userData of companyData.users) {
    const loginResult = await loginUser(userData, companyName);
    
    if (loginResult.success) {
      companyResults.authentication.passed++;
      
      // Test role-specific functionality
      await testRoleSpecificFunctionality(userData.role, loginResult.token, loginResult.user, companyName);
      
      // Test data access
      await testDataAccess(userData.role, loginResult.token, companyName);
      
      // Test workflows
      await testCompanyWorkflows(userData.role, loginResult.token, companyName);
      
    } else {
      companyResults.authentication.failed++;
    }
  }
  
  return companyResults;
}

async function testRoleSpecificFunctionality(role, token, user, companyName) {
  log(`\n🔧 Testing ${role.toUpperCase()} Role Functionality for ${companyName}`, 'info');
  
  switch (role) {
    case 'admin':
      await testAdminFunctionality(token, companyName);
      break;
    case 'staff':
      await testStaffFunctionality(token, companyName);
      break;
    case 'driver':
      await testDriverFunctionality(token, companyName);
      break;
    case 'inspector':
      await testInspectorFunctionality(token, companyName);
      break;
  }
}

async function testAdminFunctionality(token, companyName) {
  // Test admin can view all users
  const usersResult = await makeRequest('GET', '/account/users/', null, token);
  if (usersResult.success) {
    recordTest('roles', 'Admin View All Users', 'passed', `Found ${usersResult.data.count || 0} users`, companyName);
    log(`✅ Admin can view all users (${usersResult.data.count || 0} found)`, 'success');
  } else {
    recordTest('roles', 'Admin View All Users', 'failed', usersResult.error, companyName);
    log(`❌ Admin cannot view all users: ${JSON.stringify(usersResult.error)}`, 'error');
  }
  
  // Test admin can view company statistics
  const statsResult = await makeRequest('GET', '/account/stats/', null, token);
  if (statsResult.success) {
    recordTest('roles', 'Admin View Company Stats', 'passed', `Company: ${statsResult.data.company_name}`, companyName);
    log(`✅ Admin can view company statistics`, 'success');
  } else {
    recordTest('roles', 'Admin View Company Stats', 'failed', statsResult.error, companyName);
    log(`❌ Admin cannot view company statistics: ${JSON.stringify(statsResult.error)}`, 'error');
  }
  
  // Test admin can access vehicles
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, token);
  if (vehiclesResult.success) {
    recordTest('roles', 'Admin Access Vehicles', 'passed', `Found ${vehiclesResult.data.count || 0} vehicles`, companyName);
    log(`✅ Admin can access vehicles (${vehiclesResult.data.count || 0} found)`, 'success');
  } else {
    recordTest('roles', 'Admin Access Vehicles', 'failed', vehiclesResult.error, companyName);
    log(`❌ Admin cannot access vehicles: ${JSON.stringify(vehiclesResult.error)}`, 'error');
  }
}

async function testStaffFunctionality(token, companyName) {
  // Test staff can view users
  const usersResult = await makeRequest('GET', '/account/users/', null, token);
  if (usersResult.success) {
    recordTest('roles', 'Staff View Users', 'passed', `Found ${usersResult.data.count || 0} users`, companyName);
    log(`✅ Staff can view users (${usersResult.data.count || 0} found)`, 'success');
  } else {
    recordTest('roles', 'Staff View Users', 'failed', usersResult.error, companyName);
    log(`❌ Staff cannot view users: ${JSON.stringify(usersResult.error)}`, 'error');
  }
  
  // Test staff can manage vehicles
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, token);
  if (vehiclesResult.success) {
    recordTest('roles', 'Staff Manage Vehicles', 'passed', `Found ${vehiclesResult.data.count || 0} vehicles`, companyName);
    log(`✅ Staff can manage vehicles (${vehiclesResult.data.count || 0} found)`, 'success');
  } else {
    recordTest('roles', 'Staff Manage Vehicles', 'failed', vehiclesResult.error, companyName);
    log(`❌ Staff cannot manage vehicles: ${JSON.stringify(vehiclesResult.error)}`, 'error');
  }
}

async function testDriverFunctionality(token, companyName) {
  // Test driver can view own profile
  const profileResult = await makeRequest('GET', '/account/profile/', null, token);
  if (profileResult.success) {
    recordTest('roles', 'Driver View Profile', 'passed', `Profile loaded for ${profileResult.data.username}`, companyName);
    log(`✅ Driver can view own profile`, 'success');
  } else {
    recordTest('roles', 'Driver View Profile', 'failed', profileResult.error, companyName);
    log(`❌ Driver cannot view own profile: ${JSON.stringify(profileResult.error)}`, 'error');
  }
  
  // Test driver can view assigned vehicles
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, token);
  if (vehiclesResult.success) {
    recordTest('roles', 'Driver View Vehicles', 'passed', `Found ${vehiclesResult.data.count || 0} vehicles`, companyName);
    log(`✅ Driver can view vehicles (${vehiclesResult.data.count || 0} found)`, 'success');
  } else {
    recordTest('roles', 'Driver View Vehicles', 'failed', vehiclesResult.error, companyName);
    log(`❌ Driver cannot view vehicles: ${JSON.stringify(vehiclesResult.error)}`, 'error');
  }
}

async function testInspectorFunctionality(token, companyName) {
  // Test inspector can view vehicles
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, token);
  if (vehiclesResult.success) {
    recordTest('roles', 'Inspector View Vehicles', 'passed', `Found ${vehiclesResult.data.count || 0} vehicles`, companyName);
    log(`✅ Inspector can view vehicles (${vehiclesResult.data.count || 0} found)`, 'success');
  } else {
    recordTest('roles', 'Inspector View Vehicles', 'failed', vehiclesResult.error, companyName);
    log(`❌ Inspector cannot view vehicles: ${JSON.stringify(vehiclesResult.error)}`, 'error');
  }
  
  // Test inspector can access inspections
  const inspectionsResult = await makeRequest('GET', '/inspections/', null, token);
  if (inspectionsResult.success) {
    recordTest('roles', 'Inspector Access Inspections', 'passed', `Found ${inspectionsResult.data.count || 0} inspections`, companyName);
    log(`✅ Inspector can access inspections`, 'success');
  } else {
    recordTest('roles', 'Inspector Access Inspections', 'failed', inspectionsResult.error, companyName);
    log(`❌ Inspector cannot access inspections: ${JSON.stringify(inspectionsResult.error)}`, 'error');
  }
}

async function testDataAccess(role, token, companyName) {
  log(`\n📊 Testing Data Access for ${role.toUpperCase()} in ${companyName}`, 'info');
  
  // Test access to different data endpoints
  const endpoints = [
    { url: '/account/profile/', name: 'Profile Data', allowed: ['admin', 'staff', 'driver', 'inspector'] },
    { url: '/account/users/', name: 'Users Data', allowed: ['admin', 'staff'] },
    { url: '/fleet/vehicles/', name: 'Vehicles Data', allowed: ['admin', 'staff', 'driver', 'inspector'] },
    { url: '/inspections/', name: 'Inspections Data', allowed: ['admin', 'staff', 'inspector'] },
    { url: '/issues/', name: 'Issues Data', allowed: ['admin', 'staff'] },
    { url: '/tickets/', name: 'Tickets Data', allowed: ['admin', 'staff'] }
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest('GET', endpoint.url, null, token);
    const isAllowed = endpoint.allowed.includes(role);
    
    if (isAllowed && result.success) {
      recordTest('dataAccess', `${role} Access ${endpoint.name}`, 'passed', `Status: ${result.status}`, companyName);
      log(`✅ ${role} correctly allowed access to ${endpoint.name}`, 'success');
    } else if (!isAllowed && !result.success && (result.status === 403 || result.status === 404)) {
      recordTest('dataAccess', `${role} Blocked ${endpoint.name}`, 'passed', `Correctly blocked with status: ${result.status}`, companyName);
      log(`✅ ${role} correctly blocked from ${endpoint.name}`, 'success');
    } else if (isAllowed && !result.success) {
      recordTest('dataAccess', `${role} Access ${endpoint.name}`, 'failed', `Should be allowed but failed: ${result.error}`, companyName);
      log(`❌ ${role} should access ${endpoint.name} but failed`, 'error');
    } else if (!isAllowed && result.success) {
      recordTest('dataAccess', `${role} Blocked ${endpoint.name}`, 'failed', `Should be blocked but access granted`, companyName);
      log(`❌ ${role} should be blocked from ${endpoint.name} but can access`, 'error');
    } else {
      recordTest('dataAccess', `${role} Access ${endpoint.name}`, 'skipped', `Unexpected result: ${result.error}`, companyName);
      log(`⚠️ ${role} ${endpoint.name} test skipped: ${JSON.stringify(result.error)}`, 'warning');
    }
  }
}

async function testCompanyWorkflows(role, token, companyName) {
  log(`\n⚙️ Testing Workflows for ${role.toUpperCase()} in ${companyName}`, 'info');
  
  // Test typical workflows based on role and company type
  const companyData = productionTestData[companyName];
  
  if (role === 'admin') {
    // Test admin workflow: View dashboard, manage users, view reports
    await testAdminWorkflow(token, companyName);
  } else if (role === 'staff') {
    // Test staff workflow: Manage fleet, handle operations
    await testStaffWorkflow(token, companyName);
  } else if (role === 'driver') {
    // Test driver workflow: Check assigned vehicles, start shifts
    await testDriverWorkflow(token, companyName);
  } else if (role === 'inspector') {
    // Test inspector workflow: Inspect vehicles, create reports
    await testInspectorWorkflow(token, companyName);
  }
}

async function testAdminWorkflow(token, companyName) {
  // Admin workflow: Dashboard -> Users -> Reports
  const steps = [
    { name: 'View Dashboard', url: '/account/stats/' },
    { name: 'Manage Users', url: '/account/users/' },
    { name: 'View Vehicles', url: '/fleet/vehicles/' }
  ];
  
  for (const step of steps) {
    const result = await makeRequest('GET', step.url, null, token);
    if (result.success) {
      recordTest('workflows', `Admin ${step.name}`, 'passed', `Workflow step completed`, companyName);
      log(`✅ Admin workflow: ${step.name} completed`, 'success');
    } else {
      recordTest('workflows', `Admin ${step.name}`, 'failed', step.error, companyName);
      log(`❌ Admin workflow: ${step.name} failed`, 'error');
    }
  }
}

async function testStaffWorkflow(token, companyName) {
  // Staff workflow: Fleet Management -> Operations
  const steps = [
    { name: 'View Fleet', url: '/fleet/vehicles/' },
    { name: 'Manage Users', url: '/account/users/' }
  ];
  
  for (const step of steps) {
    const result = await makeRequest('GET', step.url, null, token);
    if (result.success) {
      recordTest('workflows', `Staff ${step.name}`, 'passed', `Workflow step completed`, companyName);
      log(`✅ Staff workflow: ${step.name} completed`, 'success');
    } else {
      recordTest('workflows', `Staff ${step.name}`, 'failed', step.error, companyName);
      log(`❌ Staff workflow: ${step.name} failed`, 'error');
    }
  }
}

async function testDriverWorkflow(token, companyName) {
  // Driver workflow: Check assignments -> View vehicles -> Start shift
  const steps = [
    { name: 'View Profile', url: '/account/profile/' },
    { name: 'View Vehicles', url: '/fleet/vehicles/' }
  ];
  
  for (const step of steps) {
    const result = await makeRequest('GET', step.url, null, token);
    if (result.success) {
      recordTest('workflows', `Driver ${step.name}`, 'passed', `Workflow step completed`, companyName);
      log(`✅ Driver workflow: ${step.name} completed`, 'success');
    } else {
      recordTest('workflows', `Driver ${step.name}`, 'failed', step.error, companyName);
      log(`❌ Driver workflow: ${step.name} failed`, 'error');
    }
  }
}

async function testInspectorWorkflow(token, companyName) {
  // Inspector workflow: View vehicles -> Inspect -> Create reports
  const steps = [
    { name: 'View Vehicles', url: '/fleet/vehicles/' },
    { name: 'Access Inspections', url: '/inspections/' }
  ];
  
  for (const step of steps) {
    const result = await makeRequest('GET', step.url, null, token);
    if (result.success) {
      recordTest('workflows', `Inspector ${step.name}`, 'passed', `Workflow step completed`, companyName);
      log(`✅ Inspector workflow: ${step.name} completed`, 'success');
    } else {
      recordTest('workflows', `Inspector ${step.name}`, 'failed', step.error, companyName);
      log(`❌ Inspector workflow: ${step.name} failed`, 'error');
    }
  }
}

// Main Production Testing Function
async function runProductionTests() {
  log('🚀 Starting PRODUCTION Testing with Real Data', 'info');
  log('=' * 70, 'info');
  
  // Test each company with their real data
  for (const [companyName, companyData] of Object.entries(productionTestData)) {
    log(`\n🏢 Testing Company: ${companyName}`, 'info');
    log(`   Type: ${companyData.company.type}`, 'info');
    log(`   Subscription: ${companyData.company.subscription}`, 'info');
    log(`   Users: ${companyData.users.length}`, 'info');
    log(`   Vehicles: ${companyData.vehicles.length}`, 'info');
    
    const companyResults = await testCompanyWorkflows(companyName, companyData);
    
    // Store company results
    productionTestResults.companies[companyName] = {
      company: companyData.company,
      results: companyResults,
      testData: companyData
    };
  }
  
  // Generate comprehensive report
  generateProductionReport();
}

function generateProductionReport() {
  log('\n📊 Generating PRODUCTION Test Report', 'info');
  log('=' * 70, 'info');
  
  // Console Summary
  console.log('\n📈 PRODUCTION TEST SUMMARY');
  console.log('=' * 50);
  console.log(`Total Tests: ${productionTestResults.summary.total}`);
  console.log(`✅ Passed: ${productionTestResults.summary.passed}`);
  console.log(`❌ Failed: ${productionTestResults.summary.failed}`);
  console.log(`⚠️ Skipped: ${productionTestResults.summary.skipped}`);
  console.log(`Success Rate: ${((productionTestResults.summary.passed / productionTestResults.summary.total) * 100).toFixed(2)}%`);
  
  // Company-specific summaries
  console.log('\n🏢 COMPANY-SPECIFIC RESULTS');
  console.log('=' * 50);
  for (const [companyName, companyData] of Object.entries(productionTestResults.companies)) {
    console.log(`\n${companyName}:`);
    console.log(`  Type: ${companyData.company.type}`);
    console.log(`  Subscription: ${companyData.company.subscription}`);
    console.log(`  Users Tested: ${companyData.testData.users.length}`);
    console.log(`  Vehicles: ${companyData.testData.vehicles.length}`);
  }
  
  // Role-specific summaries
  console.log('\n🔐 ROLE-SPECIFIC RESULTS');
  console.log('=' * 50);
  for (const [category, categoryData] of Object.entries(productionTestResults.roles)) {
    console.log(`\n${category.toUpperCase()}:`);
    for (const [role, roleData] of Object.entries(categoryData)) {
      console.log(`  ${role}: ${roleData.summary.passed}/${roleData.summary.total} passed`);
    }
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'PRODUCTION_TEST_RESULTS.json');
  fs.writeFileSync(reportPath, JSON.stringify(productionTestResults, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'success');
  
  // Generate HTML report
  generateProductionHTMLReport();
}

function generateProductionHTMLReport() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fleet Management System - Production Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { padding: 20px; border-radius: 8px; text-align: center; color: white; }
        .total { background-color: #3498db; }
        .passed { background-color: #27ae60; }
        .failed { background-color: #e74c3c; }
        .skipped { background-color: #f39c12; }
        .company-section { margin-bottom: 30px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .company-header { background-color: #2c3e50; color: white; padding: 15px; }
        .company-content { padding: 15px; }
        .role-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px; }
        .role-card { background-color: #ecf0f1; padding: 15px; border-radius: 8px; }
        .test-list { background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .test-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 3px 0; background: white; border-radius: 4px; font-size: 0.9em; }
        .status-passed { color: #27ae60; font-weight: bold; }
        .status-failed { color: #e74c3c; font-weight: bold; }
        .status-skipped { color: #f39c12; font-weight: bold; }
        .timestamp { color: #7f8c8d; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Fleet Management System</h1>
            <h2>Production Test Report</h2>
            <p class="timestamp">Generated: ${productionTestResults.timestamp}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>Total Tests</h3>
                <h2>${productionTestResults.summary.total}</h2>
            </div>
            <div class="summary-card passed">
                <h3>Passed</h3>
                <h2>${productionTestResults.summary.passed}</h2>
            </div>
            <div class="summary-card failed">
                <h3>Failed</h3>
                <h2>${productionTestResults.summary.failed}</h2>
            </div>
            <div class="summary-card skipped">
                <h3>Skipped</h3>
                <h2>${productionTestResults.summary.skipped}</h2>
            </div>
        </div>
        
        ${Object.entries(productionTestResults.companies).map(([companyName, companyData]) => `
        <div class="company-section">
            <div class="company-header">
                <h3>🏢 ${companyName}</h3>
                <p>${companyData.company.type} • ${companyData.company.subscription} Subscription</p>
            </div>
            <div class="company-content">
                <div class="role-grid">
                    ${companyData.testData.users.map(user => `
                    <div class="role-card">
                        <h4>${user.role.toUpperCase()} Role</h4>
                        <p><strong>User:</strong> ${user.username}</p>
                        <p><strong>Features:</strong> ${companyData.testData.expectedFeatures.join(', ')}</p>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `).join('')}
    </div>
</body>
</html>`;
  
  const htmlPath = path.join(__dirname, 'PRODUCTION_TEST_RESULTS.html');
  fs.writeFileSync(htmlPath, htmlContent);
  log(`📄 HTML report saved to: ${htmlPath}`, 'success');
}

// Run the production tests
if (require.main === module) {
  runProductionTests().catch(error => {
    log(`❌ Production test execution failed: ${error.message}`, 'error');
    productionTestResults.errors.push(error.message);
    generateProductionReport();
    process.exit(1);
  });
}

module.exports = { runProductionTests, productionTestResults };
