// GameMaster Board Game Store - Complete Frontend JavaScript
// Features: Product Management, Cart, PayPal Integration, CSV Logging

console.log('[GameMaster] 🎲 Initializing board game store...');

// ===== PRODUCT DATA =====
const products = [
    {
        id: 1,
        name: "Settlers of Catan",
        description: "Trade, build, and settle the island of Catan in this modern classic strategy game.",
        price: 44.99,
        rating: 4.7,
        players: "3-4",
        playtime: "60-90 min",
        age: "10+",
        category: "Strategy",
        stock: 15,
        image: "fas fa-cubes"
    },
    {
        id: 2,
        name: "Wingspan",
        description: "A relaxing, award-winning strategy card game about birds for 1 to 5 players.",
        price: 54.99,
        rating: 4.8,
        players: "1-5",
        playtime: "40-70 min",
        age: "10+",
        category: "Engine Building",
        stock: 12,
        image: "fas fa-dove"
    },
    {
        id: 3,
        name: "Azul",
        description: "A beautiful tile-laying game where players compete to create stunning mosaics.",
        price: 39.99,
        rating: 4.6,
        players: "2-4",
        playtime: "30-45 min",
        age: "8+",
        category: "Abstract Strategy",
        stock: 20,
        image: "fas fa-th-large"
    },
    {
        id: 4,
        name: "Root",
        description: "An asymmetric game of adventure and war where players control different factions.",
        price: 59.99,
        rating: 4.9,
        players: "2-4",
        playtime: "60-90 min",
        age: "10+",
        category: "Area Control",
        stock: 8,
        image: "fas fa-paw"
    },
    {
        id: 5,
        name: "Gloomhaven",
        description: "The ultimate dungeon-crawling tactical combat game with legacy elements.",
        price: 124.95,
        rating: 4.9,
        players: "1-4",
        playtime: "60-120 min",
        age: "12+",
        category: "Dungeon Crawler",
        stock: 5,
        image: "fas fa-dungeon"
    },
    {
        id: 6,
        name: "Ticket to Ride",
        description: "Cross-country train adventure that's fun for the whole family.",
        price: 49.99,
        rating: 4.5,
        players: "2-5",
        playtime: "30-60 min",
        age: "8+",
        category: "Route Building",
        stock: 18,
        image: "fas fa-train"
    }
];

// ===== GLOBAL VARIABLES =====
let cart = JSON.parse(localStorage.getItem('gamemaster-cart')) || [];
let isCheckoutOpen = false;
let paypalButtonsRendered = false;
let cardFieldsRendered = false;

// ===== UI INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('[GameMaster] 📦 DOM loaded, initializing components...');
    renderProducts();
    updateCartUI();
    initializeEventListeners();
    console.log('[GameMaster] ✅ Store ready for shopping!');
});

// ===== PRODUCT RENDERING =====
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    console.log(`[GameMaster] 🎯 Rendering ${products.length} products...`);
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})" data-product-id="${product.id}">
            <div class="product-image">
                <i class="${product.image}"></i>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-details">
                    <div class="product-specs">
                        <small><i class="fas fa-users"></i> ${product.players} players</small>
                        <small><i class="fas fa-clock"></i> ${product.playtime}</small>
                        <small><i class="fas fa-child"></i> Age ${product.age}</small>
                    </div>
                    <div class="product-rating">
                        ${generateStars(product.rating)}
                        <span>(${product.rating})</span>
                    </div>
                </div>
                <div class="product-price-section">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-stock">
                        <i class="fas fa-box"></i> ${product.stock} in stock
                    </div>
                </div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

// ===== CART MANAGEMENT =====
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error(`[GameMaster] ❌ Product ${productId} not found`);
        return;
    }
    
    console.log(`[GameMaster] 🛒 Adding ${product.name} to cart (qty: ${quantity})`);
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
        console.log(`[GameMaster] 📈 Updated quantity for ${product.name}: ${existingItem.quantity}`);
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
        console.log(`[GameMaster] ➕ Added new item: ${product.name}`);
    }
    
    saveCart();
    updateCartUI();
    showCartNotification(product.name, quantity);
}

function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        console.log(`[GameMaster] 🗑️ Removing ${item.name} from cart`);
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    }
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item && newQuantity > 0) {
        console.log(`[GameMaster] 🔄 Updating ${item.name} quantity: ${item.quantity} → ${newQuantity}`);
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    } else if (newQuantity <= 0) {
        removeFromCart(productId);
    }
}

function saveCart() {
    localStorage.setItem('gamemaster-cart', JSON.stringify(cart));
    console.log(`[GameMaster] 💾 Cart saved: ${cart.length} items`);
}

function clearCart() {
    console.log('[GameMaster] 🧹 Clearing cart...');
    cart = [];
    saveCart();
    updateCartUI();
}

// ===== CART UI =====
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart count
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update cart total
    if (cartTotal) {
        cartTotal.textContent = totalPrice.toFixed(2);
    }
    
    // Update checkout button
    if (checkoutButton) {
        checkoutButton.disabled = cart.length === 0;
    }
    
    // Update cart items
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p><i class="fas fa-shopping-cart"></i></div>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <i class="${item.image}"></i>
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    console.log(`[GameMaster] 🎯 Cart UI updated: ${totalItems} items, $${totalPrice.toFixed(2)}`);
}

function showCartNotification(productName, quantity) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Added ${quantity}x ${productName} to cart
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== MODAL MANAGEMENT =====
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    console.log(`[GameMaster] 👀 Opening modal for: ${product.name}`);
    
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('productModalContent');
    
    modalContent.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image">
                <i class="${product.image}"></i>
            </div>
            <div class="product-detail-info">
                <h2>${product.name}</h2>
                <div class="product-detail-price">$${product.price.toFixed(2)}</div>
                <div class="product-detail-rating">
                    ${generateStars(product.rating)} (${product.rating})
                </div>
                <div class="product-specs-detailed">
                    <div class="spec-item">
                        <strong>Players:</strong> ${product.players}
                    </div>
                    <div class="spec-item">
                        <strong>Play Time:</strong> ${product.playtime}
                    </div>
                    <div class="spec-item">
                        <strong>Age:</strong> ${product.age}
                    </div>
                    <div class="spec-item">
                        <strong>Category:</strong> ${product.category}
                    </div>
                </div>
                <p class="product-detail-description">${product.description}</p>
                <div class="product-detail-actions">
                    <div class="quantity-selector">
                        <label for="modal-quantity">Quantity:</label>
                        <input type="number" id="modal-quantity" value="1" min="1" max="${product.stock}" class="quantity-input">
                    </div>
                    <button class="add-to-cart large" onclick="addToCartFromModal(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function addToCartFromModal(productId) {
    const quantityInput = document.getElementById('modal-quantity');
    const quantity = parseInt(quantityInput.value) || 1;
    addToCart(productId, quantity);
    closeProductModal();
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
}

// ===== CART SIDEBAR =====
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('open');
    
    if (cartSidebar.classList.contains('open')) {
        console.log('[GameMaster] 🛒 Cart sidebar opened');
    } else {
        console.log('[GameMaster] 🛒 Cart sidebar closed');
    }
}

// ===== CHECKOUT PROCESS =====
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    console.log('[GameMaster] 💳 Proceeding to checkout...');
    
    const modal = document.getElementById('checkoutModal');
    
    // Update checkout summary
    updateCheckoutSummary();
    
    modal.classList.add('show');
    isCheckoutOpen = true;
    
    // Initialize PayPal components
    setTimeout(() => {
        initializePayPalComponents();
    }, 500);
}

function updateCheckoutSummary() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div class="checkout-item-info">
                <span>${item.name} x${item.quantity}</span>
            </div>
            <div class="checkout-item-price">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
    
    checkoutTotal.textContent = totalPrice.toFixed(2);
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('show');
    isCheckoutOpen = false;
    console.log('[GameMaster] ❌ Checkout closed');
}

// ===== PAYPAL INTEGRATION =====
function initializePayPalComponents() {
    if (!window.paypal) {
        console.error('[GameMaster] ❌ PayPal SDK not loaded');
        return;
    }
    
    console.log('[GameMaster] 💰 Initializing PayPal components...');
    
    // Initialize PayPal Buttons
    if (!paypalButtonsRendered) {
        renderPayPalButtons();
    }
    
    // Initialize Card Fields
    if (!cardFieldsRendered) {
        renderCardFields();
    }
}

function renderPayPalButtons() {
    const buttonContainer = document.getElementById('paypal-button-container');
    if (!buttonContainer) return;
    
    buttonContainer.innerHTML = '';
    
    paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'paypal'
        },
        
        createOrder: function(data, actions) {
            console.log('[GameMaster] 🏗️ Creating PayPal order...');
            
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmount.toFixed(2),
                        currency_code: 'USD'
                    },
                    description: 'GameMaster Board Games Order'
                }]
            });
        },
        
        onApprove: function(data, actions) {
            console.log('[GameMaster] ✅ PayPal payment approved, capturing...');
            showLoading();
            
            return actions.order.capture().then(function(details) {
                console.log('[GameMaster] 🎉 Payment captured successfully:', details);
                hideLoading();
                
                // Log transaction
                logTransaction(details, 'PayPal');
                
                // Show success
                showSuccessModal(details);
                
                // Clear cart
                clearCart();
                closeCheckout();
            });
        },
        
        onError: function(err) {
            console.error('[GameMaster] ❌ PayPal error:', err);
            hideLoading();
            alert('Payment failed. Please try again.');
        }
        
    }).render('#paypal-button-container');
    
    paypalButtonsRendered = true;
    console.log('[GameMaster] ✅ PayPal buttons rendered');
}

function renderCardFields() {
    if (!paypal.CardFields) {
        console.error('[GameMaster] ❌ PayPal Card Fields not available');
        return;
    }
    
    console.log('[GameMaster] 💳 Initializing card fields...');
    
    const cardFields = paypal.CardFields({
        style: {
            'input': {
                'font-size': '16px',
                'font-family': 'Poppins, sans-serif',
                'color': '#333'
            }
        },
        
        createOrder: function() {
            console.log('[GameMaster] 🏗️ Creating card order...');
            
            const billingData = getBillingData();
            const orderData = {
                cart: {
                    items: cart,
                    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
                },
                billing: billingData
            };
            
            return fetch('/api/create-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('[GameMaster] ✅ Order created:', data.id);
                return data.id;
            })
            .catch(error => {
                console.error('[GameMaster] ❌ Order creation failed:', error);
                throw error;
            });
        },
        
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
                
                // Log transaction
                logTransaction(details, 'Card');
                
                // Show success
                showSuccessModal(details);
                
                // Clear cart
                clearCart();
                closeCheckout();
            })
            .catch(error => {
                console.error('[GameMaster] ❌ Capture failed:', error);
                hideLoading();
                alert('Payment capture failed. Please contact support.');
            });
        },
        
        onError: function(err) {
            console.error('[GameMaster] ❌ Card fields error:', err);
            alert('Payment failed. Please check your card details and try again.');
        }
    });
    
    // Render individual card fields
    if (cardFields.NameField) {
        cardFields.NameField().render('#card-name');
    }
    if (cardFields.NumberField) {
        cardFields.NumberField().render('#card-number');
    }
    if (cardFields.ExpiryField) {
        cardFields.ExpiryField().render('#expiration-date');
    }
    if (cardFields.CVVField) {
        cardFields.CVVField().render('#cvv');
    }
    
    // Enable submit button when fields are valid
    cardFields.getState().then(state => {
        const submitButton = document.getElementById('card-submit-button');
        if (submitButton) {
            submitButton.disabled = !state.isFormValid;
        }
    });
    
    cardFieldsRendered = true;
    console.log('[GameMaster] ✅ Card fields rendered');
}

function getBillingData() {
    return {
        firstName: document.getElementById('firstName')?.value || '',
        lastName: document.getElementById('lastName')?.value || '',
        address: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        state: document.getElementById('state')?.value || '',
        zipCode: document.getElementById('zipCode')?.value || '',
        country: document.getElementById('country')?.value || 'US'
    };
}

// ===== TRANSACTION LOGGING =====
function logTransaction(details, paymentMethod) {
    console.log(`[GameMaster] 📝 Logging ${paymentMethod} transaction:`, details);
    
    const transactionData = {
        timestamp: new Date().toISOString(),
        orderId: details.id,
        paymentMethod: paymentMethod,
        amount: details.purchase_units?.[0]?.amount?.value || '0.00',
        status: details.status,
        payerEmail: details.payer?.email_address || 'N/A',
        cartItems: cart,
        transactionDetails: details
    };
    
    // Store locally for CSV export
    const existingLogs = JSON.parse(localStorage.getItem('gamemaster-transactions') || '[]');
    existingLogs.push(transactionData);
    localStorage.setItem('gamemaster-transactions', JSON.stringify(existingLogs));
    
    console.log('[GameMaster] ✅ Transaction logged locally');
}

// ===== SUCCESS MODAL =====
function showSuccessModal(details) {
    const modal = document.getElementById('successModal');
    const orderDetails = document.getElementById('orderDetails');
    
    const totalAmount = details.purchase_units?.[0]?.amount?.value || '0.00';
    
    orderDetails.innerHTML = `
        <div class="order-detail-item">
            <strong>Order ID:</strong> ${details.id}
        </div>
        <div class="order-detail-item">
            <strong>Amount:</strong> $${totalAmount}
        </div>
        <div class="order-detail-item">
            <strong>Status:</strong> ${details.status}
        </div>
        <div class="order-detail-item">
            <strong>Payment Method:</strong> ${details.payment_source ? 'Card' : 'PayPal'}
        </div>
    `;
    
    modal.classList.add('show');
    console.log('[GameMaster] 🎉 Success modal displayed');
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
}

// ===== LOADING STATES =====
function showLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.classList.add('show');
    }
    console.log('[GameMaster] ⏳ Loading overlay shown');
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.classList.remove('show');
    }
    console.log('[GameMaster] ✅ Loading overlay hidden');
}

// ===== CSV EXPORT =====
function downloadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('gamemaster-transactions') || '[]');
    
    if (transactions.length === 0) {
        alert('No transactions to download');
        return;
    }
    
    console.log(`[GameMaster] 📥 Downloading ${transactions.length} transactions...`);
    
    // Convert to CSV
    const headers = ['Timestamp', 'Order ID', 'Payment Method', 'Amount', 'Status', 'Payer Email'];
    const csvData = [
        headers,
        ...transactions.map(t => [
            t.timestamp,
            t.orderId,
            t.paymentMethod,
            t.amount,
            t.status,
            t.payerEmail
        ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamemaster-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log('[GameMaster] ✅ Transactions downloaded');
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // Handle card submit button
    const cardSubmitButton = document.getElementById('card-submit-button');
    if (cardSubmitButton) {
        cardSubmitButton.addEventListener('click', function() {
            console.log('[GameMaster] 💳 Card submit button clicked');
            // This will trigger the card fields submission
        });
    }
    
    console.log('[GameMaster] ✅ Event listeners initialized');
}

// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.proceedToCheckout = proceedToCheckout;
window.closeCheckout = closeCheckout;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.addToCartFromModal = addToCartFromModal;
window.closeSuccessModal = closeSuccessModal;
window.downloadTransactions = downloadTransactions;

console.log('[GameMaster] 🎮 All systems ready! Happy gaming!');