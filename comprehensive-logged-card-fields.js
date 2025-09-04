// COMPREHENSIVE LOGGED VERSION - Replace renderCardFields() function in script.js

function renderCardFields() {
    if (!paypal.CardFields) {
        console.error('[GameMaster] ❌ PayPal Card Fields not available');
        return;
    }
    
    console.log('[GameMaster] 💳 ===== STARTING CARD FIELDS INITIALIZATION =====');
    
    const cardFields = paypal.CardFields({
        style: {
            'input': {
                'font-size': '16px',
                'font-family': 'Poppins, sans-serif',
                'color': '#333'
            }
        },
        
        createOrder: function() {
            console.log('[GameMaster] 🏗️ ===== CREATE ORDER TRIGGERED =====');
            console.log('[GameMaster] 📦 Cart contents:', cart);
            
            const billingData = getBillingData();
            console.log('[GameMaster] 📍 Billing data collected:', billingData);
            
            const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
            console.log('[GameMaster] 💰 Cart total calculated:', cartTotal);
            
            const orderData = {
                cart: {
                    items: cart,
                    total: cartTotal
                },
                billing: billingData
            };
            
            console.log('[GameMaster] 📤 Sending order data to server:', orderData);
            
            return fetch('/api/create-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                console.log('[GameMaster] 📥 Server response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('[GameMaster] ✅ ===== ORDER CREATED SUCCESSFULLY =====');
                console.log('[GameMaster] 🆔 Order ID:', data.id);
                console.log('[GameMaster] 📋 Full order data:', data);
                return data.id;
            })
            .catch(error => {
                console.error('[GameMaster] ❌ ===== ORDER CREATION FAILED =====');
                console.error('[GameMaster] 💥 Error details:', error);
                console.error('[GameMaster] 📊 Error stack:', error.stack);
                throw error;
            });
        },
        
        onApprove: function(data) {
            console.log('[GameMaster] ✅ ===== PAYMENT APPROVED =====');
            console.log('[GameMaster] 🆔 Approved Order ID:', data.orderID);
            console.log('[GameMaster] 📋 Approval data:', data);
            
            showLoading();
            console.log('[GameMaster] ⏳ Loading overlay displayed');
            
            console.log('[GameMaster] 📤 Starting payment capture...');
            
            return fetch('/api/capture-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId: data.orderID })
            })
            .then(response => {
                console.log('[GameMaster] 📥 Capture response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(details => {
                console.log('[GameMaster] 🎉 ===== PAYMENT CAPTURED SUCCESSFULLY =====');
                console.log('[GameMaster] 💰 Capture details:', details);
                console.log('[GameMaster] 📊 Payment status:', details.status);
                
                hideLoading();
                console.log('[GameMaster] ✅ Loading overlay hidden');
                
                // Log transaction
                console.log('[GameMaster] 📝 Logging transaction...');
                logTransaction(details, 'Card');
                
                // Show success
                console.log('[GameMaster] 🎊 Displaying success modal...');
                showSuccessModal(details);
                
                // Clear cart
                console.log('[GameMaster] 🧹 Clearing cart...');
                clearCart();
                
                // Close checkout
                console.log('[GameMaster] ❌ Closing checkout modal...');
                closeCheckout();
                
                console.log('[GameMaster] ✅ ===== PAYMENT FLOW COMPLETED =====');
            })
            .catch(error => {
                console.error('[GameMaster] ❌ ===== PAYMENT CAPTURE FAILED =====');
                console.error('[GameMaster] 💥 Capture error:', error);
                console.error('[GameMaster] 📊 Error stack:', error.stack);
                
                hideLoading();
                alert('Payment capture failed. Please contact support.');
            });
        },
        
        onError: function(err) {
            console.error('[GameMaster] ❌ ===== CARD FIELDS ERROR =====');
            console.error('[GameMaster] 💥 PayPal error:', err);
            console.error('[GameMaster] 📊 Error type:', typeof err);
            console.error('[GameMaster] 📋 Error details:', JSON.stringify(err, null, 2));
            alert('Payment failed. Please check your card details and try again.');
        }
    });
    
    console.log('[GameMaster] 🏗️ Card fields object created:', cardFields);
    
    // Render card fields with logging
    console.log('[GameMaster] 📱 ===== RENDERING CARD FIELDS =====');
    
    if (cardFields.NameField) {
        console.log('[GameMaster] 👤 Rendering name field...');
        cardFields.NameField().render('#card-name');
        console.log('[GameMaster] ✅ Name field rendered');
    } else {
        console.error('[GameMaster] ❌ NameField not available');
    }
    
    if (cardFields.NumberField) {
        console.log('[GameMaster] 💳 Rendering number field...');
        cardFields.NumberField().render('#card-number');
        console.log('[GameMaster] ✅ Number field rendered');
    } else {
        console.error('[GameMaster] ❌ NumberField not available');
    }
    
    if (cardFields.ExpiryField) {
        console.log('[GameMaster] 📅 Rendering expiry field...');
        cardFields.ExpiryField().render('#expiration-date');
        console.log('[GameMaster] ✅ Expiry field rendered');
    } else {
        console.error('[GameMaster] ❌ ExpiryField not available');
    }
    
    if (cardFields.CVVField) {
        console.log('[GameMaster] 🔒 Rendering CVV field...');
        cardFields.CVVField().render('#cvv');
        console.log('[GameMaster] ✅ CVV field rendered');
    } else {
        console.error('[GameMaster] ❌ CVVField not available');
    }
    
    // Enable button with detailed logging
    console.log('[GameMaster] ⏲️ Setting button enable timer...');
    setTimeout(() => {
        const submitButton = document.getElementById('card-submit-button');
        console.log('[GameMaster] 🔍 Submit button element:', submitButton);
        
        if (submitButton) {
            console.log('[GameMaster] 🔓 Enabling submit button...');
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
            console.log('[GameMaster] ✅ Submit button enabled successfully');
            console.log('[GameMaster] 📊 Button state - disabled:', submitButton.disabled, 'opacity:', submitButton.style.opacity);
        } else {
            console.error('[GameMaster] ❌ Submit button not found in DOM!');
        }
    }, 2000);
    
    // Add click event listener with detailed logging
    console.log('[GameMaster] 🖱️ Adding button click listener...');
    setTimeout(() => {
        const submitButton = document.getElementById('card-submit-button');
        if (submitButton) {
            // Remove any existing listeners
            submitButton.replaceWith(submitButton.cloneNode(true));
            const newSubmitButton = document.getElementById('card-submit-button');
            
            newSubmitButton.addEventListener('click', function(e) {
                console.log('[GameMaster] 🖱️ ===== BUTTON CLICK DETECTED =====');
                console.log('[GameMaster] 📊 Click event:', e);
                console.log('[GameMaster] 🎯 Button element:', this);
                console.log('[GameMaster] 📋 Button disabled state:', this.disabled);
                
                e.preventDefault();
                e.stopPropagation();
                
                console.log('[GameMaster] 🔍 Checking billing fields...');
                const billingCheck = validateBillingFields();
                
                if (!billingCheck.isValid) {
                    console.error('[GameMaster] ❌ Billing validation failed:', billingCheck.errors);
                    alert(`Please fill in required fields: ${billingCheck.errors.join(', ')}`);
                    return;
                }
                
                console.log('[GameMaster] ✅ Billing validation passed');
                console.log('[GameMaster] 🚀 Initiating PayPal card payment flow...');
                
                // Trigger PayPal submission
                if (cardFields && cardFields.submit) {
                    console.log('[GameMaster] 📤 Calling cardFields.submit()...');
                    cardFields.submit().catch(error => {
                        console.error('[GameMaster] ❌ Card submit error:', error);
                    });
                } else {
                    console.error('[GameMaster] ❌ cardFields.submit() not available');
                    console.log('[GameMaster] 📋 Available cardFields methods:', Object.keys(cardFields || {}));
                }
            });
            
            console.log('[GameMaster] ✅ Click listener added to button');
        } else {
            console.error('[GameMaster] ❌ Cannot add click listener - button not found');
        }
    }, 2500);
    
    cardFieldsRendered = true;
    console.log('[GameMaster] ✅ ===== CARD FIELDS INITIALIZATION COMPLETE =====');
}

// Enhanced billing validation with logging
function validateBillingFields() {
    console.log('[GameMaster] 🔍 ===== VALIDATING BILLING FIELDS =====');
    
    const fields = {
        firstName: document.getElementById('firstName')?.value?.trim(),
        lastName: document.getElementById('lastName')?.value?.trim(),
        address: document.getElementById('address')?.value?.trim(),
        city: document.getElementById('city')?.value?.trim(),
        state: document.getElementById('state')?.value,
        zipCode: document.getElementById('zipCode')?.value?.trim(),
        country: document.getElementById('country')?.value
    };
    
    console.log('[GameMaster] 📋 Field values:', fields);
    
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode'];
    const errors = requiredFields.filter(field => !fields[field]);
    
    const result = {
        isValid: errors.length === 0,
        errors: errors,
        fields: fields
    };
    
    console.log('[GameMaster] 📊 Validation result:', result);
    return result;
}

// Enhanced getBillingData with logging
function getBillingData() {
    console.log('[GameMaster] 📍 ===== COLLECTING BILLING DATA =====');
    
    const billing = {
        firstName: document.getElementById('firstName')?.value?.trim() || '',
        lastName: document.getElementById('lastName')?.value?.trim() || '',
        address: document.getElementById('address')?.value?.trim() || '',
        city: document.getElementById('city')?.value?.trim() || '',
        state: document.getElementById('state')?.value || '',
        zipCode: document.getElementById('zipCode')?.value?.trim() || '',
        country: document.getElementById('country')?.value || 'US'
    };
    
    console.log('[GameMaster] 📋 Collected billing data:', billing);
    
    const emptyFields = Object.keys(billing).filter(key => !billing[key]);
    if (emptyFields.length > 0) {
        console.warn('[GameMaster] ⚠️ Empty billing fields:', emptyFields);
    } else {
        console.log('[GameMaster] ✅ All billing fields populated');
    }
    
    return billing;
}