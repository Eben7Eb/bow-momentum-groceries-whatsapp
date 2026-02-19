cat > app.js << 'EOF'
// --- State Management ---
let currentOrderItems = [];
let selectedProduct = null;
let currentProducts = [];
let generatedOrder = null;

// --- DOM Elements ---
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const productSearchInput = document.getElementById('product-search');
const productDropdown = document.getElementById('product-dropdown');
const selectedProductDiv = document.getElementById('selected-product');
const quantityInput = document.getElementById('quantity');
const addToOrderBtn = document.getElementById('add-to-order-btn');
const orderItemsList = document.getElementById('order-items-list');
const orderTotalDiv = document.getElementById('order-total');
const totalAmountSpan = document.getElementById('total-amount');
const createOrderBtn = document.getElementById('create-order-btn');
const csvFileInput = document.getElementById('csv-file');
const productsListDisplay = document.getElementById('products-list');
const ordersListDisplay = document.getElementById('orders-list');
const filterBtns = document.querySelectorAll('.filter-btn');

// Modal Elements
const messageModal = document.getElementById('message-modal');
const messagePreview = document.getElementById('message-preview');
const closeModalBtn = document.querySelector('.close-btn');
const copyMessageBtn = document.getElementById('copy-message-btn');
const sendWhatsAppBtn = document.getElementById('send-whatsapp-btn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromStorage();
    renderOrders('all');
    setupEventListeners();
});

function setupEventListeners() {
    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Product Search & Selection
    productSearchInput.addEventListener('input', handleProductSearch);
    
    // Quantity Validation
    quantityInput.addEventListener('input', validateQuantity);

    // Add to Order
    addToOrderBtn.addEventListener('click', addToOrder);

    // Delivery Method Toggle
    document.querySelectorAll('input[name="delivery-method"]').forEach(radio => {
        radio.addEventListener('change', toggleDeliveryMethod);
    });

    // Create Order
    createOrderBtn.addEventListener('click', handleCreateOrder);

    // CSV Upload
    csvFileInput.addEventListener('change', (e) => {
        loadCSVFile(e.target.files[0], (products) => {
            currentProducts = products;
            renderProductsList();
        });
    });

    // Dashboard Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderOrders(btn.getAttribute('data-filter'));
        });
    });

    // Modal Actions
    closeModalBtn.addEventListener('click', () => messageModal.classList.add('hidden'));
    copyMessageBtn.addEventListener('click', () => copyToClipboard(messagePreview.innerText));
    sendWhatsAppBtn.addEventListener('click', () => {
        const url = generateWhatsAppURL(messagePreview.innerText);
        window.open(url, '_blank');
    });
}

// --- Tab Logic ---
function switchTab(tabId) {
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === tabId));
    tabContents.forEach(c => c.classList.toggle('active', c.id === tabId));
    
    if (tabId === 'dashboard') renderOrders('all');
    if (tabId === 'products') renderProductsList();
}

// --- Product Logic ---
function loadProductsFromStorage() {
    currentProducts = getProducts();
    renderProductsList();
}

function handleProductSearch(e) {
    const term = e.target.value.toLowerCase();
    if (!term) {
        productDropdown.classList.add('hidden');
        return;
    }

    const filtered = currentProducts.filter(p => 
        p.product_name.toLowerCase().includes(term)
    );

    if (filtered.length > 0) {
        productDropdown.innerHTML = filtered.map(p => `
            <li onclick="selectProduct('${p.id}')">
                ${p.product_name} - $${p.price_usd.toFixed(2)} (${p.available_quantity} left)
            </li>
        `).join('');
        productDropdown.classList.remove('hidden');
    } else {
        productDropdown.classList.add('hidden');
    }
}

window.selectProduct = function(productId) {
    selectedProduct = currentProducts.find(p => p.id === productId);
    productSearchInput.value = selectedProduct.product_name;
    productDropdown.classList.add('hidden');

    document.getElementById('product-name-display').innerText = `Product: ${selectedProduct.product_name}`;
    document.getElementById('product-price-display').innerText = `Price: $${selectedProduct.price_usd.toFixed(2)}`;
    document.getElementById('product-stock-display').innerText = `Stock: ${selectedProduct.available_quantity} available`;
    
    selectedProductDiv.classList.remove('hidden');
    quantityInput.disabled = false;
    quantityInput.value = 1;
    validateQuantity();
};

function validateQuantity() {
    const qty = parseInt(quantityInput.value);
    const errorMsg = document.getElementById('quantity-error');
    
    if (isNaN(qty) || qty <= 0) {
        addToOrderBtn.disabled = true;
        errorMsg.innerText = "Enter a valid quantity";
        errorMsg.classList.remove('hidden');
    } else if (selectedProduct && qty > selectedProduct.available_quantity) {
        addToOrderBtn.disabled = true;
        errorMsg.innerText = `Only ${selectedProduct.available_quantity} in stock`;
        errorMsg.classList.remove('hidden');
    } else {
        addToOrderBtn.disabled = false;
        errorMsg.classList.add('hidden');
    }
}

// --- Order Items Logic ---
function addToOrder() {
    const qty = parseInt(quantityInput.value);
    const item = {
        id: selectedProduct.id,
        product_name: selectedProduct.product_name,
        quantity: qty,
        price_per_unit: selectedProduct.price_usd,
        subtotal: selectedProduct.price_usd * qty
    };

    currentOrderItems.push(item);
    resetProductSelection();
    renderCurrentOrder();
}

function resetProductSelection() {
    selectedProduct = null;
    productSearchInput.value = '';
    quantityInput.value = '';
    quantityInput.disabled = true;
    selectedProductDiv.classList.add('hidden');
    addToOrderBtn.disabled = true;
}

function renderCurrentOrder() {
    if (currentOrderItems.length === 0) {
        orderItemsList.innerHTML = '<p class="placeholder-text">No items added yet</p>';
        orderTotalDiv.classList.add('hidden');
        createOrderBtn.disabled = true;
        return;
    }

    orderItemsList.innerHTML = currentOrderItems.map((item, index) => `
        <div class="order-item">
            <div class="order-item-details">
                <div class="order-item-name">${item.product_name}</div>
                <div class="order-item-quantity">Qty: ${item.quantity}</div>
            </div>
            <div class="order-item-price">$${item.subtotal.toFixed(2)}</div>
            <button class="order-item-remove" onclick="removeItem(${index})">&times;</button>
        </div>
    `).join('');

    const total = currentOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
    totalAmountSpan.innerText = total.toFixed(2);
    orderTotalDiv.classList.remove('hidden');
    createOrderBtn.disabled = false;
}

window.removeItem = function(index) {
    currentOrderItems.splice(index, 1);
    renderCurrentOrder();
};

function toggleDeliveryMethod() {
    const method = document.querySelector('input[name="delivery-method"]:checked').value;
    document.getElementById('pickup-section').classList.toggle('hidden', method !== 'pickup');
    document.getElementById('delivery-section').classList.toggle('hidden', method !== 'delivery');
}

// --- Order Submission ---
function handleCreateOrder() {
    const method = document.querySelector('input[name="delivery-method"]:checked').value;
    
    const orderData = {
        id: generateOrderId(),
        created_at: new Date().toISOString(),
        items: [...currentOrderItems],
        total_amount: parseFloat(totalAmountSpan.innerText),
        delivery_method: method,
        pickup_time: document.getElementById('pickup-time').value || 'Not specified',
        delivery_address: document.getElementById('delivery-address').value,
        delivery_landmark: document.getElementById('delivery-landmark').value,
        special_notes: document.getElementById('special-notes').value,
        payment_status: document.getElementById('payment-status').value,
        status: 'new'
    };

    saveOrder(orderData);
    generatedOrder = orderData;
    
    // Show Modal
    const message = generateOrderMessage(orderData);
    messagePreview.innerText = message;
    messageModal.classList.remove('hidden');

    // Reset Form
    currentOrderItems = [];
    renderCurrentOrder();
    document.getElementById('special-notes').value = '';
}

// --- Dashboard & Product Management ---
function renderOrders(filter) {
    const orders = filterOrders(filter);
    if (orders.length === 0) {
        ordersListDisplay.innerHTML = '<p class="placeholder-text">No matching orders found</p>';
        return;
    }

    ordersListDisplay.innerHTML = orders.reverse().map(order => `
        <div class="order-card">
            <div class="order-card-header">
                <span class="order-id">${order.id}</span>
                <span class="order-date">${formatDate(order.created_at)}</span>
            </div>
            <div class="order-card-body">
                <span class="badge badge-status">${order.status}</span>
                <span class="badge badge-payment-${order.payment_status.replace('_', '-')}">${order.payment_status}</span>
                <span class="badge badge-delivery">${order.delivery_method}</span>
                
                <div class="order-card-items" style="margin-top:10px">
                    ${order.items.map(i => `<div class="order-card-item"><span>${i.product_name} x${i.quantity}</span><span>$${i.subtotal.toFixed(2)}</span></div>`).join('')}
                    <div class="order-card-item"><strong>Total</strong><strong>$${order.total_amount.toFixed(2)}</strong></div>
                </div>
            </div>
            <div class="order-card-footer">
                <div class="order-card-footer-group">
                    <select onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Ready</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </div>
                <div class="order-card-footer-group">
                    <select onchange="updateOrderPaymentStatus('${order.id}', this.value)">
                        <option value="not_paid" ${order.payment_status === 'not_paid' ? 'selected' : ''}>Not Paid</option>
                        <option value="paid" ${order.payment_status === 'paid' ? 'selected' : ''}>Paid</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProductsList() {
    if (currentProducts.length === 0) {
        productsListDisplay.innerHTML = '<p class="placeholder-text">No products loaded</p>';
        return;
    }

    productsListDisplay.innerHTML = currentProducts.map(p => `
        <div class="product-item">
            <div class="product-item-info">
                <div class="product-item-name">${p.product_name}</div>
                <div class="product-item-details">
                    <span>Stock: ${p.available_quantity}</span>
                    <span>Price: $${p.price_usd.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `).join('');
}
EOF
