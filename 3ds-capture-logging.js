// Add to your capture-paypal-order endpoint in server.js

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
        
        // CHECK FOR 3DS AUTHENTICATION RESULTS
        if (captureData.purchase_units && captureData.purchase_units[0].payments) {
            const captures = captureData.purchase_units[0].payments.captures;
            if (captures && captures[0]) {
                const capture = captures[0];
                
                // Look for 3DS authentication data
                if (capture.processor_response) {
                    console.log('[GameMaster Server] 🔐 3DS Processor Response:', capture.processor_response);
                }
                
                // Check for authentication result in payment source
                if (captureData.payment_source && captureData.payment_source.card) {
                    const card = captureData.payment_source.card;
                    
                    if (card.authentication_result) {
                        console.log('[GameMaster Server] 🛡️ 3DS AUTHENTICATION RESULT:', {
                            liability_shift: card.authentication_result.liability_shift,
                            enrollment_status: card.authentication_result.enrollment_status,
                            authentication_status: card.authentication_result.authentication_status
                        });
                        
                        // Check if 3DS was successful
                        if (card.authentication_result.liability_shift === 'POSSIBLE' && 
                            card.authentication_result.authentication_status === 'Y') {
                            console.log('[GameMaster Server] ✅ 3DS Authentication SUCCESSFUL - Liability shift possible');
                        } else {
                            console.log('[GameMaster Server] ⚠️ 3DS Authentication failed or not performed');
                        }
                    } else {
                        console.log('[GameMaster Server] ℹ️ No 3DS authentication result found');
                    }
                }
            }
        }
        
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