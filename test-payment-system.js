const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const baseDir = path.join(__dirname, 'pharmacare-system');

// Simple static file server
const server = http.createServer((req, res) => {
    let filePath = path.join(baseDir, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.svg': 'image/svg+xml'
    };

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.end(data);
        }
    });
});

async function testPaymentSystem() {
    console.log('Starting payment system tests...');

    await new Promise(resolve => server.listen(PORT, resolve));
    console.log(`Server started on port ${PORT}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            errors.push(text);
            console.log('  [ERROR]:', text);
        } else {
            logs.push(text);
            // Print M-Pesa related logs immediately
            if (text.includes('M-Pesa') || text.includes('STK') || text.includes('mpesa') || text.includes('success')) {
                console.log('  [LOG]:', text);
            }
        }
    });
    page.on('pageerror', err => errors.push(err.message));

    try {
        // Test 1: Login
        console.log('\n1. Testing login...');
        await page.goto(`http://localhost:${PORT}`);
        await page.fill('#loginEmail', 'admin@pharmacare.com');
        await page.fill('#loginPassword', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);

        const mainAppVisible = await page.isVisible('#mainApp');
        console.log(`   Login result: ${mainAppVisible ? 'SUCCESS' : 'FAILED'}`);

        // Test 2: Navigate to POS
        console.log('\n2. Testing navigation to POS...');
        await page.click('[data-page="pos"]');
        await page.waitForTimeout(500);

        const posPageVisible = await page.isVisible('#posPage.active');
        console.log(`   POS page visible: ${posPageVisible ? 'SUCCESS' : 'FAILED'}`);

        // Test 3: Add item to cart
        console.log('\n3. Testing add to cart...');
        const productCards = await page.$$('.product-card');
        if (productCards.length > 0) {
            await productCards[0].click();
            await page.waitForTimeout(500);
            const cartItems = await page.$$('.cart-item');
            console.log(`   Add to cart: ${cartItems.length > 0 ? 'SUCCESS' : 'FAILED'}`);
        } else {
            console.log('   Add to cart: SKIPPED (no products available)');
        }

        // Test 4: Open payment modal
        console.log('\n4. Testing payment modal...');
        const checkoutBtn = await page.$('#checkoutBtn');
        if (checkoutBtn) {
            await checkoutBtn.click();
            await page.waitForTimeout(500);
            const paymentModalVisible = await page.isVisible('#paymentMethodModal.active');
            console.log(`   Payment modal: ${paymentModalVisible ? 'SUCCESS' : 'FAILED'}`);

            // Test 5: Select M-Pesa payment
            console.log('\n5. Testing M-Pesa payment flow...');
            if (paymentModalVisible) {
                const mpesaBtn = await page.$('.payment-method-btn.mpesa');
                if (mpesaBtn) {
                    await mpesaBtn.click();
                    await page.waitForTimeout(500);
                    const mpesaModalVisible = await page.isVisible('#mpesaPaymentModal.active');
                    console.log(`   M-Pesa modal: ${mpesaModalVisible ? 'SUCCESS' : 'FAILED'}`);

                    // Test 6: Enter phone and process payment
                    if (mpesaModalVisible) {
                        await page.fill('#mpesaPhone', '0712345678');
                        
                        // Debug: Check if App object exists
                        const appExists = await page.evaluate(() => {
                            return {
                                appExists: typeof App !== 'undefined',
                                hasMethod: typeof App?.initiateMPesaPayment === 'function',
                                pendingTransaction: App?.pendingTransaction
                            };
                        });
                        console.log('   App debug:', JSON.stringify(appExists));
                        
                        // Call the function directly instead of clicking the button
                        const result = await page.evaluate(() => {
                            try {
                                App.initiateMPesaPayment();
                                return 'success';
                            } catch (err) {
                                return 'error: ' + err.message;
                            }
                        });
                        console.log('   Function call result:', result);
                        
                        await page.waitForTimeout(2000);
                        let processingVisible = await page.isVisible('#mpesaProcessing:not(.hidden)');
                        console.log('   Processing visible at 2s:', processingVisible);
                        
                        await page.waitForTimeout(2000);
                        processingVisible = await page.isVisible('#mpesaProcessing:not(.hidden)');
                        console.log('   Processing visible at 4s:', processingVisible);
                        
                        await page.waitForTimeout(2000);
                        const successVisible = await page.isVisible('#mpesaSuccess:not(.hidden)');
                        console.log('   M-Pesa success visible at 6s:', successVisible);
                        
                        // Debug: Check element states
                        const elementStates = await page.evaluate(() => {
                            return {
                                processingHidden: document.getElementById('mpesaProcessing')?.classList.contains('hidden'),
                                successHidden: document.getElementById('mpesaSuccess')?.classList.contains('hidden'),
                                step1Active: document.getElementById('stkStep1')?.classList.contains('active'),
                                step2Active: document.getElementById('stkStep2')?.classList.contains('active'),
                                step3Active: document.getElementById('stkStep3')?.classList.contains('active'),
                            };
                        });
                        console.log('   Element states:', JSON.stringify(elementStates));

                        if (successVisible) {
                            await page.evaluate(() => {
                                App.completeMpesaPayment();
                            });
                            await page.waitForTimeout(500);
                        } else {
                            // Close the modal manually to continue testing
                            await page.evaluate(() => {
                                closeModal('mpesaPaymentModal');
                            });
                            await page.waitForTimeout(500);
                        }
                    }
                }
            }
        }

        // Test 7: Test card payment flow
        console.log('\n6. Testing card payment flow...');
        await page.click('[data-page="pos"]');
        await page.waitForTimeout(300);
        const cartItem = await page.$('.cart-item');
        if (cartItem) {
            await page.click('.qty-btn:first-of-type', { force: true }); // Add another item
            await page.waitForTimeout(300);
        }
        
        const checkoutBtn2 = await page.$('#checkoutBtn');
        if (checkoutBtn2) {
            await checkoutBtn2.click();
            await page.waitForTimeout(500);

            const cardBtn = await page.$('.payment-method-btn.card');
            if (cardBtn) {
                await cardBtn.click();
                await page.waitForTimeout(500);
                const cardModalVisible = await page.isVisible('#cardPaymentModal.active');
                console.log(`   Card modal: ${cardModalVisible ? 'SUCCESS' : 'FAILED'}`);

                if (cardModalVisible) {
                    await page.fill('#cardNumber', '4111111111111111');
                    await page.fill('#cardExpiry', '12/25');
                    await page.fill('#cardCVV', '123');
                    await page.click('#cardPayBtn');
                    await page.waitForTimeout(500);

                    const otpModalVisible = await page.isVisible('#otpModal.active');
                    console.log(`   OTP modal: ${otpModalVisible ? 'SUCCESS' : 'FAILED'}`);

                    if (otpModalVisible) {
                        await page.fill('#otpInput', '5678');
                        await page.click('#otpVerifyBtn');
                        await page.waitForTimeout(3000);
                    }
                }
            }
        }

        // Report errors and logs
        console.log('\n=== Console Logs ===');
        logs.forEach(log => console.log(`  LOG: ${log}`));
        
        console.log('\n=== Test Summary ===');
        if (errors.length > 0) {
            console.log('Console errors found:');
            errors.forEach(err => console.log(`  - ${err}`));
        } else {
            console.log('No console errors detected!');
        }

    } catch (error) {
        console.error('Test error:', error.message);
    } finally {
        await browser.close();
        server.close();
        console.log('\nTests completed.');
    }
}

testPaymentSystem();
