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
                showPaymentResultModal(details);
                
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

// SIMPLIFIED SOLUTION - Replace renderCardFields() function in script.js
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
                showPaymentResultModal(details);
                
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

// ADDITIONAL HELPER: Manual button click handler (if needed)
function handleCardSubmitClick() {
    console.log('[GameMaster] 💳 Card submit button clicked manually');
    
    // Validate billing fields first
    const billingData = getBillingData();
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !billingData[field]);
    
    if (missingFields.length > 0) {
        alert(`Please fill in all required billing fields: ${missingFields.join(', ')}`);
        return;
    }
    
    // This will trigger PayPal's createOrder -> onApprove flow
    console.log('[GameMaster] ✅ Initiating PayPal card payment...');
}

// ===== TRANSACTION LOGGING =====
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

// ===== SUCCESS MODAL =====

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
window.closePaymentResultModal = closePaymentResultModal;
window.downloadTransactions = downloadTransactions;

console.log('[GameMaster] 🎮 All systems ready! Happy gaming!');