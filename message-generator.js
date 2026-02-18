/**
 * MESSAGE-GENERATOR.JS
 * Generates WhatsApp-formatted messages for orders.
 * Uses click-to-chat links (no API needed).
 */

const STORE_NAME = 'Bow Momentum Groceries';
const STORE_PHONE = '263780616728'; // Replace with your WhatsApp number (with country code)

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

/**
 * Format date for display
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Generate WhatsApp message from order
 * @param {Object} order - Order object
 * @returns {string} Formatted message text
 */
function generateOrderMessage(order) {
    let message = `📦 *${STORE_NAME}*\n`;
    message += `Order ID: ${order.id}\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;

    // Product Items
    message += `📝 *Items:*\n`;
    order.items.forEach(item => {
        message += `• ${item.product_name}\n`;
        message += `  Qty: ${item.quantity} × ${formatCurrency(item.price_per_unit)} = ${formatCurrency(item.subtotal)}\n`;
    });
    message += `\n`;

    // Total
    message += `💰 *Total: ${formatCurrency(order.total_amount)}*\n`;
    message += `📊 Payment: ${order.payment_status === 'paid' ? '✅ Paid' : '⏳ Not Paid'}\n\n`;

    // Delivery/Pickup
    if (order.delivery_method === 'pickup') {
        message += `🏪 *Pickup Details:*\n`;
        message += `📍 Location: ${STORE_NAME}\n`;
        message += `🕐 Time: ${order.pickup_time}\n`;
    } else {
        message += `🚚 *Delivery Details:*\n`;
        message += `📍 Address: ${order.delivery_address}\n`;
        if (order.delivery_landmark) {
            message += `🗺️ Landmark: ${order.delivery_landmark}\n`;
        }
    }

    // Special Notes
    if (order.special_notes) {
        message += `\n📌 *Special Notes:*\n`;
        message += `${order.special_notes}\n`;
    }

    message += `\n━━━━━━━━━━━━━━━━━━\n`;
    message += `Thank you for your order! 🙏`;

    return message;
}

/**
 * Generate WhatsApp click-to-chat URL
 * @param {string} message - Message text
 * @returns {string} WhatsApp URL
 */
function generateWhatsAppURL(message) {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${STORE_PHONE}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp share link
 * @param {string} message - Message text
 * @returns {string} WhatsApp share link
 */
function generateWhatsAppLink(message) {
    return generateWhatsAppURL(message);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('✓ Message copied to clipboard');
        }).catch(err => {
            console.error('Copy failed:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text - Text to copy
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    console.log('✓ Message copied (fallback method)');
}
