const { chromium } = require('playwright');

async function testPharmaCare() {
    console.log('Starting PharmaCare Manager test...');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const errors = [];
    
    // Listen for console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(`Console Error: ${msg.text()}`);
        }
    });
    
    page.on('pageerror', err => {
        errors.push(`Page Error: ${err.message}`);
    });
    
    try {
        // Test 1: Open the application
        console.log('Test 1: Opening application...');
        await page.goto(`file:///workspace/pharmacare-system/index.html`);
        await page.waitForTimeout(1500);
        
        const loginVisible = await page.isVisible('#loginPage');
        console.log(`  Login page visible: ${loginVisible}`);
        
        // Test 2: Check login form elements
        console.log('Test 2: Checking login form...');
        const emailInput = await page.isVisible('#loginEmail');
        const passwordInput = await page.isVisible('#loginPassword');
        const loginButton = await page.isVisible('button[type="submit"]');
        console.log(`  Email input: ${emailInput}, Password input: ${passwordInput}, Login button: ${loginButton}`);
        
        // Test 3: Demo login
        console.log('Test 3: Testing demo login (Admin)...');
        await page.click('.demo-btn:first-child');
        await page.waitForTimeout(500);
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
        
        const mainAppVisible = await page.isVisible('#mainApp');
        console.log(`  Main app visible after login: ${mainAppVisible}`);
        
        // Test 4: Check dashboard
        console.log('Test 4: Checking dashboard...');
        await page.waitForTimeout(1000);
        const dashboardVisible = await page.isVisible('#dashboardPage.active');
        console.log(`  Dashboard active: ${dashboardVisible}`);
        
        // Test 5: Check navigation
        console.log('Test 5: Testing navigation...');
        await page.click('[data-page="inventory"]');
        await page.waitForTimeout(800);
        const inventoryVisible = await page.isVisible('#inventoryPage.active');
        console.log(`  Inventory page: ${inventoryVisible}`);
        
        await page.click('[data-page="pos"]');
        await page.waitForTimeout(800);
        const posVisible = await page.isVisible('#posPage.active');
        console.log(`  POS page: ${posVisible}`);
        
        await page.click('[data-page="customers"]');
        await page.waitForTimeout(800);
        const customersVisible = await page.isVisible('#customersPage.active');
        console.log(`  Customers page: ${customersVisible}`);
        
        await page.click('[data-page="suppliers"]');
        await page.waitForTimeout(800);
        const suppliersVisible = await page.isVisible('#suppliersPage.active');
        console.log(`  Suppliers page: ${suppliersVisible}`);
        
        await page.click('[data-page="reports"]');
        await page.waitForTimeout(800);
        const reportsVisible = await page.isVisible('#reportsPage.active');
        console.log(`  Reports page: ${reportsVisible}`);
        
        await page.click('[data-page="users"]');
        await page.waitForTimeout(800);
        const usersVisible = await page.isVisible('#usersPage.active');
        console.log(`  Users page: ${usersVisible}`);
        
        await page.click('[data-page="settings"]');
        await page.waitForTimeout(800);
        const settingsVisible = await page.isVisible('#settingsPage.active');
        console.log(`  Settings page: ${settingsVisible}`);
        
        // Test 6: Check charts on dashboard
        console.log('Test 6: Checking charts...');
        await page.click('[data-page="dashboard"]');
        await page.waitForTimeout(2000);
        const salesChart = await page.isVisible('#salesChart');
        const topProductsChart = await page.isVisible('#topProductsChart');
        console.log(`  Sales chart: ${salesChart}, Top products chart: ${topProductsChart}`);
        
        // Test 7: Test POS functionality
        console.log('Test 7: Testing POS...');
        await page.click('[data-page="pos"]');
        await page.waitForTimeout(1000);
        const posProducts = await page.isVisible('.pos-products-grid');
        const posCart = await page.isVisible('.pos-cart');
        console.log(`  POS products grid: ${posProducts}, POS cart: ${posCart}`);
        
        // Test 8: Test Inventory page
        console.log('Test 8: Testing Inventory...');
        await page.click('[data-page="inventory"]');
        await page.waitForTimeout(1000);
        const inventoryTable = await page.isVisible('#inventoryTable');
        console.log(`  Inventory table: ${inventoryTable}`);
        
        // Test 9: Test User Management
        console.log('Test 9: Testing User Management...');
        await page.click('[data-page="users"]');
        await page.waitForTimeout(1000);
        const usersTable = await page.isVisible('#usersTable');
        console.log(`  Users table: ${usersTable}`);
        
        // Test 10: Logout using the logout button directly
        console.log('Test 10: Testing logout...');
        await page.click('.logout-btn');
        await page.waitForTimeout(1000);
        const loginAgainVisible = await page.isVisible('#loginPage:not(.hidden)');
        console.log(`  Logout successful: ${loginAgainVisible}`);
        
        // Summary
        console.log('\n=== Test Results ===');
        if (errors.length === 0) {
            console.log('✓ All tests passed! No JavaScript errors detected.');
        } else {
            console.log(`✗ Found ${errors.length} error(s):`);
            errors.forEach(e => console.log(`  - ${e}`));
        }
        
    } catch (err) {
        console.error('Test failed with error:', err.message);
        errors.push(err.message);
    } finally {
        await browser.close();
    }
    
    return errors.length === 0;
}

testPharmaCare().then(success => {
    process.exit(success ? 0 : 1);
});
