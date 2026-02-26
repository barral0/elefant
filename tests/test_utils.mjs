import { strict as assert } from 'node:assert';
import { formatDate } from '../js/utils.js';

// Store original methods
const originalToLocaleDateString = Date.prototype.toLocaleDateString;
const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;

try {
    console.log('Testing formatDate...');

    let timeOptions = null;

    // Mock Date methods for deterministic output
    Date.prototype.toLocaleDateString = () => '1/1/2023';
    Date.prototype.toLocaleTimeString = (locale, options) => {
        timeOptions = options;
        return '12:00 PM';
    };

    const ts = new Date('2023-01-01T12:00:00Z').getTime();
    const result = formatDate(ts);

    assert.equal(result, '1/1/2023 12:00 PM', 'Formatted date should match expected string');
    assert.deepEqual(timeOptions, { hour: '2-digit', minute: '2-digit' }, 'Should use correct time formatting options');

    console.log('✅ formatDate test passed');

} catch (error) {
    console.error('❌ formatDate test failed:', error);
    process.exit(1);
} finally {
    // Restore original methods
    Date.prototype.toLocaleDateString = originalToLocaleDateString;
    Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
}
