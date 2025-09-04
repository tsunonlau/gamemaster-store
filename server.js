const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from current directory
app.use(express.static(__dirname));

// PayPal Configuration - Use environment variables in production
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AUS-78-lLNn1spgQkDuEoiyrQE2VYILSRLaX0ziWiH-AAE3cLg89Rt_AZmsb8zlaU0tpMjzS4jNSopMm';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EPYopbex6MPFZxFYMiYoZaZOdCWkz474ZeS07Vu6L7QzRbS1hqIg1nsanl69M5HzsEVF2cHvd5A6aeXi';
const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const PORT = process.env.PORT || 3000;

console.log('[GameMaster Server] 🚀 Starting board game store server...');
console.log(`[GameMaster Server] 🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[GameMaster Server] 💰 PayPal API: ${PAYPAL_API_URL}`);

// PayPal Authentication Helper
function getBasicAuthHeader() {
    const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    return `Basic ${credentials}`;
}

// Get PayPal Access Token
async function getPayPalAccessToken() {
    try {
        console.log('[GameMaster Server] 🔑 Requesting PayPal access token...');
        
        const response = await axios.post(
            `${PAYPAL_API_URL}/v1/oauth2/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': getBasicAuthHeader(),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        
        console.log('[GameMaster Server] ✅ PayPal access token obtained');
        return response.data.access_token;
    } catch (error) {
        console.error('[GameMaster Server] ❌ PayPal token error:', error.response?.data || error.message);
        throw new Error('Failed to obtain PayPal access token');
    }
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        paypalConfigured: !!(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET && PAYPAL_CLIENT_ID !== 'YOUR_SANDBOX_CLIENT_ID')
    });
});

// Create PayPal Order with SCA 3DS
app.post('/api/create-paypal-order', async (req, res) => {
    try {
        const { cart, billing } = req.body;
        
        console.log('[GameMaster Server] 🏗️ Creating PayPal order...');
        console.log(`[GameMaster Server] 📦 Cart total: $${cart.total}`);
        console.log(`[GameMaster Server] 📍 Billing: ${billing?.city}, ${billing?.state}`);
        
        const accessToken = await getPayPalAccessToken();
        
        // Prepare purchase units
        const purchase_units = [{
            amount: {
                currency_code: 'USD',
                value: cart.total,
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: cart.total
                    }
                }
            },
            items: cart.items.map(item => ({
                name: item.name,
                unit_amount: {
                    currency_code: 'USD',
                    value: item.price.toString()
                },
                quantity: item.quantity.toString(),
                category: 'PHYSICAL_GOODS'
            }))
        }];
        
        // Order payload with SCA 3DS enforcement
        const orderData = {
            intent: 'CAPTURE',
            purchase_units,
            payer: {
                name: {
                    given_name: billing?.firstName || '',
                    surname: billing?.lastName || ''
                },
                address: {
                    address_line_1: billing?.address || '',
                    admin_area_2: billing?.city || '',
                    admin_area_1: billing?.state || '',
                    postal_code: billing?.zipCode || '',
                    country_code: billing?.country || 'US'
                }
            },
            payment_source: {
                card: {
                    experience_context: {
                        return_url: `${req.protocol}://${req.get('host')}/success`,
                        cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
                        brand_name: 'GameMaster Board Games',
                        user_action: 'PAY_NOW'
                    },
                    // Force 3D Secure authentication
                    verification_method: 'SCA_ALWAYS'
                }
            }
        };
        
        const response = await axios.post(
            `${PAYPAL_API_URL}/v2/checkout/orders`,
            orderData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'PayPal-Request-Id': `gamemaster-${Date.now()}`, // Idempotency key
                }
            }
        );
        
        console.log(`[GameMaster Server] ✅ PayPal order created: ${response.data.id}`);
        console.log(`[GameMaster Server] 🛡️ SCA 3DS enforced: ${orderData.payment_source.card.verification_method}`);
        
        res.json(response.data);
        
    } catch (error) {
        console.error('[GameMaster Server] ❌ Create order error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to create PayPal order',
            details: error.response?.data || error.message
        });
    }
});

// Capture PayPal Order
app.post('/api/capture-paypal-order', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        console.log(`[GameMaster Server] 💳 Capturing PayPal order: ${orderId}`);
        
        const accessToken = await getPayPalAccessToken();
        
        const response = await axios.post(
            `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'PayPal-Request-Id': `gamemaster-capture-${Date.now()}`,
                }
            }
        );
        
        const captureData = response.data;
        console.log(`[GameMaster Server] ✅ Order captured successfully: ${captureData.id}`);
        console.log(`[GameMaster Server] 💰 Amount: $${captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value}`);
        console.log(`[GameMaster Server] 🔐 Status: ${captureData.status}`);
        
        // Log transaction for CSV export
        await logTransactionToCSV(captureData);
        
        res.json(captureData);
        
    } catch (error) {
        console.error('[GameMaster Server] ❌ Capture order error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to capture PayPal order',
            details: error.response?.data || error.message
        });
    }
});

// CSV Transaction Logging
const CSV_FILE_PATH = path.join(__dirname, 'transactions.csv');

async function logTransactionToCSV(transactionData) {
    try {
        console.log('[GameMaster Server] 📝 Logging transaction to CSV...');
        
        const timestamp = new Date().toISOString();
        const orderId = transactionData.id;
        const status = transactionData.status;
        const amount = transactionData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '0.00';
        const payerEmail = transactionData.payer?.email_address || 'N/A';
        const paymentSource = transactionData.payment_source ? JSON.stringify(transactionData.payment_source) : 'PayPal';
        const purchaseUnits = JSON.stringify(transactionData.purchase_units);
        
        // CSV row data
        const csvRow = [
            timestamp,
            orderId,
            status,
            amount,
            payerEmail,
            paymentSource.replace(/"/g, '""'), // Escape quotes
            purchaseUnits.replace(/"/g, '""') // Escape quotes
        ];
        
        const csvLine = csvRow.map(field => `"${field}"`).join(',') + '\n';
        
        // Create CSV file with headers if it doesn't exist
        if (!fs.existsSync(CSV_FILE_PATH)) {
            const headers = [
                'Timestamp',
                'Order ID',
                'Status',
                'Amount (USD)',
                'Payer Email',
                'Payment Source',
                'Purchase Units'
            ];
            const headerLine = headers.map(header => `"${header}"`).join(',') + '\n';
            fs.writeFileSync(CSV_FILE_PATH, headerLine, { encoding: 'utf8' });
            console.log('[GameMaster Server] 📄 CSV file created with headers');
        }
        
        // Append transaction data
        fs.appendFileSync(CSV_FILE_PATH, csvLine, { encoding: 'utf8' });
        
        console.log(`[GameMaster Server] ✅ Transaction logged: ${orderId} ($${amount})`);
        
    } catch (error) {
        console.error('[GameMaster Server] ❌ CSV logging error:', error.message);
    }
}

// Download CSV endpoint
app.get('/api/transactions', (req, res) => {
    try {
        console.log('[GameMaster Server] 📥 CSV download requested...');
        
        if (!fs.existsSync(CSV_FILE_PATH)) {
            console.log('[GameMaster Server] ⚠️ No transactions CSV file found');
            return res.status(404).json({ 
                error: 'No transactions found',
                message: 'No transactions have been processed yet.'
            });
        }
        
        const stats = fs.statSync(CSV_FILE_PATH);
        const filename = `gamemaster-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        
        console.log(`[GameMaster Server] ✅ Sending CSV file: ${filename} (${stats.size} bytes)`);
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Length', stats.size);
        
        const readStream = fs.createReadStream(CSV_FILE_PATH);
        readStream.pipe(res);
        
    } catch (error) {
        console.error('[GameMaster Server] ❌ CSV download error:', error.message);
        res.status(500).json({ 
            error: 'Failed to download transactions',
            details: error.message
        });
    }
});

// Get transaction count endpoint
app.get('/api/transactions/count', (req, res) => {
    try {
        if (!fs.existsSync(CSV_FILE_PATH)) {
            return res.json({ count: 0, message: 'No transactions yet' });
        }
        
        const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
        const lines = csvContent.trim().split('\n');
        const count = Math.max(0, lines.length - 1); // Subtract header row
        
        console.log(`[GameMaster Server] 📊 Transaction count: ${count}`);
        
        res.json({ 
            count,
            message: count === 0 ? 'No transactions yet' : `${count} transaction(s) recorded`
        });
        
    } catch (error) {
        console.error('[GameMaster Server] ❌ Transaction count error:', error.message);
        res.status(500).json({ 
            error: 'Failed to get transaction count',
            details: error.message
        });
    }
});

// PayPal webhook endpoint (for production use)
app.post('/api/paypal-webhook', (req, res) => {
    console.log('[GameMaster Server] 🔔 PayPal webhook received:', req.body);
    
    // In production, verify webhook signature here
    // https://developer.paypal.com/docs/api/webhooks/v1/
    
    const eventType = req.body.event_type;
    const resource = req.body.resource;
    
    console.log(`[GameMaster Server] 🔔 Webhook event: ${eventType}`);
    
    // Handle different webhook events
    switch (eventType) {
        case 'CHECKOUT.ORDER.APPROVED':
            console.log(`[GameMaster Server] ✅ Order approved: ${resource.id}`);
            break;
        case 'PAYMENT.CAPTURE.COMPLETED':
            console.log(`[GameMaster Server] 💰 Payment captured: ${resource.id}`);
            break;
        case 'PAYMENT.CAPTURE.DENIED':
            console.log(`[GameMaster Server] ❌ Payment denied: ${resource.id}`);
            break;
        default:
            console.log(`[GameMaster Server] ℹ️ Unhandled webhook event: ${eventType}`);
    }
    
    res.status(200).json({ received: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[GameMaster Server] ❌ Unhandled error:', err.message);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    console.log(`[GameMaster Server] ❓ 404 - Not found: ${req.url}`);
    res.status(404).json({ 
        error: 'Not found',
        message: `Route ${req.url} not found`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`[GameMaster Server] ✅ Server running on port ${PORT}`);
    console.log(`[GameMaster Server] 🌐 Visit: http://localhost:${PORT}`);
    console.log(`[GameMaster Server] 📊 Health check: http://localhost:${PORT}/health`);
    console.log(`[GameMaster Server] 📥 CSV download: http://localhost:${PORT}/api/transactions`);
    
    // Verify PayPal configuration
    if (PAYPAL_CLIENT_ID === 'YOUR_SANDBOX_CLIENT_ID') {
        console.warn('[GameMaster Server] ⚠️  WARNING: Using default PayPal credentials!');
        console.warn('[GameMaster Server] 🔧 Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables');
    } else {
        console.log('[GameMaster Server] ✅ PayPal credentials configured');
    }
    
    console.log('[GameMaster Server] 🎲 GameMaster store is ready for business!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[GameMaster Server] 👋 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[GameMaster Server] 👋 Shutting down gracefully...');
    process.exit(0);
});