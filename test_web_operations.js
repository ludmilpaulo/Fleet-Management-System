#!/usr/bin/env node
/**
 * Comprehensive Web Application Day-to-Day Operations Test Suite
 * Tests all critical web operations using browser automation
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class WebOperationsTest {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:3000';
        this.apiUrl = options.apiUrl || 'http://localhost:8000';
        this.results = [];
        this.browser = null;
        this.context = null;
        this.page = null;
        this.authTokens = {};
    }

    logResult(testName, passed, message = '', data = {}) {
        const result = {
            name: testName,
            passed,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        this.results.push(result);
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${testName}`);
        if (message) {
            console.log(`   ${message}`);
        }
        return result;
    }

    async checkWebConnection() {
        try {
            const response = await this.page.goto(this.baseUrl, { 
                waitUntil: 'domcontentloaded',
                timeout: 10000 
            });
            return response && response.status() < 500;
        } catch (error) {
            return false;
        }
    }

    async setup() {
        console.log('\n' + '='.repeat(80));
        console.log('SETTING UP WEB TEST ENVIRONMENT');
        console.log('='.repeat(80));

        this.browser = await chromium.launch({ 
            headless: false,
            timeout: 30000
        });
        this.context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 },
            ignoreHTTPSErrors: true
        });
        this.page = await this.context.newPage();
        
        // Set longer timeout for page operations
        this.page.setDefaultTimeout(30000);
        this.page.setDefaultNavigationTimeout(30000);
        
        this.logResult('Browser Setup', true, 'Chromium browser launched');
        
        // Check web connection
        console.log('\nChecking web application connection...');
        const webAvailable = await this.checkWebConnection();
        if (!webAvailable) {
            console.log(`\n⚠️  WARNING: Cannot connect to web app at ${this.baseUrl}`);
            console.log('Some tests may fail. Ensure web app is running:');
            console.log('  cd fleet/apps/web && npm run dev');
        } else {
            this.logResult('Web Connection Check', true, `Connected to ${this.baseUrl}`);
        }
    }

    async teardown() {
        if (this.browser) {
            await this.browser.close();
            this.logResult('Browser Teardown', true, 'Browser closed');
        }
    }

    // ==================== AUTHENTICATION TESTS ====================

    async testAuthenticationFlow() {
        console.log('\n' + '='.repeat(80));
        console.log('AUTHENTICATION TESTS');
        console.log('='.repeat(80));

        try {
            // Navigate to home page with timeout handling
            try {
                await this.page.goto(this.baseUrl, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000 
                });
                await this.page.waitForTimeout(2000);
                this.logResult('Navigate to Home', true);
            } catch (error) {
                if (error.message.includes('Timeout') || error.message.includes('net::')) {
                    this.logResult('Navigate to Home', false, 
                        `Timeout or network error: ${error.message}`);
                    return;
                }
                throw error;
            }

            // Navigate to sign in
            const signInLink = this.page.locator('a[href*="signin"], button:has-text("Sign In")').first();
            if (await signInLink.isVisible()) {
                await signInLink.click();
                await this.page.waitForTimeout(1000);
                this.logResult('Navigate to Sign In', true);
            } else {
                // Try direct navigation
                try {
                    await this.page.goto(`${this.baseUrl}/auth/signin`, { 
                        waitUntil: 'domcontentloaded',
                        timeout: 30000 
                    });
                    await this.page.waitForTimeout(1000);
                } catch (error) {
                    this.logResult('Navigate to Sign In', false, 
                        `Navigation failed: ${error.message}`);
                    return;
                }
            }

            // Test sign in for admin
            const usernameInput = this.page.locator('input[name="username"], input[type="text"]').first();
            const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
            
            if (await usernameInput.isVisible()) {
                await usernameInput.fill('admin');
                await passwordInput.fill('admin123');
                
                const signInButton = this.page.locator('button:has-text("Sign In"), button[type="submit"]').first();
                await signInButton.click();
                await this.page.waitForTimeout(3000);

                // Check if redirected to dashboard
                const currentUrl = this.page.url();
                if (currentUrl.includes('/dashboard')) {
                    this.logResult('Admin Sign In', true, `Redirected to: ${currentUrl}`);
                } else {
                    this.logResult('Admin Sign In', false, `Unexpected URL: ${currentUrl}`);
                }
            } else {
                this.logResult('Admin Sign In', false, 'Sign in form not found');
            }

        } catch (error) {
            this.logResult('Authentication Flow', false, error.message);
        }
    }

    // ==================== DASHBOARD TESTS ====================

    async testDashboardAccess() {
        console.log('\n' + '='.repeat(80));
        console.log('DASHBOARD ACCESS TESTS');
        console.log('='.repeat(80));

        const roles = ['admin', 'staff', 'driver', 'inspector'];
        const credentials = {
            admin: { username: 'admin', password: 'admin123' },
            staff: { username: 'staff1', password: 'staff123' },
            driver: { username: 'driver1', password: 'driver123' },
            inspector: { username: 'inspector1', password: 'inspector123' }
        };

        for (const role of roles) {
            try {
                // Sign in with timeout handling
                try {
                    await this.page.goto(`${this.baseUrl}/auth/signin`, { 
                        waitUntil: 'domcontentloaded',
                        timeout: 30000 
                    });
                    await this.page.waitForTimeout(1000);
                } catch (error) {
                    this.logResult(`Dashboard Access (${role})`, false, 
                        `Navigation timeout: ${error.message}`);
                    continue;
                }

                const creds = credentials[role];
                if (creds) {
                    const usernameInput = this.page.locator('input[name="username"], input[type="text"]').first();
                    const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
                    
                    if (await usernameInput.isVisible()) {
                        await usernameInput.fill(creds.username);
                        await passwordInput.fill(creds.password);
                        
                        const signInButton = this.page.locator('button:has-text("Sign In"), button[type="submit"]').first();
                        await signInButton.click();
                        await this.page.waitForTimeout(3000);

                        // Check dashboard access
                        const currentUrl = this.page.url();
                        if (currentUrl.includes('/dashboard')) {
                            this.logResult(`Dashboard Access (${role})`, true, `URL: ${currentUrl}`);
                            
                            // Check for dashboard elements
                            const dashboardContent = await this.page.locator('main, [role="main"], .dashboard').first();
                            if (await dashboardContent.isVisible()) {
                                this.logResult(`Dashboard Content (${role})`, true);
                            }
                        } else {
                            this.logResult(`Dashboard Access (${role})`, false, `Unexpected URL: ${currentUrl}`);
                        }
                    }
                }

                // Sign out for next test
                const signOutButton = this.page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")').first();
                if (await signOutButton.isVisible()) {
                    await signOutButton.click();
                    await this.page.waitForTimeout(1000);
                }

            } catch (error) {
                this.logResult(`Dashboard Access (${role})`, false, error.message);
            }
        }
    }

    // ==================== VEHICLE MANAGEMENT TESTS ====================

    async testVehicleOperations() {
        console.log('\n' + '='.repeat(80));
        console.log('VEHICLE MANAGEMENT TESTS');
        console.log('='.repeat(80));

        try {
            // Sign in as admin with timeout handling
            try {
                await this.page.goto(`${this.baseUrl}/auth/signin`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000 
                });
                await this.page.waitForTimeout(1000);
            } catch (error) {
                this.logResult('Vehicle Operations', false, 
                    `Navigation timeout: ${error.message}`);
                return;
            }
            
            const usernameInput = this.page.locator('input[name="username"], input[type="text"]').first();
            const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
            
            await usernameInput.fill('admin');
            await passwordInput.fill('admin123');
            
            const signInButton = this.page.locator('button:has-text("Sign In"), button[type="submit"]').first();
            await signInButton.click();
            await this.page.waitForTimeout(3000);

            // Navigate to vehicles page
            const vehiclesLink = this.page.locator('a[href*="vehicles"], button:has-text("Vehicles")').first();
            if (await vehiclesLink.isVisible()) {
                await vehiclesLink.click();
                await this.page.waitForTimeout(2000);
                this.logResult('Navigate to Vehicles', true);
            } else {
                // Try direct navigation
                try {
                    await this.page.goto(`${this.baseUrl}/dashboard/admin/vehicles`, { 
                        waitUntil: 'domcontentloaded',
                        timeout: 30000 
                    });
                    await this.page.waitForTimeout(2000);
                } catch (error) {
                    this.logResult('Navigate to Vehicles', false, 
                        `Navigation failed: ${error.message}`);
                    return;
                }
            }

            // Check if vehicles list is visible
            const vehiclesList = this.page.locator('table, .vehicles-list, [data-testid="vehicles-list"]').first();
            if (await vehiclesList.isVisible()) {
                this.logResult('Vehicles List Display', true);
            } else {
                this.logResult('Vehicles List Display', false, 'Vehicles list not found');
            }

            // Try to find add vehicle button
            const addButton = this.page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add Vehicle")').first();
            if (await addButton.isVisible()) {
                this.logResult('Add Vehicle Button', true, 'Add vehicle button found');
            } else {
                this.logResult('Add Vehicle Button', false, 'Add vehicle button not found');
            }

        } catch (error) {
            this.logResult('Vehicle Operations', false, error.message);
        }
    }

    // ==================== INSPECTION TESTS ====================

    async testInspectionOperations() {
        console.log('\n' + '='.repeat(80));
        console.log('INSPECTION TESTS');
        console.log('='.repeat(80));

        try {
            // Sign in as inspector with timeout handling
            try {
                await this.page.goto(`${this.baseUrl}/auth/signin`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000 
                });
                await this.page.waitForTimeout(1000);
            } catch (error) {
                this.logResult('Inspection Operations', false, 
                    `Navigation timeout: ${error.message}`);
                return;
            }
            
            const usernameInput = this.page.locator('input[name="username"], input[type="text"]').first();
            const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
            
            await usernameInput.fill('inspector1');
            await passwordInput.fill('inspector123');
            
            const signInButton = this.page.locator('button:has-text("Sign In"), button[type="submit"]').first();
            await signInButton.click();
            await this.page.waitForTimeout(3000);

            // Navigate to inspections
            const inspectionsLink = this.page.locator('a[href*="inspections"], button:has-text("Inspections")').first();
            if (await inspectionsLink.isVisible()) {
                await inspectionsLink.click();
                await this.page.waitForTimeout(2000);
                this.logResult('Navigate to Inspections', true);
            } else {
                try {
                    await this.page.goto(`${this.baseUrl}/dashboard/inspector`, { 
                        waitUntil: 'domcontentloaded',
                        timeout: 30000 
                    });
                    await this.page.waitForTimeout(2000);
                } catch (error) {
                    this.logResult('Navigate to Inspections', false, 
                        `Navigation failed: ${error.message}`);
                    return;
                }
            }

            // Check inspections page
            const inspectionsContent = this.page.locator('main, .inspections, [data-testid="inspections"]').first();
            if (await inspectionsContent.isVisible()) {
                this.logResult('Inspections Page Display', true);
            }

        } catch (error) {
            this.logResult('Inspection Operations', false, error.message);
        }
    }

    // ==================== SHIFT TESTS ====================

    async testShiftOperations() {
        console.log('\n' + '='.repeat(80));
        console.log('SHIFT MANAGEMENT TESTS');
        console.log('='.repeat(80));

        try {
            // Sign in as driver with timeout handling
            try {
                await this.page.goto(`${this.baseUrl}/auth/signin`, { 
                    waitUntil: 'domcontentloaded',
                    timeout: 30000 
                });
                await this.page.waitForTimeout(1000);
            } catch (error) {
                this.logResult('Shift Operations', false, 
                    `Navigation timeout: ${error.message}`);
                return;
            }
            
            const usernameInput = this.page.locator('input[name="username"], input[type="text"]').first();
            const passwordInput = this.page.locator('input[name="password"], input[type="password"]').first();
            
            await usernameInput.fill('driver1');
            await passwordInput.fill('driver123');
            
            const signInButton = this.page.locator('button:has-text("Sign In"), button[type="submit"]').first();
            await signInButton.click();
            await this.page.waitForTimeout(3000);

            // Navigate to shifts
            const shiftsLink = this.page.locator('a[href*="shifts"], button:has-text("Shifts")').first();
            if (await shiftsLink.isVisible()) {
                await shiftsLink.click();
                await this.page.waitForTimeout(2000);
                this.logResult('Navigate to Shifts', true);
            } else {
                try {
                    await this.page.goto(`${this.baseUrl}/dashboard/shifts`, { 
                        waitUntil: 'domcontentloaded',
                        timeout: 30000 
                    });
                    await this.page.waitForTimeout(2000);
                } catch (error) {
                    this.logResult('Navigate to Shifts', false, 
                        `Navigation failed: ${error.message}`);
                    return;
                }
            }

            // Check shifts page
            const shiftsContent = this.page.locator('main, .shifts, [data-testid="shifts"]').first();
            if (await shiftsContent.isVisible()) {
                this.logResult('Shifts Page Display', true);
            }

        } catch (error) {
            this.logResult('Shift Operations', false, error.message);
        }
    }

    // ==================== RUN ALL TESTS ====================

    async runAllTests() {
        console.log('\n' + '='.repeat(80));
        console.log('COMPREHENSIVE WEB APPLICATION TEST SUITE');
        console.log('='.repeat(80));
        console.log(`Base URL: ${this.baseUrl}`);
        console.log(`Test Started: ${new Date().toISOString()}`);
        console.log('='.repeat(80));

        await this.setup();

        // Run test suites
        await this.testAuthenticationFlow();
        await this.testDashboardAccess();
        await this.testVehicleOperations();
        await this.testInspectionOperations();
        await this.testShiftOperations();

        await this.teardown();

        this.printSummary();
    }

    printSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('TEST SUMMARY');
        console.log('='.repeat(80));

        const total = this.results.length;
        const passed = this.results.filter(r => r.passed).length;
        const failed = total - passed;

        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        console.log('='.repeat(80));

        if (failed > 0) {
            console.log('\nFAILED TESTS:');
            this.results.filter(r => !r.passed).forEach(r => {
                console.log(`  ❌ ${r.name}: ${r.message}`);
            });
        }

        // Save results
        const resultsFile = `web_test_results_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        fs.writeFileSync(resultsFile, JSON.stringify({
            summary: {
                total,
                passed,
                failed,
                success_rate: (passed / total) * 100
            },
            results: this.results
        }, null, 2));

        console.log(`\n📄 Detailed results saved to: ${resultsFile}`);
    }
}

// Run tests if executed directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {
        baseUrl: process.env.WEB_URL || 'http://localhost:3000',
        apiUrl: process.env.API_URL || 'http://localhost:8000'
    };

    const tester = new WebOperationsTest(options);
    tester.runAllTests().catch(console.error);
}

module.exports = WebOperationsTest;

