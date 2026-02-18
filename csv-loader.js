cat > csv-loader.js << 'EOF'
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',').map(part => part.trim());

        if (parts.length >= 3) {
            const product = {
                id: `prod_${Date.now()}_${i}`,
                product_name: parts[0],
                price_usd: parseFloat(parts[1]) || 0,
                available_quantity: parseInt(parts[2]) || 0,
            };

            if (product.product_name && product.price_usd > 0 && product.available_quantity >= 0) {
                products.push(product);
            }
        }
    }

    return products;
}

function loadCSVFile(file, callback) {
    if (!file) {
        console.error('No file selected');
        return;
    }

    if (!file.name.endsWith('.csv')) {
        alert('⚠️ Please upload a CSV file');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const csvText = event.target.result;
            const products = parseCSV(csvText);

            if (products.length === 0) {
                alert('⚠️ No valid products found in CSV');
                return;
            }

            saveProducts(products);

            if (callback) {
                callback(products);
            }

            console.log(`✓ Loaded ${products.length} products from CSV`);
        } catch (error) {
            console.error('CSV parsing error:', error);
            alert('❌ Error parsing CSV file');
        }
    };

    reader.onerror = function () {
        console.error('File reading error');
        alert('❌ Error reading file');
    };

    reader.readAsText(file);
}

function getCSVTemplate() {
    return `product_name,price_usd,available_quantity
Banana,0.50,100
Tomato,1.25,50
Bread,2.00,30
Milk 1L,3.50,20
Eggs (dozen),5.00,15
Rice 5kg,12.00,10
Oil 1L,4.50,8`;
}
EOF
