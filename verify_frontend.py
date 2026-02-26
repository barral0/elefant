from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Route external resources to avoid timeouts
        page.route("**/*", lambda route: route.continue_())
        page.route("https://fonts.googleapis.com/**", lambda route: route.abort())
        page.route("https://fonts.gstatic.com/**", lambda route: route.abort())
        page.route("https://cdn.jsdelivr.net/**", lambda route: route.abort())
        page.route("https://cdnjs.cloudflare.com/**", lambda route: route.abort())

        # Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:8000")

        # Wait for app to load
        page.wait_for_selector(".app-layout")

        # Check initial state (default note loaded)
        print("Checking initial state...")
        page.wait_for_selector("#editor")
        page.wait_for_selector("#preview")

        # Verify default content is loaded (implies loadActiveItem worked)
        title_input = page.locator("#note-title")
        expect_title = "Welcome.md"
        # Wait for value to be populated
        page.wait_for_function(f"document.getElementById('note-title').value.includes('{expect_title}')")

        print("Initial load verified.")

        # Create a new note to test file loading
        print("Creating new note...")
        page.click("#new-note-btn")

        # Verify new note loaded
        page.wait_for_function("document.getElementById('note-title').value.includes('Untitled')")
        print("New note creation verified.")

        # Take screenshot
        os.makedirs("verification", exist_ok=True)
        screenshot_path = "verification/app_state.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
