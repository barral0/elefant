
from playwright.sync_api import sync_playwright

def verify_menus(page):
    # Navigate to local server
    page.goto("http://localhost:8080")

    # Wait for editor to be visible
    page.wait_for_selector("#editor")

    # Type some text
    page.fill("#editor", "Test content for clipboard verification")

    # Select text
    page.eval_on_selector("#editor", "el => { el.selectionStart = 0; el.selectionEnd = 4; }")

    # Open context menu (right click)
    page.click("#editor", button="right")

    # Take screenshot of the context menu
    page.screenshot(path="verification_screenshot.png")

    # We can't easily verify clipboard content in headless mode without permissions,
    # but the goal here is mainly to ensure no crash and UI is still responsive.
    # The actual clipboard logic was verified with the unit test `reproduce_issue.mjs`.

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    verify_menus(page)
    browser.close()
