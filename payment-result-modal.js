// UPDATED: Replace showSuccessModal() function in script.js - Now handles success/failure based on capture status

function showPaymentResultModal(details) {
    const modal = document.getElementById('successModal');
    const orderDetails = document.getElementById('orderDetails');
    
    console.log('[GameMaster] 🔍 Payment result modal - Full PayPal response:', details);
    
    // CRITICAL: Check actual payment capture status instead of order status
    let paymentStatus = 'UNKNOWN';
    let isPaymentSuccessful = false;
    let declineReason = '';
    
    if (details.purchase_units && details.purchase_units[0] && 
        details.purchase_units[0].payments && details.purchase_units[0].payments.captures &&
        details.purchase_units[0].payments.captures[0]) {
        
        const capture = details.purchase_units[0].payments.captures[0];
        paymentStatus = capture.status;
        isPaymentSuccessful = (paymentStatus === 'COMPLETED');
        
        console.log(`[GameMaster] 💳 Actual payment capture status: ${paymentStatus}`);
        
        // Extract decline reason if payment failed
        if (!isPaymentSuccessful && capture.processor_response) {
            const processorResponse = capture.processor_response;
            declineReason = processorResponse.response_code || 'Unknown error';
            
            // Map common decline codes to user-friendly messages
            const declineMessages = {
                '5400': 'Card expired',
                '0500': 'Card declined by bank',
                '9500': 'Suspected fraud - try another card',
                '5180': 'Invalid card - try another card',
                '5120': 'Insufficient funds',
                '9520': 'Lost or stolen card - try another card',
                '1330': 'Invalid account',
                '5100': 'Generic decline',
                '00N7': 'CVV verification failed'
            };
            
            declineReason = declineMessages[processorResponse.response_code] || `Decline code: ${processorResponse.response_code}`;
            console.log(`[GameMaster] ❌ Payment decline reason: ${declineReason}`);
        }
    } else {
        console.warn('[GameMaster] ⚠️ No capture information found, using order status as fallback');
        isPaymentSuccessful = (details.status === 'COMPLETED');
        paymentStatus = details.status;
    }
    
    // Extract amount
    let totalAmount = '0.00';
    if (details.purchase_units && details.purchase_units[0] && 
        details.purchase_units[0].payments && details.purchase_units[0].payments.captures &&
        details.purchase_units[0].payments.captures[0] && details.purchase_units[0].payments.captures[0].amount) {
        totalAmount = details.purchase_units[0].payments.captures[0].amount.value;
    }
    else if (details.purchase_units && details.purchase_units[0] && details.purchase_units[0].amount) {
        totalAmount = details.purchase_units[0].amount.value;
    }
    else if (cart && cart.length > 0) {
        totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    }
    
    // Extract payer name
    let payerName = 'N/A';
    const firstNameField = document.getElementById('firstName');
    const lastNameField = document.getElementById('lastName');
    if (firstNameField && lastNameField && firstNameField.value && lastNameField.value) {
        payerName = `${firstNameField.value.trim()} ${lastNameField.value.trim()}`;
    }
    else if (details.payer && details.payer.name) {
        const givenName = details.payer.name.given_name || '';
        const surname = details.payer.name.surname || '';
        if (givenName || surname) {
            payerName = `${givenName} ${surname}`.trim();
        }
    }
    
    // Extract payment method
    let paymentMethod = 'Unknown';
    if (details.payment_source) {
        if (details.payment_source.card) {
            const brand = details.payment_source.card.brand || 'Credit';
            const lastDigits = details.payment_source.card.last_digits || 'XXXX';
            paymentMethod = `${brand} Card ****${lastDigits}`;
        } else if (details.payment_source.paypal) {
            paymentMethod = 'PayPal Account';
        }
    } else {
        paymentMethod = 'PayPal';
    }
    
    // BUILD MODAL CONTENT BASED ON PAYMENT SUCCESS/FAILURE
    if (isPaymentSuccessful) {
        console.log('[GameMaster] ✅ Payment successful - showing success modal');
        
        // SUCCESS MODAL CONTENT
        const successContent = modal.querySelector('.success-content');
        successContent.innerHTML = `
            <i class="fas fa-check-circle success-icon"></i>
            <h2 class="success-title">Payment Successful!</h2>
            <p class="success-message">Thank you for your purchase. Your order has been confirmed.</p>
            <div class="order-details">
                <h4>🎉 Order Confirmation</h4>
                <div class="order-detail-item">
                    <strong>Order ID:</strong> <span>${details.id}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Amount:</strong> <span>$${totalAmount}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Payment Status:</strong> <span class="status-success">${paymentStatus}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Payment Method:</strong> <span>${paymentMethod}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Payer:</strong> <span>${payerName}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Transaction Date:</strong> <span>${new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
            </div>
            <div class="success-buttons">
                <button onclick="closePaymentResultModal()" class="success-button">
                    <i class="fas fa-shopping-cart"></i> Continue Shopping
                </button>
                <button onclick="downloadTransactions()" class="download-button">
                    <i class="fas fa-download"></i> Download Receipt
                </button>
            </div>
        `;
        
        // Log successful transaction
        logTransaction(details, paymentMethod.includes('Card') ? 'Card' : 'PayPal');
        
        // Clear cart on successful payment
        clearCart();
        
    } else {
        console.log('[GameMaster] ❌ Payment failed - showing failure modal');
        
        // FAILURE MODAL CONTENT
        const successContent = modal.querySelector('.success-content');
        successContent.innerHTML = `
            <i class="fas fa-times-circle failure-icon"></i>
            <h2 class="failure-title">Payment Failed</h2>
            <p class="failure-message">Unfortunately, your payment could not be processed. Please try again.</p>
            <div class="order-details failure-details">
                <h4>❌ Payment Details</h4>
                <div class="order-detail-item">
                    <strong>Order ID:</strong> <span>${details.id}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Attempted Amount:</strong> <span>$${totalAmount}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Payment Status:</strong> <span class="status-failed">${paymentStatus}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Payment Method:</strong> <span>${paymentMethod}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Decline Reason:</strong> <span class="decline-reason">${declineReason}</span>
                </div>
                <div class="order-detail-item">
                    <strong>Attempt Date:</strong> <span>${new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </div>
            </div>
            <div class="failure-buttons">
                <button onclick="closePaymentResultModal()" class="retry-button">
                    <i class="fas fa-credit-card"></i> Try Different Payment
                </button>
                <button onclick="closePaymentResultModal(); toggleCart();" class="cart-button">
                    <i class="fas fa-shopping-cart"></i> Review Cart
                </button>
            </div>
        `;
        
        // Log failed transaction for debugging
        logFailedTransaction(details, paymentMethod, declineReason);
        
        // Keep cart items for retry
    }
    
    modal.classList.add('show');
    console.log(`[GameMaster] 🎯 Payment result modal displayed - Success: ${isPaymentSuccessful}`);
}

// UPDATED: Replace closeSuccessModal with generic close function
function closePaymentResultModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    console.log('[GameMaster] ❌ Payment result modal closed');
}

// NEW: Log failed transactions for debugging
function logFailedTransaction(details, paymentMethod, reason) {
    console.log(`[GameMaster] 📝 Logging failed ${paymentMethod} transaction:`, details);
    
    const failedTransactionData = {
        timestamp: new Date().toISOString(),
        orderId: details.id,
        paymentMethod: paymentMethod,
        status: 'FAILED',
        declineReason: reason,
        payerEmail: details.payer?.email_address || 'N/A',
        cartItems: cart,
        transactionDetails: details
    };
    
    // Store failed transactions separately for analysis
    const existingFailedLogs = JSON.parse(localStorage.getItem('gamemaster-failed-transactions') || '[]');
    existingFailedLogs.push(failedTransactionData);
    localStorage.setItem('gamemaster-failed-transactions', JSON.stringify(existingFailedLogs));
    
    console.log('[GameMaster] ⚠️ Failed transaction logged for debugging');
}

// UPDATE: Replace all calls to showSuccessModal with showPaymentResultModal
// In your PayPal integration, change:
// showSuccessModal(details); 
// TO:
// showPaymentResultModal(details);