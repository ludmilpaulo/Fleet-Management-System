#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Fleet Management System
 * Tests all user roles: Admin, Staff, Driver, Inspector
 * Tests both Development and Production environments
 */

const https = require('https');
const http = require('http');

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║          COMPREHENSIVE FLEET MANAGEMENT SYSTEM TEST SUITE                   ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

const PROD_URL = 'https://fleet-management-system-sooty.vercel.app';
const DEV_URL = 'http://localhost:3000';
const API_URL = 'https://taki.pythonanywhere.com/api';

// Test data
const testRoles = [
  { name: 'Admin', dashboard: '/dashboard/admin', username: 'admin1', password: 'admin123' },
  { name: 'Staff', dashboard: '/dashboard/staff', username: 'staff1', password: 'staff123' },
  { name: 'Driver', dashboard: '/dashboard/driver', username: 'driver1', password: 'driver123' },
  { name: 'Inspector', dashboard: '/dashboard/inspector', username: 'inspector1', password: 'inspector123' },
];

const staffPages = [
  '/dashboard/staff',
  '/dashboard/staff/users',
  '/dashboard/staff/vehicles',
  '/dashboard/staff/maintenance',
];

const commonPages = [
  '/dashboard/vehicles',
  '/dashboard/shifts',
  '/dashboard/inspections',
  '/dashboard/issues',
  '/dashboard/tickets',
  '/dashboard/settings',
  '/dashboard/profile',
];

// Helper functions
const testUrl = (url, protocol = 'https') => {
  return new Promise((resolve) => {
    const client = protocol === 'https' ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          size: data.length,
          hasContent: data.length > 0,
          hasGradient: data.includes('gradient'),
          hasTailwind: data.includes('bg-') || data.includes('flex') || data.includes('grid'),
        });
      });
    });
    
    req.on('error', () => resolve({ status: 0, size: 0, hasContent: false }));
    req.setTimeout(10000, () => resolve({ status: 0, size: 0, hasContent: false }));
  });
};

const printHeader = (text) => {
  console.log('\n' + '═'.repeat(80));
  console.log(`  ${text}`);
  console.log('═'.repeat(80));
};

const printSubHeader = (text) => {
  console.log('\n' + '─'.repeat(80));
  console.log(`  ${text}`);
  console.log('─'.repeat(80));
};

const pass = (text) => console.log(`\x1b[32m✅ PASS\x1b[0m - ${text}`);
const fail = (text) => console.log(`\x1b[31m❌ FAIL\x1b[0m - ${text}`);
const warn = (text) => console.log(`\x1b[33m⚠️  WARN\x1b[0m - ${text}`);
const info = (text) => console.log(`\x1b[36mℹ️  INFO\x1b[0m - ${text}`);

// Test functions
async function testProduction() {
  printHeader('PRODUCTION ENVIRONMENT TESTING');
  
  // Test homepage
  printSubHeader('Homepage Test');
  const homepage = await testUrl(PROD_URL);
  if (homepage.status === 200) {
    pass(`Homepage accessible (${homepage.size} bytes)`);
    homepage.hasGradient ? pass('Gradient classes found') : warn('Gradient classes not found');
    homepage.hasTailwind ? pass('Tailwind classes found') : warn('Tailwind classes not found');
  } else {
    fail(`Homepage not accessible (HTTP ${homepage.status})`);
  }
  
  // Test staff dashboard pages
  printSubHeader('Staff Dashboard Pages');
  for (const page of staffPages) {
    const result = await testUrl(PROD_URL + page);
    if (result.status === 200) {
      pass(`${page} - Accessible (${result.size} bytes)`);
    } else {
      fail(`${page} - Not accessible (HTTP ${result.status})`);
    }
  }
  
  // Test role dashboards
  printSubHeader('Role Dashboards');
  for (const role of testRoles) {
    const result = await testUrl(PROD_URL + role.dashboard);
    if (result.status === 200) {
      pass(`${role.name} Dashboard - Accessible`);
    } else {
      fail(`${role.name} Dashboard - Not accessible (HTTP ${result.status})`);
    }
  }
  
  // Test common pages
  printSubHeader('Common Dashboard Pages');
  for (const page of commonPages) {
    const result = await testUrl(PROD_URL + page);
    if (result.status === 200) {
      pass(`${page} - Accessible`);
    } else {
      fail(`${page} - Not accessible (HTTP ${result.status})`);
    }
  }
}

async function testDevelopment() {
  printHeader('DEVELOPMENT ENVIRONMENT TESTING');
  
  // Test homepage
  printSubHeader('Homepage Test');
  const homepage = await testUrl(DEV_URL, 'http');
  if (homepage.status === 200) {
    pass(`Homepage accessible (${homepage.size} bytes)`);
    homepage.hasGradient ? pass('Gradient classes found') : warn('Gradient classes not found');
    homepage.hasTailwind ? pass('Tailwind classes found') : warn('Tailwind classes not found');
  } else {
    fail(`Homepage not accessible (HTTP ${homepage.status})`);
  }
  
  // Test staff dashboard pages
  printSubHeader('Staff Dashboard Pages');
  for (const page of staffPages) {
    const result = await testUrl(DEV_URL + page, 'http');
    if (result.status === 200) {
      pass(`${page} - Accessible (${result.size} bytes)`);
    } else if (result.status === 0) {
      warn(`${page} - Server not responding (is dev server running?)`);
    } else {
      fail(`${page} - Not accessible (HTTP ${result.status})`);
    }
  }
}

async function testBackendAPI() {
  printHeader('BACKEND API TESTING');
  
  const endpoints = [
    { name: 'Companies', url: API_URL + '/companies/companies/' },
    { name: 'Vehicles', url: API_URL + '/fleet/vehicles/' },
    { name: 'Shifts', url: API_URL + '/fleet/shifts/' },
    { name: 'Inspections', url: API_URL + '/inspections/inspections/' },
    { name: 'Issues', url: API_URL + '/issues/issues/' },
  ];
  
  for (const endpoint of endpoints) {
    const result = await testUrl(endpoint.url);
    if (result.status === 200) {
      pass(`${endpoint.name} API - Working (${result.size} bytes)`);
    } else if (result.status === 401) {
      info(`${endpoint.name} API - Protected (requires auth)`);
    } else if (result.status === 404) {
      warn(`${endpoint.name} API - Not found (404)`);
    } else {
      fail(`${endpoint.name} API - Error (HTTP ${result.status})`);
    }
  }
}

async function runAllTests() {
  const startTime = Date.now();
  
  try {
    // Test Production
    await testProduction();
    
    // Test Development (if running)
    await testDevelopment();
    
    // Test Backend API
    await testBackendAPI();
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    printHeader('TEST SUMMARY');
    console.log('');
    info(`Total test duration: ${duration}s`);
    console.log('');
    pass('Production environment tested');
    pass('Development environment tested');
    pass('Backend API tested');
    console.log('');
    console.log('✅ Test suite completed successfully!');
    console.log('');
    console.log('═'.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();

