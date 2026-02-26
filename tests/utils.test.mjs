import { test, describe } from 'node:test';
import assert from 'node:assert';
import { hslToHex } from '../js/utils.js';

describe('hslToHex', () => {
    test('converts basic colors correctly', () => {
        // Red: hsl(0, 100%, 50%) -> #ff0000
        assert.strictEqual(hslToHex('0,100,50'), '#ff0000');
        // Green: hsl(120, 100%, 50%) -> #00ff00
        assert.strictEqual(hslToHex('120,100,50'), '#00ff00');
        // Blue: hsl(240, 100%, 50%) -> #0000ff
        assert.strictEqual(hslToHex('240,100,50'), '#0000ff');
    });

    test('converts default accent color correctly', () => {
        // Default accent: 250,100%,65%
        // The previous calculation/expectation was #7c4dff, but the actual output is #6a4dff.
        // Let's verify if #6a4dff is correct for HSL(250, 100%, 65%).
        // H=250, S=100%, L=65%
        // H=250/360, S=1, L=0.65

        // C = (1 - |2L - 1|) * S = (1 - |1.3 - 1|) * 1 = (1 - 0.3) = 0.7
        // X = C * (1 - |(H/60) mod 2 - 1|)
        // H' = 250/60 = 4.1666...
        // H' mod 2 = 0.1666...
        // X = 0.7 * (1 - |0.1666... - 1|) = 0.7 * (1 - 0.8333...) = 0.7 * 0.1666... = 0.1166...
        // m = L - C/2 = 0.65 - 0.35 = 0.3

        // (R,G,B) match (X, 0, C) + m ?? No, 250 is between 240 and 300 -> (X, 0, C) is incorrect order?
        // 240 <= H < 300: (R,G,B) = (X+m, 0+m, C+m)
        // R = 0.1166... + 0.3 = 0.4166... -> * 255 = 106.25 -> 0x6A
        // G = 0 + 0.3 = 0.3 -> * 255 = 76.5 -> 0x4C (wait, 76.5 rounds to 77 -> 0x4D)
        // B = 0.7 + 0.3 = 1.0 -> * 255 = 255 -> 0xFF

        // Result: #6A4DFF.
        // So the function implementation is correct mathematically, and my expectation was slightly off or based on a different tool's rounding.
        assert.strictEqual(hslToHex('250,100,65'), '#6a4dff');
    });

    test('handles edge case colors (black/white)', () => {
        // Black: hsl(0, 0%, 0%) -> #000000
        assert.strictEqual(hslToHex('0,0,0'), '#000000');
        // White: hsl(0, 0%, 100%) -> #ffffff
        assert.strictEqual(hslToHex('0,0,100'), '#ffffff');
    });

    test('handles input with percentage signs', () => {
        // The implementation uses parseFloat, which parses "100%" as 100.
        assert.strictEqual(hslToHex('0,100%,50%'), '#ff0000');
        assert.strictEqual(hslToHex('240,100%,50%'), '#0000ff');
    });

    test('handles variations in spacing', () => {
        // "0, 100, 50" (spaces after commas)
        // split(',') gives ["0", " 100", " 50"]
        // parseFloat handles leading spaces fine.
        assert.strictEqual(hslToHex('0, 100, 50'), '#ff0000');
    });
});
