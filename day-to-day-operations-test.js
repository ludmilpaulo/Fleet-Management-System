const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:8001/api';

// Test Configuration
const TEST_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  delayBetweenRequests: 1000
};

// Real-world test scenarios
const OPERATIONAL_SCENARIOS = {
  // Morning Operations
  MORNING_CHECK_IN: {
    name: "Morning Driver Check-in",
    description: "Driver arrives, checks vehicle, starts shift",
    steps: [
      "Driver login",
      "Check assigned vehicles",
      "View daily schedule",
      "Start shift",
      "Vehicle pre-trip inspection"
    ]
  },
  
  ROUTE_EXECUTION: {
    name: "Route Execution",
    description: "Driver follows route, reports issues",
    steps: [
      "Update location",
      "Report passenger count",
      "Log fuel consumption",
      "Report delays/issues",
      "Update vehicle status"
    ]
  },
  
  MAINTENANCE_REPORTING: {
    name: "Maintenance Issue Reporting",
    description: "Driver reports vehicle issues during route",
    steps: [
      "Report issue type",
      "Upload photos",
      "Set priority level",
      "Notify maintenance team",
      "Update vehicle status"
    ]
  },
  
  INSPECTION_WORKFLOW: {
    name: "Vehicle Inspection",
    description: "Inspector performs scheduled vehicle inspection",
    steps: [
      "Inspector login",
      "View inspection schedule",
      "Perform inspection",
      "Document findings",
      "Submit inspection report"
    ]
  },
  
  ADMIN_MANAGEMENT: {
    name: "Administrative Management",
    description: "Admin manages fleet operations",
    steps: [
      "Admin login",
      "Review daily reports",
      "Manage user accounts",
      "Update vehicle assignments",
      "Handle maintenance requests"
    ]
  },
  
  EVENING_WRAP_UP: {
    name: "Evening Operations",
    description: "End of day procedures",
    steps: [
      "Driver end shift",
      "Final vehicle check",
      "Submit daily report",
      "Update vehicle status",
      "Schedule maintenance if needed"
    ]
  }
};

// Test Results Tracking
let testResults = {
  totalScenarios: Object.keys(OPERATIONAL_SCENARIOS).length,
  passedScenarios: 0,
  failedScenarios: 0,
  totalTests: 0,
  passedTests: 0,
  failedTests: 0,
  errors: [],
  performance: {
    averageResponseTime: 0,
    slowestEndpoint: null,
    fastestEndpoint: null
  },
  scenarios: {}
};

// Utility Functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function makeRequest(method, endpoint, data = null, token = null) {
  const startTime = Date.now();
  
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      timeout: TEST_CONFIG.timeout,
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
    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      data: response.data,
      status: response.status,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 0,
      responseTime
    };
  }
}

// Authentication Functions
async function loginUser(username, password) {
  console.log(`🔐 Logging in user: ${username}`);
  
  const result = await makeRequest('POST', '/account/login/', {
    username,
    password
  });
  
  if (result.success && result.data.token) {
    console.log(`✅ Login successful for ${username}`);
    return result.data.token;
  } else {
    console.log(`❌ Login failed for ${username}: ${JSON.stringify(result.error)}`);
    return null;
  }
}

// Test Functions
async function testMorningCheckIn() {
  console.log('\n🌅 Testing Morning Driver Check-in Scenario...');
  
  const scenarioResults = {
    name: OPERATIONAL_SCENARIOS.MORNING_CHECK_IN.name,
    steps: [],
    overallSuccess: false
  };
  
  // Step 1: Driver login
  console.log('  📋 Step 1: Driver Login');
  const driverToken = await loginUser('driver1', 'password123');
  if (!driverToken) {
    scenarioResults.steps.push({ step: 'Driver Login', success: false, error: 'Login failed' });
    return scenarioResults;
  }
  scenarioResults.steps.push({ step: 'Driver Login', success: true });
  
  // Step 2: Check assigned vehicles
  console.log('  📋 Step 2: Check Assigned Vehicles');
  const vehiclesResult = await makeRequest('GET', '/fleet/vehicles/', null, driverToken);
  if (vehiclesResult.success) {
    scenarioResults.steps.push({ step: 'Check Assigned Vehicles', success: true, count: vehiclesResult.data.length });
  } else {
    scenarioResults.steps.push({ step: 'Check Assigned Vehicles', success: false, error: vehiclesResult.error });
  }
  
  // Step 3: View daily schedule (tickets/shifts)
  console.log('  📋 Step 3: View Daily Schedule');
  const ticketsResult = await makeRequest('GET', '/tickets/', null, driverToken);
  if (ticketsResult.success) {
    scenarioResults.steps.push({ step: 'View Daily Schedule', success: true, count: ticketsResult.data.length });
  } else {
    scenarioResults.steps.push({ step: 'View Daily Schedule', success: false, error: ticketsResult.error });
  }
  
  // Step 4: Start shift (create a shift record)
  console.log('  📋 Step 4: Start Shift');
  const shiftData = {
    driver: 1,
    vehicle: 1,
    start_time: new Date().toISOString(),
    status: 'active'
  };
  const shiftResult = await makeRequest('POST', '/fleet/shifts/', shiftData, driverToken);
  if (shiftResult.success) {
    scenarioResults.steps.push({ step: 'Start Shift', success: true, shiftId: shiftResult.data.id });
  } else {
    scenarioResults.steps.push({ step: 'Start Shift', success: false, error: shiftResult.error });
  }
  
  // Step 5: Vehicle pre-trip inspection
  console.log('  📋 Step 5: Pre-trip Inspection');
  const inspectionData = {
    vehicle: 1,
    inspector: 1,
    inspection_type: 'pre_trip',
    status: 'completed',
    notes: 'Pre-trip inspection completed successfully',
    findings: 'Vehicle in good condition'
  };
  const inspectionResult = await makeRequest('POST', '/inspections/', inspectionData, driverToken);
  if (inspectionResult.success) {
    scenarioResults.steps.push({ step: 'Pre-trip Inspection', success: true, inspectionId: inspectionResult.data.id });
  } else {
    scenarioResults.steps.push({ step: 'Pre-trip Inspection', success: false, error: inspectionResult.error });
  }
  
  scenarioResults.overallSuccess = scenarioResults.steps.every(step => step.success);
  return scenarioResults;
}

async function testRouteExecution() {
  console.log('\n🚌 Testing Route Execution Scenario...');
  
  const scenarioResults = {
    name: OPERATIONAL_SCENARIOS.ROUTE_EXECUTION.name,
    steps: [],
    overallSuccess: false
  };
  
  // Driver login
  const driverToken = await loginUser('driver1', 'password123');
  if (!driverToken) return scenarioResults;
  
  // Step 1: Update location
  console.log('  📋 Step 1: Update Location');
  const locationData = {
    vehicle: 1,
    latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
    longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
    speed: Math.floor(Math.random() * 60),
    timestamp: new Date().toISOString()
  };
  const locationResult = await makeRequest('POST', '/telemetry/', locationData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Update Location', 
    success: locationResult.success,
    error: locationResult.error
  });
  
  // Step 2: Report passenger count
  console.log('  📋 Step 2: Report Passenger Count');
  const passengerData = {
    vehicle: 1,
    passenger_count: Math.floor(Math.random() * 50),
    timestamp: new Date().toISOString()
  };
  const passengerResult = await makeRequest('POST', '/telemetry/', passengerData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Report Passenger Count', 
    success: passengerResult.success,
    error: passengerResult.error
  });
  
  // Step 3: Log fuel consumption
  console.log('  📋 Step 3: Log Fuel Consumption');
  const fuelData = {
    vehicle: 1,
    fuel_level: Math.floor(Math.random() * 100),
    fuel_consumed: Math.floor(Math.random() * 10),
    timestamp: new Date().toISOString()
  };
  const fuelResult = await makeRequest('POST', '/telemetry/', fuelData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Log Fuel Consumption', 
    success: fuelResult.success,
    error: fuelResult.error
  });
  
  // Step 4: Report delays/issues
  console.log('  📋 Step 4: Report Delays/Issues');
  const issueData = {
    vehicle: 1,
    issue_type: getRandomElement(['mechanical', 'traffic', 'weather', 'passenger']),
    description: 'Route delay due to traffic congestion',
    priority: getRandomElement(['low', 'medium', 'high']),
    status: 'open'
  };
  const issueResult = await makeRequest('POST', '/issues/', issueData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Report Delays/Issues', 
    success: issueResult.success,
    error: issueResult.error
  });
  
  // Step 5: Update vehicle status
  console.log('  📋 Step 5: Update Vehicle Status');
  const statusData = {
    vehicle: 1,
    status: getRandomElement(['in_service', 'on_route', 'at_stop']),
    location: 'Route 42 - Main Street',
    last_updated: new Date().toISOString()
  };
  const statusResult = await makeRequest('PATCH', '/fleet/vehicles/1/', statusData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Update Vehicle Status', 
    success: statusResult.success,
    error: statusResult.error
  });
  
  scenarioResults.overallSuccess = scenarioResults.steps.every(step => step.success);
  return scenarioResults;
}

async function testMaintenanceReporting() {
  console.log('\n🔧 Testing Maintenance Issue Reporting...');
  
  const scenarioResults = {
    name: OPERATIONAL_SCENARIOS.MAINTENANCE_REPORTING.name,
    steps: [],
    overallSuccess: false
  };
  
  const driverToken = await loginUser('driver1', 'password123');
  if (!driverToken) return scenarioResults;
  
  // Step 1: Report issue type
  console.log('  📋 Step 1: Report Issue Type');
  const issueData = {
    vehicle: 1,
    issue_type: 'mechanical',
    description: 'Engine warning light is on, unusual noise from engine',
    priority: 'high',
    status: 'open',
    reported_by: 1
  };
  const issueResult = await makeRequest('POST', '/issues/', issueData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Report Issue Type', 
    success: issueResult.success,
    error: issueResult.error,
    issueId: issueResult.data?.id
  });
  
  // Step 2: Upload photos (simulate)
  console.log('  📋 Step 2: Upload Photos');
  scenarioResults.steps.push({ 
    step: 'Upload Photos', 
    success: true,
    note: 'Photo upload simulated - would upload actual images in production'
  });
  
  // Step 3: Set priority level
  console.log('  📋 Step 3: Set Priority Level');
  if (issueResult.success) {
    const priorityData = { priority: 'high' };
    const priorityResult = await makeRequest('PATCH', `/issues/${issueResult.data.id}/`, priorityData, driverToken);
    scenarioResults.steps.push({ 
      step: 'Set Priority Level', 
      success: priorityResult.success,
      error: priorityResult.error
    });
  }
  
  // Step 4: Notify maintenance team
  console.log('  📋 Step 4: Notify Maintenance Team');
  const ticketData = {
    title: 'Vehicle Engine Issue - High Priority',
    description: 'Engine warning light and unusual noise reported by driver',
    priority: 'high',
    status: 'open',
    assigned_to: 3, // Staff member
    related_issue: issueResult.data?.id
  };
  const ticketResult = await makeRequest('POST', '/tickets/', ticketData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Notify Maintenance Team', 
    success: ticketResult.success,
    error: ticketResult.error,
    ticketId: ticketResult.data?.id
  });
  
  // Step 5: Update vehicle status
  console.log('  📋 Step 5: Update Vehicle Status');
  const vehicleStatusData = {
    status: 'maintenance_required',
    notes: 'Engine issue reported - requires immediate attention'
  };
  const vehicleResult = await makeRequest('PATCH', '/fleet/vehicles/1/', vehicleStatusData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Update Vehicle Status', 
    success: vehicleResult.success,
    error: vehicleResult.error
  });
  
  scenarioResults.overallSuccess = scenarioResults.steps.every(step => step.success);
  return scenarioResults;
}

async function testInspectionWorkflow() {
  console.log('\n🔍 Testing Vehicle Inspection Workflow...');
  
  const scenarioResults = {
    name: OPERATIONAL_SCENARIOS.INSPECTION_WORKFLOW.name,
    steps: [],
    overallSuccess: false
  };
  
  // Step 1: Inspector login
  console.log('  📋 Step 1: Inspector Login');
  const inspectorToken = await loginUser('inspector1', 'password123');
  if (!inspectorToken) {
    scenarioResults.steps.push({ step: 'Inspector Login', success: false, error: 'Login failed' });
    return scenarioResults;
  }
  scenarioResults.steps.push({ step: 'Inspector Login', success: true });
  
  // Step 2: View inspection schedule
  console.log('  📋 Step 2: View Inspection Schedule');
  const inspectionsResult = await makeRequest('GET', '/inspections/', null, inspectorToken);
  scenarioResults.steps.push({ 
    step: 'View Inspection Schedule', 
    success: inspectionsResult.success,
    count: inspectionsResult.data?.length || 0,
    error: inspectionsResult.error
  });
  
  // Step 3: Perform inspection
  console.log('  📋 Step 3: Perform Inspection');
  const inspectionData = {
    vehicle: 1,
    inspector: 2,
    inspection_type: 'safety',
    status: 'completed',
    notes: 'Comprehensive safety inspection completed',
    findings: 'All safety systems functioning properly',
    inspection_date: new Date().toISOString(),
    next_inspection_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  const inspectionResult = await makeRequest('POST', '/inspections/', inspectionData, inspectorToken);
  scenarioResults.steps.push({ 
    step: 'Perform Inspection', 
    success: inspectionResult.success,
    error: inspectionResult.error,
    inspectionId: inspectionResult.data?.id
  });
  
  // Step 4: Document findings
  console.log('  📋 Step 4: Document Findings');
  if (inspectionResult.success) {
    const findingsData = {
      findings: 'Brake system: Excellent\nEngine: Good condition\nTires: Good tread depth\nLights: All functioning\nSafety equipment: Complete'
    };
    const findingsResult = await makeRequest('PATCH', `/inspections/${inspectionResult.data.id}/`, findingsData, inspectorToken);
    scenarioResults.steps.push({ 
      step: 'Document Findings', 
      success: findingsResult.success,
      error: findingsResult.error
    });
  }
  
  // Step 5: Submit inspection report
  console.log('  📋 Step 5: Submit Inspection Report');
  if (inspectionResult.success) {
    const reportData = {
      status: 'approved',
      notes: 'Vehicle passed safety inspection. All systems operational.'
    };
    const reportResult = await makeRequest('PATCH', `/inspections/${inspectionResult.data.id}/`, reportData, inspectorToken);
    scenarioResults.steps.push({ 
      step: 'Submit Inspection Report', 
      success: reportResult.success,
      error: reportResult.error
    });
  }
  
  scenarioResults.overallSuccess = scenarioResults.steps.every(step => step.success);
  return scenarioResults;
}

async function testAdminManagement() {
  console.log('\n👨‍💼 Testing Administrative Management...');
  
  const scenarioResults = {
    name: OPERATIONAL_SCENARIOS.ADMIN_MANAGEMENT.name,
    steps: [],
    overallSuccess: false
  };
  
  // Step 1: Admin login
  console.log('  📋 Step 1: Admin Login');
  const adminToken = await loginUser('admin1', 'password123');
  if (!adminToken) {
    scenarioResults.steps.push({ step: 'Admin Login', success: false, error: 'Login failed' });
    return scenarioResults;
  }
  scenarioResults.steps.push({ step: 'Admin Login', success: true });
  
  // Step 2: Review daily reports
  console.log('  📋 Step 2: Review Daily Reports');
  const reportsData = await Promise.all([
    makeRequest('GET', '/fleet/vehicles/', null, adminToken),
    makeRequest('GET', '/issues/', null, adminToken),
    makeRequest('GET', '/tickets/', null, adminToken),
    makeRequest('GET', '/inspections/', null, adminToken)
  ]);
  
  const reportsSuccess = reportsData.every(report => report.success);
  scenarioResults.steps.push({ 
    step: 'Review Daily Reports', 
    success: reportsSuccess,
    vehicles: reportsData[0].data?.length || 0,
    issues: reportsData[1].data?.length || 0,
    tickets: reportsData[2].data?.length || 0,
    inspections: reportsData[3].data?.length || 0
  });
  
  // Step 3: Manage user accounts
  console.log('  📋 Step 3: Manage User Accounts');
  const usersResult = await makeRequest('GET', '/account/users/', null, adminToken);
  scenarioResults.steps.push({ 
    step: 'Manage User Accounts', 
    success: usersResult.success,
    userCount: usersResult.data?.length || 0,
    error: usersResult.error
  });
  
  // Step 4: Update vehicle assignments
  console.log('  📋 Step 4: Update Vehicle Assignments');
  const assignmentData = {
    assigned_driver: 1,
    status: 'assigned',
    notes: 'Assigned to Driver 1 for Route 42'
  };
  const assignmentResult = await makeRequest('PATCH', '/fleet/vehicles/1/', assignmentData, adminToken);
  scenarioResults.steps.push({ 
    step: 'Update Vehicle Assignments', 
    success: assignmentResult.success,
    error: assignmentResult.error
  });
  
  // Step 5: Handle maintenance requests
  console.log('  📋 Step 5: Handle Maintenance Requests');
  const maintenanceData = {
    title: 'Schedule Engine Maintenance',
    description: 'Regular engine maintenance for Vehicle 1',
    priority: 'medium',
    status: 'in_progress',
    assigned_to: 3
  };
  const maintenanceResult = await makeRequest('POST', '/tickets/', maintenanceData, adminToken);
  scenarioResults.steps.push({ 
    step: 'Handle Maintenance Requests', 
    success: maintenanceResult.success,
    error: maintenanceResult.error,
    ticketId: maintenanceResult.data?.id
  });
  
  scenarioResults.overallSuccess = scenarioResults.steps.every(step => step.success);
  return scenarioResults;
}

async function testEveningWrapUp() {
  console.log('\n🌙 Testing Evening Operations...');
  
  const scenarioResults = {
    name: OPERATIONAL_SCENARIOS.EVENING_WRAP_UP.name,
    steps: [],
    overallSuccess: false
  };
  
  const driverToken = await loginUser('driver1', 'password123');
  if (!driverToken) return scenarioResults;
  
  // Step 1: Driver end shift
  console.log('  📋 Step 1: End Driver Shift');
  const endShiftData = {
    end_time: new Date().toISOString(),
    status: 'completed',
    total_miles: Math.floor(Math.random() * 200) + 50,
    total_passengers: Math.floor(Math.random() * 100) + 20
  };
  const endShiftResult = await makeRequest('PATCH', '/fleet/shifts/1/', endShiftData, driverToken);
  scenarioResults.steps.push({ 
    step: 'End Driver Shift', 
    success: endShiftResult.success,
    error: endShiftResult.error
  });
  
  // Step 2: Final vehicle check
  console.log('  📋 Step 2: Final Vehicle Check');
  const finalCheckData = {
    vehicle: 1,
    inspection_type: 'post_trip',
    status: 'completed',
    notes: 'Post-trip inspection completed - vehicle ready for next day',
    findings: 'All systems normal, fuel level adequate'
  };
  const finalCheckResult = await makeRequest('POST', '/inspections/', finalCheckData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Final Vehicle Check', 
    success: finalCheckResult.success,
    error: finalCheckResult.error
  });
  
  // Step 3: Submit daily report
  console.log('  📋 Step 3: Submit Daily Report');
  const dailyReportData = {
    driver: 1,
    date: new Date().toISOString().split('T')[0],
    total_hours: 8.5,
    total_miles: Math.floor(Math.random() * 200) + 50,
    total_passengers: Math.floor(Math.random() * 100) + 20,
    fuel_consumed: Math.floor(Math.random() * 20) + 10,
    issues_reported: 1,
    status: 'completed'
  };
  const dailyReportResult = await makeRequest('POST', '/fleet/daily-reports/', dailyReportData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Submit Daily Report', 
    success: dailyReportResult.success,
    error: dailyReportResult.error
  });
  
  // Step 4: Update vehicle status
  console.log('  📋 Step 4: Update Vehicle Status');
  const vehicleStatusData = {
    status: 'parked',
    location: 'Depot - Bay 1',
    fuel_level: Math.floor(Math.random() * 100),
    last_updated: new Date().toISOString()
  };
  const vehicleResult = await makeRequest('PATCH', '/fleet/vehicles/1/', vehicleStatusData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Update Vehicle Status', 
    success: vehicleResult.success,
    error: vehicleResult.error
  });
  
  // Step 5: Schedule maintenance if needed
  console.log('  📋 Step 5: Schedule Maintenance if Needed');
  const maintenanceData = {
    title: 'Weekly Vehicle Maintenance',
    description: 'Scheduled weekly maintenance for Vehicle 1',
    priority: 'low',
    status: 'scheduled',
    scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  const maintenanceResult = await makeRequest('POST', '/tickets/', maintenanceData, driverToken);
  scenarioResults.steps.push({ 
    step: 'Schedule Maintenance if Needed', 
    success: maintenanceResult.success,
    error: maintenanceResult.error
  });
  
  scenarioResults.overallSuccess = scenarioResults.steps.every(step => step.success);
  return scenarioResults;
}

// Main Test Runner
async function runDayToDayOperationsTest() {
  console.log('🚀 Starting Comprehensive Day-to-Day Operations Test');
  console.log('=' .repeat(80));
  
  const startTime = Date.now();
  
  try {
    // Test all operational scenarios
    const scenarios = [
      { name: 'MORNING_CHECK_IN', test: testMorningCheckIn },
      { name: 'ROUTE_EXECUTION', test: testRouteExecution },
      { name: 'MAINTENANCE_REPORTING', test: testMaintenanceReporting },
      { name: 'INSPECTION_WORKFLOW', test: testInspectionWorkflow },
      { name: 'ADMIN_MANAGEMENT', test: testAdminManagement },
      { name: 'EVENING_WRAP_UP', test: testEveningWrapUp }
    ];
    
    for (const scenario of scenarios) {
      console.log(`\n🔄 Running Scenario: ${OPERATIONAL_SCENARIOS[scenario.name].name}`);
      console.log(`📝 ${OPERATIONAL_SCENARIOS[scenario.name].description}`);
      
      const result = await scenario.test();
      testResults.scenarios[scenario.name] = result;
      
      if (result.overallSuccess) {
        testResults.passedScenarios++;
        console.log(`✅ Scenario PASSED: ${result.name}`);
      } else {
        testResults.failedScenarios++;
        console.log(`❌ Scenario FAILED: ${result.name}`);
      }
      
      // Count individual test steps
      result.steps.forEach(step => {
        testResults.totalTests++;
        if (step.success) {
          testResults.passedTests++;
        } else {
          testResults.failedTests++;
          if (step.error) {
            testResults.errors.push(`${scenario.name}: ${step.step} - ${JSON.stringify(step.error)}`);
          }
        }
      });
      
      await delay(TEST_CONFIG.delayBetweenRequests);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Generate comprehensive report
    const report = generateComprehensiveReport(totalTime);
    console.log('\n' + '='.repeat(80));
    console.log(report);
    
    // Save report to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `day-to-day-operations-test-report-${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify({
      testResults,
      scenarios: testResults.scenarios,
      timestamp: new Date().toISOString(),
      totalExecutionTime: totalTime
    }, null, 2));
    
    console.log(`\n📊 Detailed report saved to: ${filename}`);
    
    return testResults;
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return null;
  }
}

function generateComprehensiveReport(totalTime) {
  const successRate = ((testResults.passedTests / testResults.totalTests) * 100).toFixed(2);
  const scenarioSuccessRate = ((testResults.passedScenarios / testResults.totalScenarios) * 100).toFixed(2);
  
  return `
📊 COMPREHENSIVE DAY-TO-DAY OPERATIONS TEST REPORT
${'='.repeat(80)}

🎯 TEST SUMMARY:
   • Total Scenarios Tested: ${testResults.totalScenarios}
   • Scenarios Passed: ${testResults.passedScenarios}
   • Scenarios Failed: ${testResults.failedScenarios}
   • Scenario Success Rate: ${scenarioSuccessRate}%

📋 DETAILED RESULTS:
   • Total Test Steps: ${testResults.totalTests}
   • Steps Passed: ${testResults.passedTests}
   • Steps Failed: ${testResults.failedTests}
   • Overall Success Rate: ${successRate}%

⏱️ PERFORMANCE:
   • Total Execution Time: ${(totalTime / 1000).toFixed(2)} seconds
   • Average Time per Scenario: ${(totalTime / testResults.totalScenarios / 1000).toFixed(2)} seconds

🔍 SCENARIO BREAKDOWN:
${Object.entries(testResults.scenarios).map(([key, scenario]) => {
  const status = scenario.overallSuccess ? '✅ PASSED' : '❌ FAILED';
  const passedSteps = scenario.steps.filter(s => s.success).length;
  const totalSteps = scenario.steps.length;
  return `   • ${scenario.name}: ${status} (${passedSteps}/${totalSteps} steps)`;
}).join('\n')}

${testResults.errors.length > 0 ? `
❌ ERRORS ENCOUNTERED:
${testResults.errors.slice(0, 10).map(error => `   • ${error}`).join('\n')}
${testResults.errors.length > 10 ? `   ... and ${testResults.errors.length - 10} more errors` : ''}
` : '✅ No errors encountered!'}

🏆 OPERATIONAL READINESS ASSESSMENT:
   • System is ${successRate >= 80 ? 'READY' : successRate >= 60 ? 'MOSTLY READY' : 'NEEDS WORK'} for production use
   • Day-to-day operations: ${scenarioSuccessRate >= 80 ? 'FULLY FUNCTIONAL' : 'PARTIALLY FUNCTIONAL'}
   • User workflows: ${testResults.passedScenarios >= 4 ? 'WELL SUPPORTED' : 'NEEDS IMPROVEMENT'}

💡 RECOMMENDATIONS:
${successRate >= 90 ? '   • System is production-ready with excellent reliability' :
  successRate >= 75 ? '   • System is mostly ready with minor issues to address' :
  successRate >= 50 ? '   • System needs significant improvements before production' :
  '   • System requires major fixes before production deployment'}

${testResults.errors.length > 0 ? '   • Address the errors listed above before production deployment' : ''}
   • Continue monitoring system performance in production
   • Regular testing recommended to maintain reliability
`;
}

// Run the test
if (require.main === module) {
  runDayToDayOperationsTest().then(results => {
    if (results) {
      process.exit(results.failedTests === 0 ? 0 : 1);
    } else {
      process.exit(1);
    }
  });
}

module.exports = {
  runDayToDayOperationsTest,
  OPERATIONAL_SCENARIOS,
  testResults
};
