// CORRECTED: Replace showSuccessModal() function in script.js

function showSuccessModal(details) {
    const modal = document.getElementById('successModal');
    const orderDetails = document.getElementById('orderDetails');
    
    console.log('[GameMaster] 🔍 Success modal - Full PayPal response:', details);
    
    // MULTIPLE METHODS TO EXTRACT AMOUNT (in order of preference)
    let totalAmount = '0.00';
    
    // Method 1: From capture amount (most reliable for captured payments)
    if (details.purchase_units && details.purchase_units[0] && 
        details.purchase_units[0].payments && details.purchase_units[0].payments.captures &&
        details.purchase_units[0].payments.captures[0] && details.purchase_units[0].payments.captures[0].amount) {
        totalAmount = details.purchase_units[0].payments.captures[0].amount.value;
        console.log('[GameMaster] ✅ Amount from capture:', totalAmount);
    }
    // Method 2: From purchase unit amount (fallback)
    else if (details.purchase_units && details.purchase_units[0] && details.purchase_units[0].amount) {
        totalAmount = details.purchase_units[0].amount.value;
        console.log('[GameMaster] ✅ Amount from purchase_unit:', totalAmount);
    }
    // Method 3: From original cart total (if stored locally)
    else if (cart && cart.length > 0) {
        totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
        console.log('[GameMaster] ✅ Amount from local cart:', totalAmount);
    }
    
    console.log('[GameMaster] 💰 Final amount for display:', totalAmount);
    
    // Extract payment method more accurately
    let paymentMethod = 'Unknown';
    if (details.payment_source) {
        if (details.payment_source.card) {
            paymentMethod = `${details.payment_source.card.brand || 'Credit'} Card ****${details.payment_source.card.last_digits || 'XXXX'}`;
        } else if (details.payment_source.paypal) {
            paymentMethod = 'PayPal Account';
        }
    } else {
        paymentMethod = 'PayPal';
    }
    
    // Extract payer information
    let payerName = 'N/A';
    if (details.payer && details.payer.name) {
        payerName = `${details.payer.name.given_name || ''} ${details.payer.name.surname || ''}`.trim();
    }
    
    // Enhanced order details
    orderDetails.innerHTML = `
        <h4>🎉 Order Confirmation</h4>
        <div class="order-detail-item">
            <strong>Order ID:</strong> <span>${details.id}</span>
        </div>
        <div class="order-detail-item">
            <strong>Amount:</strong> <span>$${totalAmount}</span>
        </div>
        <div class="order-detail-item">
            <strong>Status:</strong> <span>${details.status}</span>
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
    `;
    
    // Update the success content with properly structured buttons
    const successContent = modal.querySelector('.success-content');
    
    // Find and replace the button section
    const existingOrderDetails = successContent.querySelector('.order-details');
    const existingButtons = successContent.querySelector('.success-buttons');
    
    // If buttons don't exist, create them
    if (!existingButtons) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'success-buttons';
        buttonContainer.innerHTML = `
            <button onclick="closeSuccessModal()" class="success-button">
                <i class="fas fa-shopping-cart"></i> Continue Shopping
            </button>
            <button onclick="downloadTransactions()" class="download-button">
                <i class="fas fa-download"></i> Download Receipt
            </button>
        `;
        successContent.appendChild(buttonContainer);
    }
    
    modal.classList.add('show');
    console.log('[GameMaster] 🎉 Enhanced success modal displayed with amount: $' + totalAmount);
}

// ENHANCED: Add amount validation logging to logTransaction function
function logTransaction(details, paymentMethod) {
    console.log(`[GameMaster] 📝 Logging ${paymentMethod} transaction:`, details);
    
    // Extract amount using same logic as success modal
    let amount = '0.00';
    if (details.purchase_units && details.purchase_units[0] && 
        details.purchase_units[0].payments && details.purchase_units[0].payments.captures &&
        details.purchase_units[0].payments.captures[0] && details.purchase_units[0].payments.captures[0].amount) {
        amount = details.purchase_units[0].payments.captures[0].amount.value;
    } else if (details.purchase_units && details.purchase_units[0] && details.purchase_units[0].amount) {
        amount = details.purchase_units[0].amount.value;
    } else if (cart && cart.length > 0) {
        amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    }
    
    console.log(`[GameMaster] 💰 Transaction amount for logging: $${amount}`);
    
    const transactionData = {
        timestamp: new Date().toISOString(),
        orderId: details.id,
        paymentMethod: paymentMethod,
        amount: amount,
        status: details.status,
        payerEmail: details.payer?.email_address || 'N/A',
        cartItems: cart,
        transactionDetails: details
    };
    
    // Store locally for CSV export
    const existingLogs = JSON.parse(localStorage.getItem('gamemaster-transactions') || '[]');
    existingLogs.push(transactionData);
    localStorage.setItem('gamemaster-transactions', JSON.stringify(existingLogs));
    
    console.log('[GameMaster] ✅ Transaction logged locally with correct amount');
}