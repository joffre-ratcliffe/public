const crypto = require('crypto');

/**
 * Recursively sorts object keys so that JSON.stringify 
 * always produces the same string for the same data.
 */
function sortObjectKeys(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
    return Object.keys(obj)
        .sort()
        .reduce((sorted, key) => {
            sorted[key] = sortObjectKeys(obj[key]);
            return sorted;
        }, {});
}

// 1. Sort the components to ensure consistency
const sortedComponents = sortObjectKeys(components);

// 2. Convert to string
const rawString = JSON.stringify(sortedComponents);

// 3. Generate SHA-256 Hash
const rec_hash = crypto
    .createHash('sha256')
    .update(rawString)
    .digest('hex');

console.log(`Deterministic Hash ID: ${rec_hash}`);
