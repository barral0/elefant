import { hexToHsl } from '../js/utils.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function testHexToHsl() {
    console.log("Testing hexToHsl...");

    const testCases = [
        { hex: '#ff0000', expected: '0,100%,50%' }, // Red
        { hex: '#00ff00', expected: '120,100%,50%' }, // Green
        { hex: '#0000ff', expected: '240,100%,50%' }, // Blue
        { hex: '#ffffff', expected: '0,0%,100%' }, // White
        { hex: '#000000', expected: '0,0%,0%' }, // Black
        { hex: '#808080', expected: '0,0%,50%' }, // Grey
        { hex: '#7c4dff', expected: '256,100%,65%' }, // Custom Purple
    ];

    let passed = 0;
    for (const test of testCases) {
        try {
            const result = hexToHsl(test.hex);
            assert(result === test.expected, `Expected ${test.expected} for ${test.hex}, but got ${result}`);
            passed++;
        } catch (e) {
            console.error(`FAILED: ${test.hex} - ${e.message}`);
        }
    }

    if (passed === testCases.length) {
        console.log(`All ${passed} tests passed!`);
    } else {
        console.error(`${testCases.length - passed} tests failed.`);
        process.exit(1);
    }
}

testHexToHsl();
