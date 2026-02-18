// message-generator.js
// This script generates WhatsApp messages based on predefined templates.

function generateMessage(template, data) {
    let message = template;
    for (const key in data) {
        message = message.replace(`{{${key}}}`, data[key]);
    }
    return message;
}

// Example usage:
const template = "Hello {{name}}, your order {{orderID}} is ready!";
const data = { name: "John Doe", orderID: "12345" };
console.log(generateMessage(template, data));