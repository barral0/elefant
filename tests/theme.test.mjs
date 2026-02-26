import { test } from 'node:test';
import assert from 'node:assert';
import { hexToHsl } from '../js/utils.js';

test('hexToHsl converts hex string to HSL string', () => {
    // Test case 1: Red
    // #ff0000 -> 255, 0, 0
    // Max=1, Min=0, d=1
    // l = 0.5
    // s = 1 / (1 - 0) = 1 -> 100%
    // h = (0 - 0) / 1 + 4 = 4; 4 * 60 = 240? No wait, logic check:
    // if max == r (1): h = (g-b)/d + (g<b?6:0) -> (0-0)/1 = 0 -> 0 deg. Correct.
    // wait the code says: if (max === r) h = ((g - b) / d + 6) % 6;
    // (0-0)/1 + 6 = 6; 6 % 6 = 0. Correct.

    // Let's use the values from the existing code logic logic for verification.

    // Case 1: #ff0000 (Red) -> hsl(0, 100%, 50%)
    assert.strictEqual(hexToHsl('#ff0000'), '0,100%,50%');

    // Case 2: #00ff00 (Green) -> hsl(120, 100%, 50%)
    assert.strictEqual(hexToHsl('#00ff00'), '120,100%,50%');

    // Case 3: #0000ff (Blue) -> hsl(240, 100%, 50%)
    assert.strictEqual(hexToHsl('#0000ff'), '240,100%,50%');

    // Case 4: #ffffff (White) -> hsl(0, 0%, 100%)
    // r=1, g=1, b=1. max=1, min=1, d=0.
    // l=1. s=0. h=0.
    assert.strictEqual(hexToHsl('#ffffff'), '0,0%,100%');

    // Case 5: #000000 (Black) -> hsl(0, 0%, 0%)
    // r=0, g=0, b=0. max=0, min=0, d=0.
    // l=0. s=0. h=0.
    assert.strictEqual(hexToHsl('#000000'), '0,0%,0%');

    // Case 6: #808080 (Gray) -> hsl(0, 0%, 50%)
    // r=0.5, g=0.5, b=0.5. d=0.
    // l=0.5. s=0. h=0.
    assert.strictEqual(hexToHsl('#808080'), '0,0%,50%');

    // Case 7: Arbitrary color #7c4dff (Violet from theme.js default)
    // r=124/255=0.486, g=77/255=0.302, b=255/255=1
    // max=1(b), min=0.302(g), d=0.698
    // l = (1+0.302)/2 = 0.651
    // s = 0.698 / (1 - |2*0.651 - 1|) = 0.698 / (1 - 0.302) = 0.698/0.698 = 1.
    // h (max=b) = (r-g)/d + 4 = (0.486-0.302)/0.698 + 4 = 0.184/0.698 + 4 = 0.26 + 4 = 4.26
    // h * 60 = 255.6 -> 256?
    // Let's check the code's math exactly.
    // The default in theme.js says '250,100%,65%' for violet?
    // Wait, the default accent in theme.js is '250,100%,65%' but the HTML has value="#7c4dff" for custom.
    // Let's see if #7c4dff maps to 250,100%,65%.

    // Actually, I should just implement the logic exactly as it is in the file first to ensure parity.
});
