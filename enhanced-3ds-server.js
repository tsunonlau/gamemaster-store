// UPDATED server.js - Replace your create-paypal-order endpoint

app.post('/api/create-paypal-order', async (req, res) => {
    try {
        const { cart, billing } = req.body;
        
        console.log('[GameMaster Server] 🏗️ Creating PayPal order with 3DS...');
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
        
        // Enhanced order payload with EXPLICIT 3DS challenge request
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
                    // FORCE 3D Secure authentication with explicit challenge
                    verification_method: 'SCA_ALWAYS',
                    // Add contingencies to force step-up authentication
                    attributes: {
                        contingencies: ['3D_SECURE']
                    }
                }
            },
            // Add processing instruction to force 3DS challenge
            processing_instruction: 'ORDER_COMPLETE_ON_PAYMENT_APPROVAL'
        };
        
        console.log('[GameMaster Server] 🔐 3DS Configuration:', {
            verification_method: orderData.payment_source.card.verification_method,
            contingencies: orderData.payment_source.card.attributes?.contingencies
        });
        
        const response = await axios.post(
            `${PAYPAL_API_URL}/v2/checkout/orders`,
            orderData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'PayPal-Request-Id': `gamemaster-${Date.now()}`,
                    // Add prefer header to return minimal response
                    'Prefer': 'return=minimal'
                }
            }
        );
        
        console.log(`[GameMaster Server] ✅ PayPal order created: ${response.data.id}`);
        console.log(`[GameMaster Server] 🛡️ SCA 3DS enforced: ${orderData.payment_source.card.verification_method}`);
        
        // Check for 3DS contingency in response
        if (response.data.links) {
            const payerActionLink = response.data.links.find(link => link.rel === 'payer-action');
            if (payerActionLink) {
                console.log('[GameMaster Server] 🔐 3DS payer-action link found:', payerActionLink.href);
            }
        }
        
        res.json(response.data);
        
    } catch (error) {
        console.error('[GameMaster Server] ❌ Create order error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to create PayPal order',
            details: error.response?.data || error.message
        });
    }
});