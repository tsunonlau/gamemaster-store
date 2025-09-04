// UPDATE: Replace the onApprove functions in your PayPal integration (script.js)

// In renderPayPalButtons() function, update the onApprove:
onApprove: function(data, actions) {
    console.log('[GameMaster] ✅ PayPal payment approved, capturing...');
    showLoading();
    
    return actions.order.capture().then(function(details) {
        console.log('[GameMaster] 🎉 Payment captured:', details);
        hideLoading();
        
        // CHANGED: Use new payment result modal instead of success modal
        showPaymentResultModal(details);
        
        // Close checkout (only close if payment was successful)
        closeCheckout();
    });
},

// In renderCardFields() function, update the onApprove:
onApprove: function(data) {
    console.log('[GameMaster] ✅ Card payment approved, capturing...');
    showLoading();
    
    return fetch('/api/capture-paypal-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: data.orderID })
    })
    .then(response => response.json())
    .then(details => {
        console.log('[GameMaster] 🎉 Card payment captured:', details);
        hideLoading();
        
        // CHANGED: Use new payment result modal instead of success modal
        showPaymentResultModal(details);
        
        // Close checkout (only close if payment was successful)  
        closeCheckout();
    })
    .catch(error => {
        console.error('[GameMaster] ❌ Capture failed:', error);
        hideLoading();
        alert('Payment capture failed. Please contact support.');
    });
},

// UPDATE: Replace closeSuccessModal calls with closePaymentResultModal
// Find and replace all instances of:
// closeSuccessModal() -> closePaymentResultModal()

// UPDATE: Add new global function exports
window.showPaymentResultModal = showPaymentResultModal;
window.closePaymentResultModal = closePaymentResultModal;