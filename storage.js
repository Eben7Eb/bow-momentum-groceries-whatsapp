cat > storage.js << 'EOF'
const STORAGE_KEYS = {
    PRODUCTS: 'bow_momentum_products',
    ORDERS: 'bow_momentum_orders',
    ORDER_COUNTER: 'bow_momentum_order_counter',
};

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    console.log(`✓ Saved ${products.length} products`);
}

function getProducts() {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
}

function clearProducts() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    console.log('✓ Products cleared');
}

function generateOrderId() {
    let counter = parseInt(localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER)) || 0;
    counter++;
    localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, counter.toString());
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `ORDER-${date}-${String(counter).padStart(4, '0')}`;
}

function saveOrder(order) {
    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    console.log(`✓ Order saved: ${order.id}`);
    return order;
}

function getOrders() {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
}

function getOrderById(orderId) {
    const orders = getOrders();
    return orders.find(order => order.id === orderId) || null;
}

function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updated_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        console.log(`✓ Order ${orderId} status updated to ${status}`);
    }
}

function updateOrderPaymentStatus(orderId, paymentStatus) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].payment_status = paymentStatus;
        orders[orderIndex].updated_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        console.log(`✓ Order ${orderId} payment status updated to ${paymentStatus}`);
    }
}

function filterOrders(filter) {
    const orders = getOrders();

    switch (filter) {
        case 'new':
            return orders.filter(o => o.status === 'new');
        case 'preparing':
            return orders.filter(o => o.status === 'preparing');
        case 'ready':
            return orders.filter(o => o.status === 'ready');
        case 'paid':
            return orders.filter(o => o.payment_status === 'paid');
        case 'not_paid':
            return orders.filter(o => o.payment_status === 'not_paid');
        case 'pickup':
            return orders.filter(o => o.delivery_method === 'pickup');
        case 'delivery':
            return orders.filter(o => o.delivery_method === 'delivery');
        case 'all':
        default:
            return orders;
    }
}

function clearAllOrders() {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.ORDER_COUNTER);
    console.log('✓ All orders cleared');
}
EOF
